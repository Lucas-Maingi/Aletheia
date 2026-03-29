import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { reverseImageSearch } from '@/connectors';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const user = await getEffectiveUserId();
    const params = await props.params;
    const investigationId = params.id;

    if (!isValidUuid(investigationId)) {
        return NextResponse.json({ error: 'Invalid identifier' }, { status: 400 });
    }

    try {
        const investigation = await prisma.investigation.findUnique({
            where: { id: investigationId },
        });

        if (!investigation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (investigation.userId !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

        if (!investigation.subjectImageUrl) {
            return NextResponse.json({ success: true, message: "No visual target", facialMatches: [] }, { status: 200 });
        }

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'agent_start',
                query: 'Deploying [Biometric AI Matcher] node...',
                resultCount: 0
            }
        }).catch(() => {});

        console.log(`[SCAN:VISUAL] Starting FaceCheck for ${investigation.subjectImageUrl}`);
        const result = await reverseImageSearch(investigation.subjectImageUrl);
        
        const facialMatches = result?.results || [];

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'system',
                query: `[NODE] Biometric AI analysis complete. Found ${facialMatches.length} facial matches.`,
                resultCount: facialMatches.length
            }
        }).catch(() => {});

        // Note: The UI component (FacialAnalysis) currently expects facial matches to be returned
        // directly in the response so it can store them in Context, rather than writing them
        // to Evidence. This preserves the UI implementation.
        
        return NextResponse.json({ 
            success: true, 
            message: "Visual sweep complete", 
            facialMatches 
        }, { status: 200 });

    } catch (error: any) {
        console.error('Visual scan failed:', error);
        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'system_error',
                query: `[FATAL] Biometric matcher failed: ${error.message}`,
                resultCount: 0
            }
        }).catch(() => {});

        return NextResponse.json({ error: 'Visual engine failed', details: error?.message }, { status: 500 });
    }
}
