import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitize, isSafeQuery } from '@/lib/security';

function detectInputType(value: string): {
    type: 'email' | 'domain' | 'phone' | 'crypto_btc' | 'crypto_eth' | 'username' | 'name' | 'chat';
    parsed: {
        subjectName?: string;
        subjectEmail?: string;
        subjectUsername?: string;
        subjectDomain?: string;
        subjectPhone?: string;
    };
} {
    const v = value.trim();
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/.test(v))
        return { type: 'crypto_btc', parsed: { subjectUsername: v } };
    if (/^0x[a-fA-F0-9]{40}$/i.test(v))
        return { type: 'crypto_eth', parsed: { subjectUsername: v } };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return { type: 'email', parsed: { subjectEmail: v } };
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))
        return { type: 'domain', parsed: { subjectDomain: v } };
    if (/^\+?[0-9\s-]{8,}$/.test(v))
        return { type: 'phone', parsed: { subjectPhone: v } };
    if (v.includes(' '))
        return { type: 'name', parsed: { subjectName: v } };
    
    // If it's a longer sentence, it's probably a conversational query
    if (v.split(' ').length > 2) return { type: 'chat', parsed: {} };
    
    return { type: 'username', parsed: { subjectUsername: v } };
}

export async function POST(req: NextRequest) {
    const user = await getEffectiveUserId();

    try {
        const body = await req.json();
        const { message, imageUrl, investigationId, history } = body as { 
            message?: string; 
            imageUrl?: string; 
            investigationId?: string;
            history?: { role: 'user' | 'model', parts: { text: string }[] }[]
        };

        if (!message?.trim() && !imageUrl) {
            return NextResponse.json({ error: 'Please provide a query or image.' }, { status: 400 });
        }

        const query = message?.trim() || '';

        if (!isSafeQuery(query)) {
            return NextResponse.json({ error: 'Potentially malicious input detected.' }, { status: 400 });
        }

        const apiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY;

        // CASE 1: CONVERSATIONAL FOLLOW-UP
        if (investigationId) {
            const investigation = await prisma.investigation.findUnique({
                where: { id: investigationId },
                include: { evidence: { take: 50 }, entities: { take: 30 } }
            });

            if (!investigation) {
                return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
            }

            // OWNERSHIP CHECK (Dossier v18)
            if (investigation.userId !== user.id) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }

            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-1.0-pro"];
                
                const context = `
                    Target: ${investigation.title}
                    Evidence Found: ${investigation.evidence.map(e => `${e.title}: ${e.content.slice(0, 500)}...`).join('\n')}
                    Entities Detected: ${investigation.entities.map(e => `${e.type}: ${e.value}`).join(', ')}
                `;

                const systemPrompt = `You are Aletheia, an Agentic OSINT Analyst. You are discussing findings for an active investigation. 
                Use the following context to answer the user's questions or suggest new pivot vectors. 
                Keep it clinical, data-driven, and brief. 
                
                CRITICAL INSTRUCTION: When synthesizing evidence, explicitly extract and report real account details such as Profile Biographies, Creation Dates, Usernames, and Platform Identities. Do not just list titles; provide the rich contextual data found within the snippets.
                
                PIVOT DETECTION: If you identify a new lead (e.g., a specific email, username, or IP address that hasn't been scanned), explicitly suggest it in the format: [PIVOT: target_value]. This will allow the user to immediately deploy agents to that lead.
                
                Investigation Context:
                ${context}`;

                let responseText = "";
                let lastError;

                for (const modelName of models) {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const chat = model.startChat({
                            history: history || [],
                            generationConfig: { maxOutputTokens: 1000 }
                        });

                        const result = await chat.sendMessage(`${systemPrompt}\n\nUser Question: ${sanitize(query)}`);
                        responseText = result.response.text();
                        break;
                    } catch (err: any) {
                        console.warn(`[Chat API] Model ${modelName} failed:`, err.message);
                        lastError = err;
                        const isOverloaded = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('EXHAUSTED');
                        const isNotFound = err?.status === 404 || err?.message?.includes('not found');
                        if (isOverloaded || isNotFound) continue;
                        throw err;
                    }
                }

                if (!responseText) throw lastError || new Error("All analysis nodes are currently at capacity.");

                return NextResponse.json({ 
                    content: responseText,
                    role: 'agent',
                    status: 'complete'
                });
            }
        }

        // CASE 2: NEW INVESTIGATION
        const chatEmail = user.email || `guest-${user.id}@aletheia.local`;
        try {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: { id: user.id, email: chatEmail },
            });
        } catch {
            // User may already exist from scan route — that's fine
            const existing = await prisma.user.findUnique({ where: { id: user.id } }).catch(() => null);
            if (!existing) throw new Error('Cannot create user session');
        }

        const detection = query ? detectInputType(query) : null;
        const rawTitle = query ? sanitize(query.slice(0, 60)) : `Image Analysis`;
        const title = chatEmail.includes('guest') ? `Chat: ${rawTitle}` : `Chat: ${rawTitle}`;

        const investigation = await prisma.investigation.create({
            data: {
                title,
                description: `Initiated via Aletheia Chat interface`,
                status: 'pending', // Wait for scan to confirm active status
                userId: user.id,
                subjectName: detection?.parsed.subjectName ? sanitize(detection.parsed.subjectName) : null,
                subjectEmail: detection?.parsed.subjectEmail ? sanitize(detection.parsed.subjectEmail) : null,
                subjectUsername: detection?.parsed.subjectUsername ? sanitize(detection.parsed.subjectUsername) : null,
                subjectDomain: detection?.parsed.subjectDomain ? sanitize(detection.parsed.subjectDomain) : null,
                subjectPhone: detection?.parsed.subjectPhone ? sanitize(detection.parsed.subjectPhone) : null,
                subjectImageUrl: imageUrl ? sanitize(imageUrl) : null,
            },
        });

        // DOSSIER v28: DO NOT trigger scan from server.
        // Scan is synchronous (30-50s) and would block the chat response.
        // The chat page will trigger it via client-side fetch.

        return NextResponse.json({
            investigationId: investigation.id,
            detectedType: detection?.type || 'image',
            title,
            status: 'scanning'
        }, { status: 201 });

    } catch (error: any) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
