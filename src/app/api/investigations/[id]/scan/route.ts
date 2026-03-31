import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 60;
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { summarizeFindings } from "@/lib/ai";
import { captureScreenshot } from "@/lib/screenshot";
import { 
    usernameSearch, 
    googleDorks, 
    domainSearch, 
    breachSearch, 
    reverseImageSearch, 
    darkWebSearch, 
    interpolSearch, 
    cryptoSearch,
    peopleSearch,
    ipinfo,
    whatsMyName,
    securityTrails,
    ecosystemSearch,
    registrationScout,
    siphonHub
} from '@/connectors';
import { extractExif } from '@/connectors/exifMetadata';
import { FacialMatch } from '@/connectors/visualIntel';
import { calculateConfidence, getConfidenceLabel } from '@/lib/osint/registry';
import { createHash } from 'crypto';

// Generate SHA-256 hash of evidence content for immutability verification
function generateProvenanceHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

// Auto-archive a URL to Wayback Machine (fire-and-forget, won't block scan)
async function archiveUrl(url: string): Promise<string | null> {
    if (!url || url.startsWith('#')) return null;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`https://web.archive.org/save/${url}`, {
            method: 'GET',
            headers: { 'User-Agent': 'OpenVector-OSINT-Archiver/1.0' },
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timeout);
        if (res.ok || res.status === 302) {
            const location = res.headers.get('Content-Location') || res.headers.get('location');
            if (location) return `https://web.archive.org${location}`;
        }
        return null;
    } catch {
        return null;
    }
}



