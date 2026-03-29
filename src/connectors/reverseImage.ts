import { ConnectorResult, SearchResult } from './types';

const FACECHECK_SITE = 'https://facecheck.id';
const FACECHECK_API_TOKEN = process.env.FACECHECK_API_TOKEN || '';
// In testing mode, no credits are deducted but results are limited to 100k faces.
// Set FACECHECK_TESTING_MODE=false in production env when you have purchased credits.
const TESTING_MODE = process.env.FACECHECK_TESTING_MODE !== 'false';

const MAX_POLL_ATTEMPTS = 30; // 30s max poll time (1s intervals)

interface FaceCheckItem {
    score: number;   // 0–100
    url: string;     // URL of page where face was found
    base64: string;  // Base64-encoded thumbnail (webp)
    guid?: string;
}

/**
 * Downloads an image from a public URL and returns its binary buffer + mime type.
 */
async function fetchImageBuffer(imageUrl: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new Error('Invalid Data URL format');
        const mimeType = match[1];
        const base64Data = match[2];
        return { buffer: Buffer.from(base64Data, 'base64'), mimeType };
    }

    const timeout = AbortSignal.timeout(15000);
    const res = await fetch(imageUrl, { signal: timeout });
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), mimeType: contentType };
}

/**
 * Step 1: Upload image to FaceCheck.id, get back id_search token.
 */
async function uploadToFaceCheck(imageBuffer: Buffer, mimeType: string, filename: string): Promise<string> {
    const formData = new FormData();
    // Extract a plain ArrayBuffer from the Node Buffer to satisfy Blob's strict type
    const arrayBuf = imageBuffer.buffer.slice(
        imageBuffer.byteOffset,
        imageBuffer.byteOffset + imageBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuf], { type: mimeType });
    formData.append('images', blob, filename);
    // id_search must be present (empty string for new search)
    formData.append('id_search', '');

    const res = await fetch(`${FACECHECK_SITE}/api/upload_pic`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Authorization': FACECHECK_API_TOKEN,
        },
        body: formData,
    });

    const data = await res.json() as { error?: string; code?: string; id_search?: string; message?: string };
    if (data.error) throw new Error(`FaceCheck upload error: ${data.error} (${data.code})`);
    if (!data.id_search) throw new Error('FaceCheck upload returned no id_search');
    
    return data.id_search;
}

/**
 * Step 2: Poll FaceCheck.id until results arrive or timeout.
 */
async function pollFaceCheck(idSearch: string): Promise<FaceCheckItem[]> {
    const payload = {
        id_search: idSearch,
        with_progress: true,
        status_only: false,
        demo: TESTING_MODE,
    };

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await new Promise(r => setTimeout(r, 1500)); // 1.5s between polls

        const res = await fetch(`${FACECHECK_SITE}/api/search`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': FACECHECK_API_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json() as {
            error?: string;
            code?: string;
            message?: string;
            progress?: number;
            output?: { items: FaceCheckItem[] };
        };

        if (data.error) throw new Error(`FaceCheck search error: ${data.error} (${data.code})`);
        if (data.output?.items) return data.output.items;

        console.log(`[FaceCheck] Progress: ${data.progress ?? 0}% — ${data.message ?? 'Scanning...'}`);
    }

    throw new Error('FaceCheck search timed out after 45 seconds');
}

/**
 * Infer platform name from a URL for labeling in the evidence card.
 */
function inferPlatform(url: string): string {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        const known: Record<string, string> = {
            'instagram.com': 'Instagram',
            'x.com': 'X / Twitter',
            'twitter.com': 'X / Twitter',
            'facebook.com': 'Facebook',
            'linkedin.com': 'LinkedIn',
            'tiktok.com': 'TikTok',
            'reddit.com': 'Reddit',
            'pinterest.com': 'Pinterest',
            'flickr.com': 'Flickr',
            'github.com': 'GitHub',
            'youtube.com': 'YouTube',
            'vk.com': 'VKontakte',
        };
        for (const [domain, name] of Object.entries(known)) {
            if (hostname.includes(domain)) return name;
        }
        return hostname;
    } catch {
        return 'Unknown Platform';
    }
}

/**
 * Main reverse image search connector.
 * 
 * If FACECHECK_API_TOKEN is set: runs real facial recognition via FaceCheck.id
 * and returns verified profile matches with confidence scores.
 * 
 * If no token: falls back to generating Google Lens / Yandex search URLs
 * so the user can complete the search manually (same as before).
 */
