import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { summarizeFindings } from "@/lib/ai";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const user = await getEffectiveUserId();
    const params = await props.params;
    const investigationId = params.id;
    const customApiKey = req.headers.get('x-gemini-key') || undefined;

    if (!isValidUuid(investigationId)) {
        return NextResponse.json({ error: 'Invalid identifier format' }, { status: 400 });
    }

    try {
        const investigation = await prisma.investigation.findUnique({
            where: { id: investigationId },
        });

        if (!investigation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (investigation.userId !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'agent_start',
                query: 'Deploying [Gemini Synthesis Agent] node...',
                resultCount: 0
            }
        }).catch(() => {});

        // Fetch all generated evidence to summarize
        const allEvidence = await prisma.evidence.findMany({
            where: { investigationId },
            take: 100 // Cap to prevent LLM context overflow
        });

        let summary = '';
        try {
            console.log(`[SCAN:AI] Synthesizing ${allEvidence.length} evidence records.`);
            summary = await summarizeFindings(investigation.title, allEvidence, customApiKey) || '';
        } catch (aiErr: any) {
            console.error(`[SCAN:AI] Synthesis failed:`, aiErr.message);
            summary = `### AI Intelligence Synthesis\n\nThe scan discovered ${allEvidence.length} items. AI context generation encountered an error: ${aiErr?.message || 'Context limit exceeded'}. Please review the raw Evidence tab.`;
        }

        await prisma.report.create({
            data: {
                investigationId,
                title: `Intelligence Dossier — ${new Date().toLocaleDateString()}`,
                content: summary,
                format: 'markdown'
            }
        });

        // The entire process is complete.
        await prisma.investigation.update({
            where: { id: investigationId },
            data: { status: 'complete', updatedAt: new Date() },
        });

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'system',
                query: `[NODE] AI reporting engine compiled the final dossier successfully.`,
                resultCount: 1
            }
        }).catch(() => {});

        return NextResponse.json({ 
            success: true, 
            message: "Synthesis complete",
            status: 'complete'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Synthesis failed:', error);
        
        await prisma.investigation.update({
            where: { id: investigationId },
            data: { status: 'error', updatedAt: new Date() },
        });

        return NextResponse.json({ error: 'Synthesis engine failed', details: error?.message }, { status: 500 });
    }
}
