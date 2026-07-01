import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { createHash } from 'crypto';
import { 
    usernameSearch, 
    googleDorks, 
    domainSearch, 
    breachSearch, 
    peopleSearch,
    ipinfo,
    whatsMyName,
    ecosystemSearch,
    registrationScout,
    phoneLookup
} from '@/connectors';
import { calculateConfidence, getConfidenceLabel } from '@/lib/osint/registry';

function generateProvenanceHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const user = await getEffectiveUserId();
    const params = await props.params;
    const investigationId = params.id;

    if (!isValidUuid(investigationId)) {
        return NextResponse.json({ error: 'Invalid identifier format' }, { status: 400 });
    }

    try {
        const investigation = await prisma.investigation.findUnique({
            where: { id: investigationId },
        });

        if (!investigation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (investigation.userId !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

        // Initialize state
        await prisma.investigation.update({
            where: { id: investigationId },
            data: { status: 'active' },
        });

        const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
        const isPro = userRecord?.plan === 'pro' || userRecord?.plan === 'lifetime' || user.isGuest;

        const startTime = Date.now();
        const HOBBY_LIMIT = 57000;

        // Determine targets — NEVER fall back to investigation title (it's usually "New Target")
        const GENERIC_TITLES = new Set([
            'new target', 'untitled', 'unknown', 'investigation', 'target', 'subject',
            'new investigation', 'untitled investigation', 'new', 'n/a', 'none'
        ]);

        const rawPrimary =
            investigation.subjectEmail ||
            investigation.subjectUsername ||
            investigation.subjectName ||
            investigation.subjectPhone;

        let primaryTarget: string | null = rawPrimary;

        // If only a title exists (image-only investigation), skip core scan entirely
        if (!primaryTarget) {
            await prisma.searchLog.create({
                data: { investigationId, userId: user.id, connectorType: 'system', query: '[SYS] No text identifiers found. Core sweep skipped — Visual Intelligence will handle this target.' }
            }).catch(() => {});
            return NextResponse.json({ success: true, message: 'No text target — image-only investigation. Proceeding to visual scan.', phase: 'core_skipped' });
        }

        // Also reject generic placeholders
        if (GENERIC_TITLES.has(primaryTarget.toLowerCase().trim())) {
            await prisma.searchLog.create({
                data: { investigationId, userId: user.id, connectorType: 'system', query: `[SYS] Target "${primaryTarget}" is a generic placeholder. Core sweep skipped.` }
            }).catch(() => {});
            return NextResponse.json({ success: true, message: 'Generic target skipped.', phase: 'core_skipped' });
        }

        const safeRun = async (label: string, fn: () => Promise<any>) => {
            if (Date.now() - startTime > HOBBY_LIMIT) return [];

            await prisma.searchLog.create({
                data: { investigationId, userId: user.id, connectorType: 'agent_start', query: `Deploying [${label}] node...` }
            }).catch(() => {});

            try {
                const result = await fn();
                const resultCount = result?.results?.length || 0;

                await prisma.searchLog.create({
                    data: { investigationId, userId: user.id, connectorType: 'system', query: resultCount > 0 ? `[NODE] ${label} extraction successful. Found ${resultCount} items.` : `[NODE] ${label} analysis complete. No data in this sector.`, resultCount }
                }).catch(() => {});

                if (!result?.results || result.results.length === 0) return [];

                const evidenceItems = result.results.slice(0, 30).filter((r: any) => r.category !== 'system').map((res: any) => {
                    const confidenceScore = calculateConfidence(label.toLowerCase().replace(/\s+/g, '_'), false, res.confidenceScore);
                    const confidenceLabel = getConfidenceLabel(confidenceScore);
                    return {
                        investigationId,
                        title: (res.title || `Intelligence Discovery — ${label}`).slice(0, 500),
                        content: (res.description || 'OSINT extract').slice(0, 5000),
                        sourceUrl: res.url || null,
                        type: 'url',
                        tags: res.category || 'general',
                        confidenceScore: confidenceScore / 100,
                        confidenceLabel,
                        provenanceHash: generateProvenanceHash(res.description || ''),
                        captureTimestamp: new Date(),
                    };
                });

                if (evidenceItems.length > 0) {
                    await (prisma.evidence as any).createMany({ data: evidenceItems, skipDuplicates: true }).catch(() => {});
                }

                await prisma.searchLog.create({
                    data: { investigationId, userId: user.id, connectorType: 'system', query: `[PULSE] ${label} relay sync complete. Sustaining heartbeat...` }
                }).catch(() => {});

                return evidenceItems;
            } catch (err: any) {
                await prisma.searchLog.create({
                    data: { investigationId, userId: user.id, connectorType: 'system_error', query: `[ERROR] ${label} node failure: ${err.message}` }
                }).catch(() => {});
                return [];
            }
        };

        const phase1: Promise<any>[] = [];

        if (primaryTarget) {
            const isEmail = primaryTarget.includes('@');
            const isDomain = primaryTarget.includes('.') && !isEmail;
            
            if (!isEmail && !isDomain) phase1.push(safeRun('Username Search', () => usernameSearch(primaryTarget)));
            phase1.push(safeRun('Intelligence Dork', () => googleDorks({ name: investigation.subjectName || primaryTarget || undefined, username: investigation.subjectUsername || primaryTarget || undefined, email: investigation.subjectEmail || undefined })));

            if (isPro && (investigation.subjectName || investigation.subjectUsername)) {
                phase1.push(safeRun('People Search', () => peopleSearch(investigation.subjectName || investigation.subjectUsername || primaryTarget)));
            }
        }

        const domainMatch = investigation.subjectDomain || (primaryTarget.includes('.') && !primaryTarget.includes('@') ? primaryTarget : undefined) || investigation.subjectEmail?.split('@')[1];
        if (domainMatch && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domainMatch)) {
            phase1.push(safeRun('Domain Search', () => domainSearch(domainMatch)));
        }

        const breachMatch = investigation.subjectEmail || (primaryTarget.includes('@') ? primaryTarget : undefined);
        if (breachMatch) phase1.push(safeRun('Breach Search', () => breachSearch(breachMatch)));

        if (primaryTarget && primaryTarget.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)) {
            phase1.push(safeRun('IPinfo', () => ipinfo(primaryTarget)));
        }
        
        if (investigation.subjectUsername || (primaryTarget && !primaryTarget.includes('@') && !primaryTarget.includes('.'))) {
            phase1.push(safeRun('WhatsMyName', () => whatsMyName(investigation.subjectUsername || primaryTarget)));
        }

        if (primaryTarget && primaryTarget.includes('@')) {
            phase1.push(safeRun('Registration Scout', () => registrationScout(primaryTarget)));
        }

        if (primaryTarget && !primaryTarget.includes('@')) {
            // Note: Ecosystem Discovery takes ~15 seconds.
            phase1.push(safeRun('Ecosystem Discovery', () => ecosystemSearch(primaryTarget)));
        }

        const phoneTarget = investigation.subjectPhone;
        if (phoneTarget) {
            phase1.push(safeRun('Phone Intelligence', () => phoneLookup(phoneTarget)));
        }

        // Chunk execution
        const p1Chunks = [];
        for (let i = 0; i < phase1.length; i += 3) p1Chunks.push(phase1.slice(i, i + 3));

        for (const chunk of p1Chunks) {
            if (Date.now() - startTime > HOBBY_LIMIT) {
                console.warn('[SCAN:CORE] Hit time limit during phase 1 execution.');
                break;
            }
            await Promise.allSettled(chunk);
        }

        await prisma.searchLog.create({
            data: { investigationId, userId: user.id, connectorType: 'system', query: 'Phase 1 Intelligence Sweep Completed. Advancing...' }
        }).catch(() => {});

        return NextResponse.json({ success: true, message: "Core sweep complete", phase: 'core' }, { status: 200 });

    } catch (error: any) {
        console.error('Core scan failed:', error);
        return NextResponse.json({ error: 'Core engine failed', details: error?.message }, { status: 500 });
    }
}