export async function reverseImageSearch(imageUrl?: string): Promise<ConnectorResult> {
    const results: SearchResult[] = [];

    // ── No image URL provided ──────────────────────────────────────────────
    if (!imageUrl) {
        return {
            connectorType: 'reverse_image',
            query: 'no_image',
            results: [{
                title: 'No Reference Image Provided',
                url: 'https://facecheck.id',
                description: 'Add a subject image URL in the investigation to enable facial recognition search.',
                category: 'image_search',
                platform: 'FaceCheck.id',
                confidenceScore: 0,
                confidenceLabel: 'LOW',
            }],
            generatedAt: new Date().toISOString(),
        };
    }

    // ── No API token — fall back to search URL links ───────────────────────
    if (!FACECHECK_API_TOKEN) {
        console.warn('[ReverseImage] FACECHECK_API_TOKEN not set — falling back to search URL links');
        const encoded = encodeURIComponent(imageUrl);
        return {
            connectorType: 'reverse_image',
            query: imageUrl,
            results: [
                {
                    title: 'FaceCheck.id — Facial Recognition Search',
                    url: `https://facecheck.id`,
                    description: 'Upload image manually at FaceCheck.id for real facial recognition results. Set FACECHECK_API_TOKEN to enable automatic scanning.',
                    category: 'image_search',
                    platform: 'FaceCheck.id',
                    confidenceScore: 0.5,
                    confidenceLabel: 'MEDIUM',
                },
                {
                    title: 'Yandex Images — Face Search',
                    url: `https://yandex.com/images/search?rpt=imageview&url=${encoded}`,
                    description: 'Yandex reverse image (strongest public face search engine)',
                    category: 'image_search',
                    platform: 'Yandex',
                    confidenceScore: 0.65,
                    confidenceLabel: 'MEDIUM',
                },
                {
                    title: 'Google Lens — Visual Search',
                    url: `https://lens.google.com/uploadbyurl?url=${encoded}`,
                    description: 'Google Lens visual identity search',
                    category: 'image_search',
                    platform: 'Google Lens',
                    confidenceScore: 0.60,
                    confidenceLabel: 'MEDIUM',
                },
            ],
            generatedAt: new Date().toISOString(),
        };
    }

    // ── Live FaceCheck.id API call ─────────────────────────────────────────
    try {
        console.log(`[FaceCheck] Starting facial recognition search for: ${imageUrl}`);
        
        const filename = imageUrl.split('/').pop()?.split('?')[0] || 'subject.jpg';
        const { buffer, mimeType } = await fetchImageBuffer(imageUrl);
        const idSearch = await uploadToFaceCheck(buffer, mimeType, filename);
        
        console.log(`[FaceCheck] Image uploaded. id_search=${idSearch}. Polling for results...`);
        const items = await pollFaceCheck(idSearch);

        if (items.length === 0) {
            results.push({
                title: 'No Facial Matches Found',
                url: `https://facecheck.id`,
                description: 'FaceCheck.id scanned its database and found no matching faces for this image. Try a clearer, front-facing photo.',
                category: 'image_search',
                platform: 'FaceCheck.id',
                confidenceScore: 0,
                confidenceLabel: 'LOW',
            });
        } else {
            for (const item of items) {
                const score = item.score; // 0–100
                const platform = inferPlatform(item.url);
                const normalizedScore = score / 100;
                const confidenceLabel = score >= 85 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW';
                
                // Build metadata including base64 thumbnail for display in evidence card
                results.push({
                    title: `Facial Match — ${platform}`,
                    url: item.url,
                    description: `FaceCheck.id found a facial match on ${platform} with ${score}% similarity. The identified face appears on the linked page.`,
                    category: 'image_search',
                    platform,
                    confidenceScore: normalizedScore,
                    confidenceLabel: confidenceLabel as 'HIGH' | 'MEDIUM' | 'LOW',
                    metadata: {
                        faceMatchScore: score,
                        thumbnailBase64: item.base64,
                        source: 'facecheck_id',
                        idSearch,
                    },
                });
            }
        }

        // Also include fallback links for manual deeper investigation
        results.push({
            title: 'PimEyes — Extended Face Search',
            url: `https://pimeyes.com/en`,
            description: 'Run extended facial recognition on PimEyes for deeper coverage (paid, strongest database).',
            category: 'image_search',
            platform: 'PimEyes',
            confidenceScore: 0.5,
            confidenceLabel: 'MEDIUM',
        });

    } catch (err: any) {
        console.error('[FaceCheck] Error:', err.message);
        // Return error as a result so it appears in the evidence tab rather than crashing the scan
        const encoded = encodeURIComponent(imageUrl);
        results.push({
            title: 'FaceCheck.id — Facial Scan Error',
            url: `https://yandex.com/images/search?rpt=imageview&url=${encoded}`,
            description: `Facial recognition scan failed: ${err.message}. Yandex face search link provided as fallback.`,
            category: 'image_search',
            platform: 'Error Fallback',
            confidenceScore: 0,
            confidenceLabel: 'LOW',
        });
    }

    return {
        connectorType: 'reverse_image',
        query: imageUrl,
        results,
        generatedAt: new Date().toISOString(),
    };
}