export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const user = await getEffectiveUserId();
    const params = await props.params;
    const investigationId = params.id;
    const customApiKey = req.headers.get('x-gemini-key') || undefined;
    const body = await req.json().catch(() => ({}));
    const isForce = body.force === true;

    if (!isValidUuid(investigationId)) {
        return NextResponse.json({ error: 'Invalid identifier format' }, { status: 400 });
    }

    // Ensure user exists locally for session tracking
    try {
        const userEmail = user.email || `guest-${user.id}@aletheia.local`;
        await prisma.user.upsert({
            where: { id: user.id },
            update: { updatedAt: new Date() },
            create: {
                id: user.id,
                email: userEmail,
                role: user.isGuest ? 'guest' : 'analyst',
                plan: user.isGuest ? 'free' : 'pro'
            }
        });
        // User exists by ID, proceed normally
    } catch (err: any) {
        const existing = await prisma.user.findUnique({ where: { id: user.id } }).catch(() => null);
        if (!existing) {
            console.error('[SCAN] Session Init Failure - user cannot be created:', err.message);
            return NextResponse.json({ error: 'Session initialization failed' }, { status: 500 });
        }
    }

    const startTime = Date.now();
    let facialMatches: FacialMatch[] = [];
    let investigation: any = null;

    try {
        // STRICT OWNERSHIP CHECK (Zero-Trust)
        investigation = await prisma.investigation.findUnique({
            where: { id: investigationId },
        });

        if (!investigation) {
            return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
        }

        if (investigation.userId !== user.id) {
            console.warn(`[Security] Unauthorized scan attempt on ${investigationId} by ${user.id}`);
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        // Dossier v87: Intelligent Re-scan Failsafe
        // If a scan is 'active' but hasn't been updated in 3 minutes, assume it's a dead process and allow reset.
        const STALE_THRESHOLD = 3 * 60 * 1000; // 3 minutes
        const isStale = (Date.now() - new Date(investigation.updatedAt).getTime()) > STALE_THRESHOLD;

        if ((investigation.status === 'active' || investigation.status === 'scanning') && !isStale) {
            console.log(`[SCAN] Scan status is active for ${investigationId}. Checking for telemetry...`);
            const existingLogs = await prisma.searchLog.findMany({
                where: { investigationId, connectorType: 'system' },
                take: 10,
                orderBy: { createdAt: 'asc' }
            });

            // Dossier v98: Only abort if we confirm the scan ACTUALLY started (has logs).
            // A status glitch without logs means it crashed and needs a hard reboot.
            if (existingLogs.length > 0) {
                console.log(`[SCAN] Telemetry verified. Returning existing channel.`);
                return NextResponse.json({ 
                    success: true, 
                    message: "Intelligence sweep already active", 
                    status: 'scanning',
                    initialLogs: existingLogs.map(l => `[SYS] ${l.query}`)
                }, { status: 200 });
            } else {
                console.log(`[SCAN] False active state detected (0 logs). Overriding and forcing engine reboot.`);
            }
        }

        if (isStale) {
            console.warn(`[SCAN] Stale process detected for ${investigationId}. Forcing engine reset.`);
        }

        // Initialize scan state synchronously
        await prisma.investigation.update({
            where: { id: investigationId },
            data: { status: 'active' },
        });

        // IF FORCE: Run only visual siphoning and return early
        if (isForce && investigation.subjectImageUrl) {
            console.log(`[SCAN] Forced Visual Recon triggered for: ${investigationId}`);
            
            // Run Siphon Hub in background
            (async () => {
                const siphonResults = await siphonHub(investigation.subjectImageUrl!);
                if (siphonResults.results.length > 0) {
                   await Promise.all(siphonResults.results.map(res => 
                        prisma.evidence.create({
                            data: {
                                investigationId,
                                title: res.title,
                                content: res.description, // Corrected field
                                sourceUrl: res.url,       // Corrected field
                                type: 'url',
                                confidenceScore: res.confidenceScore || 0,
                                confidenceLabel: res.confidenceLabel || 'MEDIUM',
                                metadata: {
                                    ...res.metadata,
                                    platform: res.platform || 'SiphonHub'
                                } as any
                            }
                        })
                   ));
                }
                
                await prisma.investigation.update({
                    where: { id: investigationId },
                    data: { status: 'completed' }
                });
            })();

            return NextResponse.json({ 
                success: true, 
                message: 'Forced Visual Recon triggered.',
                mode: 'visual_only'
            });
        }

        // CLEAR DATA & HANDSHAKE
        await Promise.all([
            prisma.evidence.deleteMany({ where: { investigationId } }),
            prisma.searchLog.deleteMany({ where: { investigationId } }),
            prisma.report.deleteMany({ where: { investigationId } }),
            prisma.entity.deleteMany({ where: { investigationId } })
        ]);

        // CRITICAL: Create the first logs SYNCHRONOUSLY before returning the response
        // This ensures the first poll or the immediate response has these logs.
        const handshakeLogs = [
            '🚀 Initializing Aletheia Intelligence Engine v2.5.0...',
            '📡 Phase 1: Global Footprint Sweep deploying...',
            '🔐 Secure Circuit Established. Agent handshaking complete.'
        ];

        // Create handshake logs SYNC so they appear immediately in UI
        await Promise.allSettled(handshakeLogs.map(q => 
            prisma.searchLog.create({
                data: {
                    investigationId,
                    userId: user.id,
                    connectorType: 'system',
                    query: q,
                    resultCount: 0
                }
            })
        ));
        
        console.log(`[SCAN] Handshake logs established for investigation ${investigationId}`);

        // DOSSIER v28: SYNCHRONOUS EXECUTION (DEFINITIVE)
        let scanResult: any = { found: 0 };
        try {
            const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
            // Grant Pro features to all analysts (including guests) for the best evaluation experience
            const isPro = userRecord?.plan === 'pro' || userRecord?.plan === 'lifetime' || user.isGuest;
            const { found, facialMatches: results } = await runFullScan(investigation, user.id, isPro, customApiKey, startTime);
            facialMatches = results;
            console.log(`[SCAN] Synchronous sweep completed. Found: ${found || 0}`);
            scanResult = { found };
        } catch (err: any) {
            console.error(`[SCAN] Sweep fatal error:`, err.message, err.stack);
            try {
                await prisma.searchLog.create({
                    data: {
                        investigationId,
                        userId: user.id,
                        connectorType: 'system_error',
                        query: `[FATAL] Engine collapse: ${err.message}`,
                        resultCount: 0
                    }
                });
                await prisma.investigation.update({
                    where: { id: investigationId },
                    data: { status: 'error', updatedAt: new Date() },
                });
            } catch (recoveryErr) {
                console.error(`[SCAN] Recovery failure:`, recoveryErr);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Intelligence sweep complete", 
            status: 'complete',
            found: scanResult?.found || 0,
            initialLogs: handshakeLogs.map(m => `[SYS] ${m}`)
        }, { status: 200 });

    } catch (error: any) {
        console.error('Scan initiation failed:', error);
        return NextResponse.json({ error: 'Scan engine failed to start', details: error?.message }, { status: 500 });
    }
}

