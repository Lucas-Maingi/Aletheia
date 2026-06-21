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
        const { message, imageUrl, investigationId, selectedInvestigationIds, mode, history } = body as { 
            message?: string; 
            imageUrl?: string; 
            investigationId?: string;
            selectedInvestigationIds?: string[];
            mode?: 'support' | 'copilot';
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

        // Mode-Based System Prompt Construction
        let systemPrompt = "";
        let isConversational = false;

        // CASE 1: Platform Support & Customer Guide
        if (mode === 'support') {
            isConversational = true;
            systemPrompt = `You are Aletheia Customer Support & Product Guide AI. You help users navigate Aletheia and answer questions about the platform, features, setup, and pricing.
            Keep your responses professional, concise, and structured. Use Markdown formatting.
            
            Here are the key platform facts you must use:
            1. WHAT IS ALETHEIA: An agentic OSINT & threat intelligence platform to track public digital footprints.
            2. MISSION OPERATIONS (SIDEBAR LINKS):
               - Dashboard Overview: High-level dashboard status and recent threat metrics.
               - Start Investigation: Click this prominent button to deploy single-target sweeps (emails, domains, usernames, names, phone numbers, or vehicle plates).
               - AI Assistant: The current co-pilot chat window. Swap modes in the header: "General Support" or "Case Co-Pilot" to analyze active cases.
               - Intelligence Archive: The historical sweep database (/dashboard/investigations) where all past scans are stored.
            3. AUTOMATED RECON (PREMIUM FEATURES):
               - Bulk Processing: Ingest CSV/JSON logs to run massively parallel sweeps. Requires Elite tier.
               - Watchlists: 24/7 background monitors that alert on footprint changes. Requires Pro tier.
            4. PROFILE & SETTINGS:
               - Accessible via the user avatar circle icon in the top-right of the header. Includes System Configuration, Identity Profile, and Global Settings.
            5. VEHICLE OSINT:
               - Supports looking up license plates (e.g., "plate: ABC-1234" or "vehicle: ABC-1234") or uploading an image of a car/plate. Visual LPR automatically extracts plates via Gemini and links registered owners. Requires Pro or higher.
            6. PRICING & TIERS (LIFETIME DEALS):
               - Analyst Pro ($299): Unlimited investigations, breach DB, username enum, WHOIS, watchlists (10 nodes).
               - Command Center ($599): Everything in Pro + visual LPR, facial matching, reverse-image, dark web, crypto tracing, team seats (3), watchlists (50 nodes).
               - Agency Arsenal ($999): Everything in Command + batch ingestion, white-label, webhooks, custom connectors, unlimited seats.
            7. ZERO-KNOWLEDGE: All investigation parameters are encrypted client-side. Zero tracker logs are retained by Aletheia on search content.`;
        }
        
        // CASE 2: Investigation Case Co-Pilot (Supports single or multiple selected cases)
        const isCopilotMode = mode === 'copilot' || (!mode && investigationId);
        const targetIds = [investigationId, ...(selectedInvestigationIds || [])].filter(Boolean) as string[];
        if (isCopilotMode && targetIds.length > 0) {
            isConversational = true;
            
            const investigations = await prisma.investigation.findMany({
                where: { id: { in: targetIds }, userId: user.id },
                include: { evidence: { take: 30 }, entities: { take: 20 } }
            });

            let context = "";
            for (const inv of investigations) {
                context += `
Case File: "${inv.title}"
- Target Details: ${inv.subjectName || 'N/A'} | ${inv.subjectEmail || 'N/A'} | ${inv.subjectUsername || 'N/A'} | ${inv.subjectPhone || 'N/A'}
- Discovered Entities: ${inv.entities.map(e => `${e.type}: ${e.value}`).join(', ') || 'None'}
- Discovered Evidence Artifacts:
${inv.evidence.map(e => `  * [${e.confidenceLabel || 'UNRATED'}] ${e.title}: ${e.content.slice(0, 400)}`).join('\n') || '  * None'}
--------------------------------------------------
`;
            }

            systemPrompt = `You are Aletheia, the Lead Threat Intelligence Co-Pilot. You are analyzing active investigation case files for the analyst.
            Analyze these case files, answer questions, identify patterns or relationships across the cases, and suggest recursive search pivots.
            Keep your tone clinical, data-driven, and highly analytical.
            
            CRITICAL INSTRUCTION: When suggesting a new lead/artifact (e.g. an email, username, domain, phone number, plate, or IP that hasn't been scanned), explicitly present it as an interactive pivot link using the format: \`[Deploy Sweep: target_value](sandbox-pivot:target_value)\`. This will render an interactive deploy button for the user. Do not use standard markdown links for pivots, always use the sandbox-pivot scheme.
            
            Investigation Context:
            ${context}`;
        }

        // If a conversational prompt was constructed, execute Gemini directly and return
        if (isConversational && apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-1.0-pro"];
            
            let responseText = "";
            let lastError;

            for (const modelName of models) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const chat = model.startChat({
                        history: history || [],
                        generationConfig: { maxOutputTokens: 1200 }
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

        // BACKWARDS COMPATIBILITY: Classic Chat-to-Scan trigger
        const chatEmail = user.email || `guest-${user.id}@aletheia.local`;
        try {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: { id: user.id, email: chatEmail },
            });
        } catch {
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
                status: 'pending',
                userId: user.id,
                subjectName: detection?.parsed.subjectName ? sanitize(detection.parsed.subjectName) : null,
                subjectEmail: detection?.parsed.subjectEmail ? sanitize(detection.parsed.subjectEmail) : null,
                subjectUsername: detection?.parsed.subjectUsername ? sanitize(detection.parsed.subjectUsername) : null,
                subjectDomain: detection?.parsed.subjectDomain ? sanitize(detection.parsed.subjectDomain) : null,
                subjectPhone: detection?.parsed.subjectPhone ? sanitize(detection.parsed.subjectPhone) : null,
                subjectImageUrl: imageUrl ? sanitize(imageUrl) : null,
            },
        });

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
