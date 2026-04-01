import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { reverseImageSearch, siphonHub } from '@/connectors';
import { createHash } from 'crypto';

function generateProvenanceHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

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
            return NextResponse.json({ success: true, message: 'No visual target', facialMatches: [] });
        }

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'agent_start',
                query: '🧠 Deploying [Visual Intelligence] node — Biometric Siphoning active...',
                resultCount: 0
            }
        }).catch(() => {});

        const imageUrl = investigation.subjectImageUrl;
        const isDataUrl = imageUrl.startsWith('data:');
        
        console.log(`[SCAN:VISUAL] Initiating visual recon. isDataUrl=${isDataUrl}, urlLength=${imageUrl.length}`);

        // Run both connectors concurrently
        const [faceCheckResult, siphonResult] = await Promise.all([
            reverseImageSearch(imageUrl).catch((e) => {
                console.error('[SCAN:VISUAL] reverseImageSearch failed:', e.message);
                return null;
            }),
            siphonHub(imageUrl).catch((e) => {
                console.error('[SCAN:VISUAL] siphonHub failed:', e.message);
                return null;
            })
        ]);

        const allResults = [
            ...(faceCheckResult?.results || []),
            ...(siphonResult?.results || [])
        ];

        console.log(`[SCAN:VISUAL] Raw results: ${allResults.length} total`);

        // Deduplicate by URL, and skip advisory/placeholder cards
        const seenUrls = new Set<string>();
        const uniqueResults = allResults.filter(r => {
            if (!r.url || seenUrls.has(r.url)) return false;
            if (r.confidenceScore === 0) return false; // skip advisory cards
            if ((r.metadata as any)?.source === 'advisory') return false;
            seenUrls.add(r.url);
            return true;
        });

        // ── PERSIST TO DATABASE ──────────────────────────────────────────────
        // This is the critical step that was missing — visual results must be
        // written to the evidence table so the Findings tab shows them.
        if (uniqueResults.length > 0) {
            const evidenceItems = uniqueResults.map(res => ({
                investigationId,
                title: (res.title || 'Visual Intelligence Discovery').slice(0, 500),
                content: (res.description || 'Biometric visual match identified.').slice(0, 5000),
                sourceUrl: res.url || null,
                type: 'url',
                tags: 'image_search',
                confidenceScore: res.confidenceScore ?? 0.9,
                confidenceLabel: res.confidenceLabel ?? 'HIGH',
                isVerified: res.isVerified ?? false,
                provenanceHash: generateProvenanceHash(`${investigationId}:${res.url}:${res.title}`),
                captureTimestamp: new Date(),
                metadata: {
                    ...(res.metadata || {}),
                    platform: res.platform || 'Visual Intel',
                    source: 'visual_scan',
                    isDataUrl,
                } as any
            }));

            try {
                await (prisma.evidence as any).createMany({
                    data: evidenceItems,
                    skipDuplicates: true
                });
                console.log(`[SCAN:VISUAL] Persisted ${evidenceItems.length} visual evidence records to DB.`);
            } catch (dbErr: any) {
                console.error('[SCAN:VISUAL] Batch persist failed, falling back to sequential:', dbErr.message);
                for (const item of evidenceItems) {
                    await prisma.evidence.create({ data: item }).catch(() => {});
                }
            }
        }

        // ── MAP FOR IN-MEMORY FacialMatch UI (Analysis Tab) ─────────────────
        const facialMatches = uniqueResults.map(res => ({
            platform: res.platform || 'Visual Intel',
            confidence: res.confidenceScore ?? 0.9,
            score: Math.round((res.confidenceScore ?? 0.9) * 100),
            url: res.url,
            thumbnailBase64: res.metadata?.thumbnailBase64 || undefined,
            timestamp: new Date().toISOString(),
            isVerified: res.isVerified ?? res.confidenceLabel === 'VERIFIED',
            extractedIdentity: res.metadata?.extractedIdentity || null,
            metadata: { ...(res.metadata || {}), title: res.title, description: res.description }
        }));

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'system',
                query: `[NODE] Visual Intelligence complete. Persisted ${uniqueResults.length} biometric leads.`,
                resultCount: uniqueResults.length
            }
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            message: 'Visual sweep complete',
            found: uniqueResults.length,
            facialMatches
        });

    } catch (error: any) {
        console.error('[SCAN:VISUAL] Fatal error:', error);
        await prisma.searchLog.create({
            data: {
                investigationId,
                userId: user.id,
                connectorType: 'system_error',
                query: `[FATAL] Visual Intelligence failed: ${error.message}`,
                resultCount: 0
            }
        }).catch(() => {});
        return NextResponse.json({ error: 'Visual engine failed', details: error?.message }, { status: 500 });
    }
}