async function runFullScan(investigation: any, userId: string, isPro: boolean, customApiKey?: string, startTime: number = Date.now()): Promise<{ found: number; facialMatches: FacialMatch[] }> {
    const investigationId = investigation.id;
    const HOBBY_LIMIT = 57000; // 57s
    let facialMatches: FacialMatch[] = [];

    try {
        // Track all evidence for AI synthesis later
        const allEvidence: any[] = [];

        // CORRELATION TARGETS
        const correlatedIdentifiers = {
            emails: new Set<{ value: string; sourceId?: string }>(),
            usernames: new Set<{ value: string; sourceId?: string }>(),
            domains: new Set<{ value: string; sourceId?: string }>(),
            crypto: new Set<{ value: string; sourceId?: string }>(),
            names: new Set<{ value: string; sourceId?: string }>(),
        };

        // FIDELITY & DE-DUPLICATION REGISTRY
        const processedUrls = new Set<string>();
        const processedHashes = new Set<string>();
        const USERNAME_BLOCKLIST = new Set(['gmail', 'outlook', 'hotmail', 'yahoo', 'apple', 'icloud', 'protonmail', 'proton', 'mail', 'live', 'me', 'msn', 'yandex', 'google', 'facebook', 'instagram', 'twitter', 'x', 'linkedin', 'github', 'reddit', 'medium', 'youtube', 'tiktok', 'pinned', 'user', 'admin']);
        const GENERIC_TARGETS = new Set(['new target', 'untitled', 'unknown', 'investigation', 'target', 'subject', 'search', 'placeholder', 'case', 'dossier', 'new investigation', 'untitled investigation']);

        // SAFETY: Only extract a primary target if it's NOT a generic system placeholder
        const getRawTarget = () => {
            const raw = investigation.subjectEmail || 
                        investigation.subjectUsername || 
                        investigation.subjectName || 
                        investigation.subjectPhone;
            
            if (!raw) return null;
            const clean = raw.toLowerCase().trim();
            // Generic safety check for Name/Username values
            if (GENERIC_TARGETS.has(clean) || clean.length < 2) return null;
            return raw;
        };

        let primaryTarget = getRawTarget();
        
        if (primaryTarget) {
            console.log(`[SCAN] Primary focus target: ${primaryTarget}`);
        } else {
            console.log(`[SCAN] No unique identifier provided. Engine operating in Visual-Only-Mode.`);
        }

        const extractIdentifiers = (text: string, title?: string, sourceId?: string) => {
            const batch: { type: string; value: string }[] = [];
            if (!text) return batch;

            // 1. Emails
            const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            emails.forEach(e => {
                const value = e.toLowerCase();
                if (!['example.com', 'test.com'].includes(value.split('@')[1])) {
                    correlatedIdentifiers.emails.add({ value, sourceId });
                    batch.push({ type: 'email', value });
                }
            });

            // 2. Usernames / Handles (Refined to avoid matching domain in email)
            // Use word boundary and negative lookbehind if possible (but simpler for JS):
            // We match handles @name, but check they aren't preceded by [a-z0-9] (part of an email)
            const handles = text.match(/(^|[^a-zA-Z0-9._])@([a-zA-Z0-9_]{3,20})/g) || [];
            handles.forEach(h => {
                const value = h.split('@')[1].toLowerCase();
                if (value.length > 2 && !USERNAME_BLOCKLIST.has(value)) {
                    correlatedIdentifiers.usernames.add({ value, sourceId });
                    batch.push({ type: 'username', value });
                }
            });

            // 3. Domains
            const domains = text.match(/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/g) || [];
            domains.forEach(d => {
                const domain = d.toLowerCase();
                const ignored = [
                    // Email & Chat Providers
                    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'mail.ru', 'icloud.com', 'aol.com',
                    // Big Tech Infra
                    'google.com', 'accounts.google.com', 'mail.google.com', 'myaccount.google.com', 'policies.google.com', 'support.google.com', 'youtube.com', 'youtu.be',
                    'microsoft.com', 'login.microsoftonline.com', 'mcas.ms', 'bing.com',
                    'apple.com', 'amazon.com', 'aws.amazon.com', 'cloudflare.com',
                    // Social Media generic
                    'github.com', 'medium.com', 'reddit.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'pinterest.com',
                    // Utility / News / Info
                    'web.archive.org', 'vercel.app', 'duckduckgo.com', 'wikipedia.org', 'en.wikipedia.org', 'wikihow.com', 'www.wikihow.com',
                    'stackoverflow.com', 'quora.com', 'nytimes.com', 'cnn.com', 'bbc.com', 'forbes.com', 'bloomberg.com', 'reuters.com'
                ];
                if (!ignored.includes(domain) && !domain.endsWith('.google.com') && !domain.endsWith('.wikihow.com')) {
                    correlatedIdentifiers.domains.add({ value: domain, sourceId });
                    batch.push({ type: 'domain', value: domain });
                }
            });

            // 4. Crypto
            const btc = text.match(/\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}\b/g) || [];
            const eth = text.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
            [...btc, ...eth].forEach(c => {
                correlatedIdentifiers.crypto.add({ value: c, sourceId });
                batch.push({ type: 'crypto', value: c });
            });

            // 5. Names (from high-fidelity sources & Visual Intel)
            const identityMatch = title && (title.includes('Identity Match') || title.includes('Facial Match'));
            if (title && (title.includes('Wikipedia') || title.includes('Profile') || identityMatch)) {
                let cleanName = title.split(' — ')[1]?.replace(/\([^)]*\)/g, '').trim();
                
                // Fallback for Visual Intel specific titles
                if (!cleanName && identityMatch && title.includes(' — ')) {
                    cleanName = title.split(' — ')[1].trim();
                }

                if (cleanName && cleanName.length > 3 && cleanName.length < 50 && cleanName !== investigation.subjectName) {
                    correlatedIdentifiers.names.add({ value: cleanName, sourceId });
                    batch.push({ type: 'name', value: cleanName });
                }
            }

            return batch;
        };

        const persistEntitiesBatch = async (entities: { type: string; value: string }[]) => {
            if (entities.length === 0) return;
            const unique = entities.filter((v, i, a) => 
                a.findIndex(t => t.type === v.type && t.value === v.value) === i
            ).slice(0, 50); 
            
            try {
                // Dossier v87: Use createMany with skipDuplicates for high-speed absorption
                await (prisma.entity as any).createMany({
                    data: unique.map(e => ({
                        investigationId,
                        type: e.type,
                        value: e.value,
                        confidence: 70
                    })),
                    skipDuplicates: true
                });
            } catch (err: any) {
                console.warn(`[SCAN] Entity createMany failed, falling back to sequential:`, err.message);
                await Promise.allSettled(unique.map(async (entity) => {
                    try {
                        const existing = await prisma.entity.findFirst({
                            where: { investigationId, type: entity.type, value: entity.value }
                        });
                        if (!existing) {
                            await prisma.entity.create({ data: { investigationId, type: entity.type, value: entity.value, confidence: 70 } });
                        }
                    } catch { /* ignore individual entity failures */ }
                }));
            }
        };

        /**
         * CRITICAL CHANGE: Save evidence to DB IMMEDIATELY as each connector completes.
         * This way even if Vercel kills the function, all previously completed connectors
         * will have their evidence persisted in the database.
         */
        const safeRun = async (label: string, fn: () => Promise<any>, parentId?: string) => {
            const start = Date.now();
            
            // BUDGET CHECK: If we are close to the threshold, abort additional connectors
            if (Date.now() - startTime > HOBBY_LIMIT) {
                console.warn(`[SCAN] Budget exceeded. Skipping ${label}.`);
                return [];
            }

            // 1. Log deployment immediately so the terminal shows activity
            await prisma.searchLog.create({
                data: {
                    investigationId,
                    userId,
                    connectorType: 'agent_start',
                    query: `Deploying [${label}] node...`,
                    resultCount: 0
                }
            }).catch((e) => console.error(`[DB_CRASH] SearchLog init failed:`, e.message));

            try {
                const result = await fn();
                const resultCount = result?.results?.length || 0;

                // 2. Log completion (success or zero results)
                await prisma.searchLog.create({
                    data: {
                        investigationId,
                        userId,
                        connectorType: label.toLowerCase().replace(/\s+/g, '_'),
                        query: resultCount > 0 
                            ? `[NODE] ${label} extraction successful. Found ${resultCount} items.` 
                            : `[NODE] ${label} analysis complete. No data in this sector.`,
                        resultCount: resultCount
                    }
                }).catch((e) => console.error(`[DB_CRASH] SearchLog init failed:`, e.message));

                if (!result?.results || result.results.length === 0) return [];

                const evidenceItems: any[] = [];
                const entitiesToPersist: { type: string; value: string }[] = [];

                for (const res of result.results.slice(0, 30)) { 
                    if (res.category === 'system') continue;
                    
                    // DE-DUPLICATION CHECK (URL & HASH)
                    const provenanceHash = generateProvenanceHash(res.description || '');
                    if (res.url && processedUrls.has(res.url)) {
                        console.log(`[SCAN] Skipping duplicate URL: ${res.url}`);
                        continue;
                    }
                    if (processedHashes.has(provenanceHash)) {
                        console.log(`[SCAN] Skipping duplicate content hash from ${res.platform}`);
                        continue;
                    }

                    const extracted = extractIdentifiers(res.description || '', res.title, parentId);
                    entitiesToPersist.push(...extracted);

                    if (res.confidenceLabel === 'HIGH' && res.url && !res.url.startsWith('#')) {
                        archiveUrl(res.url).catch(() => {}); 
                    }

                    const confidenceScore = calculateConfidence(label.toLowerCase().replace(/\s+/g, '_'), false, res.confidenceScore);
                    const confidenceLabel = getConfidenceLabel(confidenceScore);

                    // SIGNAL FLOOR: Prune any "hallucinations" or low-certainty results
                    if (confidenceScore < 55) {
                        console.log(`[FIDELITY] Pruning low-signal result from ${label}: ${res.title} (${confidenceScore}%)`);
                        continue;
                    }

                    evidenceItems.push({
                        investigationId,
                        title: (res.title || `Intelligence Discovery — ${label}`).slice(0, 500),
                        content: (res.description || 'Detailed documentation extracted from OSINT node.').slice(0, 5000),
                        sourceUrl: res.url || null,
                        type: 'url',
                        tags: res.category || 'general',
                        confidenceScore: confidenceScore / 100,
                        confidenceLabel: confidenceLabel,
                        provenanceHash: provenanceHash,
                        captureTimestamp: new Date(),
                    });

                    // Update registry
                    if (res.url) processedUrls.add(res.url);
                    processedHashes.add(provenanceHash);
                }

                if (evidenceItems.length > 0) {
                    console.log(`[SCAN] ${label}: Attempting to persist ${evidenceItems.length} evidence items (Batch Mode)...`);
                    
                    try {
                        // Dossier v87: Definitive batch persistence
                        await (prisma.evidence as any).createMany({
                            data: evidenceItems,
                            skipDuplicates: true
                        });
                        console.log(`[SCAN] ${label}: Batch persistence successful.`);
                    } catch (batchErr: any) {
                        console.error(`[SCAN] ${label}: Batch evidence creation failed, falling back to sequential.`, batchErr.message);
                        for (const item of evidenceItems) {
                            try {
                                await prisma.evidence.create({ data: item });
                            } catch (itemErr: any) {
                                console.error(`[SCAN] Evidence item fallback failed for "${item.title?.slice(0,50)}":`, itemErr.message);
                            }
                        }
                    }
                    
                    allEvidence.push(...evidenceItems);
                } else if (resultCount > 0) {
                    console.warn(`[SCAN] ${label}: Found ${resultCount} results but extracted 0 evidence items. Check extraction logic.`);
                    // Log the extraction gap to the user terminal
                    await prisma.searchLog.create({
                        data: {
                            investigationId,
                            userId,
                            connectorType: 'system_error',
                            query: `[NODE] ${label} identified ${resultCount} leads but extraction filters were too restrictive.`,
                            resultCount: 0
                        }
                    }).catch((e) => console.error(`[DB_CRASH] SearchLog init failed:`, e.message));
                }

                try {
                    await persistEntitiesBatch(entitiesToPersist);
                } catch (entErr: any) {
                    console.error(`[SCAN] Entity batch failed:`, entErr.message);
                    await prisma.searchLog.create({
                        data: {
                            investigationId,
                            userId,
                            connectorType: 'system_error',
                            query: `[DB_ERROR] Failed to save extracted entities: ${entErr.message}`,
                            resultCount: 0
                        }
                    }).catch(() => {});
                }

                // PULSE: Finalize the node with a manual heartbeat pulse entry
                await prisma.searchLog.create({
                    data: {
                        investigationId,
                        userId,
                        connectorType: 'system',
                        query: `[PULSE] ${label} relay sync complete. Sustaining heartbeat...`,
                        resultCount: 0
                    }
                }).catch((e) => console.error(`[DB_CRASH] SearchLog init failed:`, e.message));

                return evidenceItems;
            } catch (err: any) {
                console.error(`[SCAN] Connector "${label}" failed:`, err?.message);
                
                await prisma.searchLog.create({
                    data: {
                        investigationId,
                        userId,
                        connectorType: 'system_error',
                        query: `[ERROR] ${label} node failure: ${err.message}`,
                        resultCount: 0
                    }
                }).catch((e) => console.error(`[DB_CRASH] SearchLog init failed:`, e.message));
                return [];
            }
        };

        // ========== PHASE 1: Primary Intelligence Sweep ==========
        const phase1: Promise<any>[] = [];

        // 1. Username Sweep (Handle + whatsMyName + Ecosystem)
        const usernameTarget = investigation.subjectUsername || (primaryTarget && !primaryTarget.includes('@') && !primaryTarget.includes('.') ? primaryTarget : null);
        const usernameIsGeneric = usernameTarget && GENERIC_TARGETS.has(usernameTarget.toLowerCase());

        if (usernameTarget && !usernameIsGeneric) {
            phase1.push(safeRun('Username Search', () => usernameSearch(usernameTarget)));
            phase1.push(safeRun('WhatsMyName', () => whatsMyName(usernameTarget)));
            phase1.push(safeRun('Ecosystem Discovery', () => ecosystemSearch(usernameTarget)));
        }

        // 2. Email Sweep (Breach + Registration Scout + Reputation)
        const emailTarget = investigation.subjectEmail || (primaryTarget?.includes('@') ? primaryTarget : null);
        if (emailTarget) {
            phase1.push(safeRun('Breach Search', () => breachSearch(emailTarget)));
            phase1.push(safeRun('Registration Scout', () => registrationScout(emailTarget)));
        }

        // 3. Name & Identity Sweep (Google Dorks + People Search + Interpol)
        const nameTarget = investigation.subjectName || (usernameTarget && !investigation.subjectUsername ? usernameTarget : null);
        const nameIsGeneric = nameTarget && GENERIC_TARGETS.has(nameTarget.toLowerCase());

        if (nameTarget && !nameIsGeneric) {
            phase1.push(safeRun('Intelligence Dork', () => googleDorks({
                name: nameTarget,
                username: usernameTarget || undefined,
                email: emailTarget || undefined
            })));
            
            if (isPro) {
                phase1.push(safeRun('People Search', () => peopleSearch(nameTarget)));
            }

            phase1.push(safeRun('Interpol', () => interpolSearch({
                name: nameTarget,
                username: usernameTarget || undefined
            })));
        }

        // 4. Infrastructure & Domain Sweep
        const domainTarget = investigation.subjectDomain || (primaryTarget?.includes('.') && !primaryTarget?.includes('@') ? primaryTarget : null) || emailTarget?.split('@')[1];
        if (domainTarget && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'protonmail.com'].includes(domainTarget)) {
            phase1.push(safeRun('Domain Search', () => domainSearch(domainTarget)));
        }

        // 5. Visual Intelligence Swep (Image + Biometrics + EXIF)
        if (investigation.subjectImageUrl) {
            phase1.push(safeRun('Visual Intelligence', () => reverseImageSearch(investigation.subjectImageUrl)));
            phase1.push(safeRun('EXIF Extraction', () => extractExif(investigation.subjectImageUrl)));
        }

        // 6. Technical Vectors (IP, Phone)
        const phoneTarget = investigation.subjectPhone;
        if (phoneTarget) {
            // Add phone specialized connector if exists, or use dorks
            phase1.push(safeRun('Phone Intelligence', () => googleDorks({ name: phoneTarget })));
        }

        if (primaryTarget && primaryTarget.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)) {
            phase1.push(safeRun('IPinfo', () => ipinfo(primaryTarget)));
        }

        // CHUNKED EXECUTION: Limit concurrency to 4 nodes at a time for high-speed parallel throughput
        const p1Chunks = [];
        for (let i = 0; i < phase1.length; i += 4) p1Chunks.push(phase1.slice(i, i + 4));

        for (const chunk of p1Chunks) {
            if (Date.now() - startTime > HOBBY_LIMIT) break;
            await Promise.allSettled(chunk);
        }

        // Phase 1 results are now incrementally saved in safeRun

        await prisma.searchLog.create({
            data: {
                investigationId,
                userId,
                connectorType: 'system',
                query: 'Phase 1 Intelligence Sweep',
                resultCount: allEvidence.length
            }
        }).catch((e) => console.error(`[DB_CRASH] SearchLog gap log failed:`, e.message));

        // --- SAFETY CHECK 1 (Hobby/Timeout Optimization) ---
        if (Date.now() - startTime > HOBBY_LIMIT) {
            console.warn('[SCAN] Safety Limit reached after Phase 1. Finalizing.');
            await prisma.investigation.update({ where: { id: investigationId }, data: { status: 'closed' } });
            await prisma.report.create({
                data: { investigationId, title: 'Rapid Intelligence Report', content: `### Intelligence Sweep (Rapid Mode)\nThe scan found ${allEvidence.length} items. Automated pivoting was paused to ensure real-time reporting fidelity within platform limits.`, format: 'markdown' }
            });
            return { found: allEvidence.length, facialMatches };
        }

        // ========== PHASE 2: Intelligence Pivoting (Throttled & Limited) ==========
        
        // RECOVERY: If Phase 1 found a high-confidence facial identity, anchor the investigation SESSION
        const highConfidenceFace = allEvidence.find(e => e.title.includes('Identity Match') && e.confidenceScore > 0.92);
        if (highConfidenceFace?.metadata?.extractedIdentity) {
            const identifiedName = highConfidenceFace.metadata.extractedIdentity;
            console.log(`[SCAN] Elite Fidelity: Anchoring active session to "${identifiedName}".`);
            
            // NOTE: We no longer permanently update the DB title/subject here to prevent cross-scan pollution
            // This allows the user to swap images without "sticking" to the previous identity.
            
            primaryTarget = identifiedName;
            investigation.subjectName = identifiedName;
        }

        const phase2: Promise<any>[] = [];
        let pivotCount = 0;
        const PIVOT_CAP = 20;

        // Visual Pivot: Identify discovered avatars and reverse-search them
        const imagesToPivot = allEvidence
            .filter(ev => ev.metadata?.avatarUrl || ev.content?.includes('Avatar:'))
            .map(ev => {
                const match = ev.content?.match(/Avatar:\s*(https?:\/\/[^\s\n]+)/);
                return ev.metadata?.avatarUrl || (match ? match[1] : null);
            })
            .filter(Boolean);

        imagesToPivot.slice(0, 2).forEach(img => {
            phase2.push(safeRun(`Visual Intelligence Pivot`, () => reverseImageSearch(img as string)));
            pivotCount++;
        });

        const pivotQueue = [
            // Specialized Visual Identity Pivots (High Fidelity)
            ...Array.from(correlatedIdentifiers.names)
                .filter(n => allEvidence.some(e => e.title.includes('Identity Match') && e.title.includes(n.value)))
                .map(n => ({ label: `Focus Sweep: ${n.value}`, task: () => whatsMyName(n.value), pivotId: n.sourceId, skip: false })),

            ...Array.from(correlatedIdentifiers.usernames).map(u => ({ label: `Pivot: @${u.value}`, task: () => usernameSearch(u.value), pivotId: u.sourceId, skip: u.value === investigation.subjectUsername || u.value === primaryTarget })),
            ...Array.from(correlatedIdentifiers.names).map(n => ({ label: `Pivot: ${n.value}`, task: () => googleDorks({ name: n.value }), pivotId: n.sourceId, skip: false })),
            ...Array.from(correlatedIdentifiers.emails).map(e => ({ label: `Pivot: ${e.value}`, task: () => breachSearch(e.value), pivotId: e.sourceId, skip: e.value === investigation.subjectEmail }))
        ];

        for (const p of pivotQueue) {
            if (pivotCount >= PIVOT_CAP) break;
            if (p.skip) continue;
            phase2.push(safeRun(p.label, p.task, p.pivotId));
            pivotCount++;
        }

        if (isPro) {
            const darkWebT = investigation.subjectEmail || primaryTarget;
            if (darkWebT) phase2.push(safeRun('Dark Web Sweep', () => darkWebSearch(darkWebT)));
            
            // NEW: Infra pivot via SecurityTrails
            if (domainTarget) {
               phase2.push(safeRun('SecurityTrails', () => securityTrails(domainTarget)));
            }

            Array.from(correlatedIdentifiers.crypto).slice(0, 2).forEach(c => 
                phase2.push(safeRun(`Crypto Hub`, () => cryptoSearch(c.value), c.sourceId))
            );

            Array.from(correlatedIdentifiers.domains).slice(0, 3).forEach(d => {
                phase2.push(safeRun(`Visual Proof: ${d.value}`, async () => {
                    const url = await captureScreenshot(`https://${d.value}`);
                    return url ? { results: [{ type: 'screenshot', title: `Visual Proof: ${d.value}`, description: `Web snapshot captured. High-fidelity verification.`, confidenceScore: 0.9, confidenceLabel: 'VERIFIED', screenshotUrl: url }] } : null;
                }, d.sourceId));
            });
        }

        // CHUNKED EXECUTION: Limit Phase 2 concurrency to 2 nodes (deeper, slower nodes)
        const p2Chunks = [];
        for (let i = 0; i < phase2.length; i += 2) p2Chunks.push(phase2.slice(i, i + 2));
        
        for (const chunk of p2Chunks) {
            if (Date.now() - startTime > HOBBY_LIMIT) break;
            await Promise.allSettled(chunk);
        }

        // Finalize Status BEFORE AI summary (prevents UI freeze during slow synthesis)
        await prisma.investigation.update({
            where: { id: investigationId },
            data: { updatedAt: new Date(), status: 'closed' },
        });

        // ========== PHASE 3: AI Synthesis ==========
        let summary = '';
        try {
            summary = await summarizeFindings(investigation.title, allEvidence, customApiKey) || '';
        } catch (aiErr: any) {
            summary = `### AI Intelligence Synthesis\n\nThe scan found ${allEvidence.length} items. AI synthesis encountered an error: ${aiErr?.message || 'Context limit or API timeout'}.`;
        }

        await prisma.report.create({
            data: {
                investigationId,
                title: `Intelligence Dossier — ${new Date().toLocaleDateString()}`,
                content: summary,
                format: 'markdown'
            }
        });

        return {
            found: allEvidence.length,
            facialMatches
        };

    } catch (error: any) {
        console.error('Scan failed:', error);
        try {
            // Always ensure we close the investigation and create a report even on crash
            const existingEvidence = await prisma.evidence.count({ where: { investigationId } });
            if (existingEvidence > 0) {
                const evidence = await prisma.evidence.findMany({ where: { investigationId } });
                const summary = `### Partial Scan Results\n\nThe scan encountered an error but successfully gathered ${existingEvidence} evidence items before the failure.\n\nReview available evidence in the Evidence tab.\n\n**Error:** ${error?.message || 'Unknown'}`;
                await prisma.report.create({
                    data: { investigationId, title: 'Partial Intelligence Dossier', content: summary, format: 'markdown' }
                });
            }
            await prisma.investigation.update({
                where: { id: investigationId },
                data: { status: 'closed' },
            });
        } catch { /* last resort */ }

        return { found: -1, facialMatches: [] };
    }
}
