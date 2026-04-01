import { ConnectorResult, SearchResult } from './types';

/**
 * Aletheia Siphon Hub v3 — API-first Visual Intelligence
 *
 * Priority chain:
 *  1. Google Vision Web Detection (GOOGLE_VISION_API_KEY) — accepts base64 directly, free 1000/mo
 *  2. SerpAPI Google Reverse Image (SERPAPI_KEY) — best coverage, free 100/mo
 *  3. Bing Visual Search API (BING_SEARCH_API_KEY) — free 1000/mo
 *
 * All engines accept locally uploaded images (Data URLs) via base64.
 * No scraping — all results come from official APIs.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

/** Extract base64 string and mimeType from a Data URL or remote URL */
async function toBase64(imageUrl: string): Promise<{ base64: string; mimeType: string } | null> {
    if (imageUrl.startsWith('data:')) {
        const m = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) return null;
        return { base64: m[2], mimeType: m[1] };
    }
    try {
        const res = await fetch(imageUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12000) });
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        return {
            base64: Buffer.from(buf).toString('base64'),
            mimeType: res.headers.get('content-type') || 'image/jpeg'
        };
    } catch { return null; }
}

/** Get a public URL — for Data URLs, uploads to a temp host so APIs that need URLs can use it */
async function getPublicUrl(imageUrl: string, base64: string, mimeType: string): Promise<string | null> {
    if (!imageUrl.startsWith('data:')) return imageUrl; // already public

    // Try uploading to Imgur (anonymous, no key needed)
    try {
        const res = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID c9a6efb3d7932fd', // Public OSS client ID
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64, type: 'base64', title: 'recon' }),
            signal: AbortSignal.timeout(20000),
        });
        if (res.ok) {
            const data = await res.json() as any;
            if (data?.data?.link) {
                console.log(`[Siphon] Temp host success: ${data.data.link}`);
                return data.data.link;
            }
        }
    } catch (e: any) { console.warn('[Siphon] Imgur upload failed:', e.message); }

    return null; // couldn't get a public URL
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 1: GOOGLE VISION API — Web Detection
// Finds pages that contain the image. Accepts base64 directly.
// Free: 1000 requests/month. Set GOOGLE_VISION_API_KEY in Vercel.
// ─────────────────────────────────────────────────────────────────────────────
async function googleVisionEngine(base64: string): Promise<SearchResult[]> {
    const key = process.env.GOOGLE_VISION_API_KEY;
    if (!key) return [];

    const results: SearchResult[] = [];
    try {
        const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { content: base64 },
                    features: [{ type: 'WEB_DETECTION', maxResults: 50 }]
                }]
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Siphon:Vision] API error:', res.status, err.slice(0, 200));
            return [];
        }

        const data = await res.json() as any;
        const web = data?.responses?.[0]?.webDetection;
        if (!web) return [];

        // Best guess entity labels (e.g. "Donald Trump")
        const entity = web.bestGuessLabels?.[0]?.label || web.webEntities?.[0]?.description || '';
        console.log(`[Siphon:Vision] Best guess entity: "${entity}"`);

        // Pages with matching images
        for (const page of (web.pagesWithMatchingImages || []).slice(0, 20)) {
            results.push({
                title: page.pageTitle || `Page Match — ${new URL(page.url).hostname}`,
                url: page.url,
                description: [
                    entity ? `**Identified entity:** ${entity}` : '',
                    `This page contains your uploaded image.`,
                    `**Source:** ${new URL(page.url).hostname}`,
                    page.pageTitle ? `**Page title:** ${page.pageTitle}` : ''
                ].filter(Boolean).join('\n'),
                category: 'image_search',
                platform: 'Google Vision',
                confidenceScore: 0.95,
                confidenceLabel: 'VERIFIED',
                isVerified: true,
                metadata: { source: 'google_vision_web_detection', entity, thumbnailUrl: page.fullMatchingImages?.[0]?.url }
            });
        }

        // Partial matches (visually similar)
        for (const img of (web.visuallySimilarImages || []).slice(0, 10)) {
            try {
                const host = new URL(img.url).hostname;
                results.push({
                    title: `Visually Similar — ${host}`,
                    url: img.url,
                    description: `Visually similar image found on the web.\n**Source:** ${host}${entity ? `\n**Associated entity:** ${entity}` : ''}`,
                    category: 'image_search',
                    platform: 'Google Vision',
                    confidenceScore: 0.80,
                    confidenceLabel: 'HIGH',
                    isVerified: true,
                    metadata: { source: 'google_vision_similar', entity }
                });
            } catch { /* skip invalid urls */ }
        }

        console.log(`[Siphon:Vision] Extracted ${results.length} results. Entity: "${entity}"`);
    } catch (e: any) {
        console.error('[Siphon:Vision] Engine failed:', e.message);
    }
    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 2: SERPAPI — Google Reverse Image Search
// Returns actual search result pages. Requires a public URL.
// Free: 100 searches/month. Set SERPAPI_KEY in Vercel.
// ─────────────────────────────────────────────────────────────────────────────
async function serpApiEngine(publicUrl: string | null): Promise<SearchResult[]> {
    const key = process.env.SERPAPI_KEY;
    if (!key || !publicUrl) return [];

    const results: SearchResult[] = [];
    try {
        const url = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(publicUrl)}&api_key=${key}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!res.ok) {
            console.error('[Siphon:SerpAPI] Failed:', res.status, await res.text().then(t => t.slice(0, 200)));
            return [];
        }

        const data = await res.json() as any;

        // Image results
        for (const item of (data.image_results || []).slice(0, 20)) {
            results.push({
                title: item.title || item.source || 'Image Match',
                url: item.link || item.original,
                description: `Google found this image on the web.\n\n**Source:** ${item.source || new URL(item.link || item.original).hostname}\n**Title:** ${item.title || '—'}`,
                category: 'image_search',
                platform: 'Google',
                confidenceScore: 0.92,
                confidenceLabel: 'HIGH',
                isVerified: true,
                metadata: { source: 'serpapi_google_reverse', thumbnailUrl: item.thumbnail }
            });
        }

        // Visual matches 
        for (const item of (data.visual_matches || []).slice(0, 10)) {
            results.push({
                title: item.title || `Visual Match — ${item.source}`,
                url: item.link,
                description: `Google Lens visual match.\n\n**Source:** ${item.source}\n**Title:** ${item.title || '—'}`,
                category: 'image_search',
                platform: 'Google Lens',
                confidenceScore: 0.88,
                confidenceLabel: 'HIGH',
                isVerified: true,
                metadata: { source: 'serpapi_google_lens', thumbnailUrl: item.thumbnail }
            });
        }

        // Knowledge graph entity
        const entity = data.knowledge_graph?.title || data.search_information?.query_displayed;
        if (entity && results.length > 0) {
            results[0].metadata = { ...results[0].metadata, identifiedEntity: entity };
            results[0].description = `**🧠 Google Identified:** ${entity}\n\n` + results[0].description;
        }

        console.log(`[Siphon:SerpAPI] Extracted ${results.length} results.`);
    } catch (e: any) {
        console.error('[Siphon:SerpAPI] Engine failed:', e.message);
    }
    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 3: BING VISUAL SEARCH API
// Official Microsoft API. Accepts binary or URL. Free 1000/month.
// Set BING_SEARCH_API_KEY in Vercel.
// ─────────────────────────────────────────────────────────────────────────────
async function bingVisionEngine(base64: string, mimeType: string): Promise<SearchResult[]> {
    const key = process.env.BING_SEARCH_API_KEY;
    if (!key) return [];

    const results: SearchResult[] = [];
    try {
        const buffer = Buffer.from(base64, 'base64');
        const arrayBuf = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

        const fd = new FormData();
        fd.append('image', new Blob([arrayBuf], { type: mimeType }), 'target.jpg');

        const res = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
            method: 'POST',
            headers: { 'Ocp-Apim-Subscription-Key': key },
            body: fd,
            signal: AbortSignal.timeout(25000),
        });

        if (!res.ok) {
            console.error('[Siphon:Bing] API error:', res.status, await res.text().then(t => t.slice(0,200)));
            return [];
        }

        const data = await res.json() as any;
        for (const tag of (data.tags || []).slice(0, 8)) {
            for (const action of (tag.actions || [])) {
                if (action.actionType === 'PagesIncluding') {
                    for (const page of (action.data?.value || []).slice(0, 5)) {
                        const url = page.hostPageUrl || page.contentUrl;
                        if (!url) continue;
                        results.push({
                            title: page.name || `Bing Match — ${page.hostPageDisplayUrl}`,
                            url,
                            description: `Bing found this image on the web.\n\n**Source:** ${page.hostPageDisplayUrl || url}`,
                            category: 'image_search',
                            platform: 'Bing',
                            confidenceScore: 0.88,
                            confidenceLabel: 'HIGH',
                            isVerified: true,
                            metadata: { source: 'bing_visual_api', thumbnailUrl: page.thumbnailUrl }
                        });
                    }
                }
                if (action.actionType === 'Entity') {
                    if (action.data?.name && results.length > 0) {
                        results[0].description = `**🧠 Bing Identified:** ${action.data.name}\n\n` + results[0].description;
                        results[0].metadata = { ...results[0].metadata, identifiedEntity: action.data.name };
                    }
                }
            }
        }

        console.log(`[Siphon:Bing] Extracted ${results.length} results.`);
    } catch (e: any) {
        console.error('[Siphon:Bing] Engine failed:', e.message);
    }
    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export async function siphonHub(imageUrl: string): Promise<ConnectorResult> {
    const isDataUrl = imageUrl?.startsWith('data:');
    console.log(`[SiphonHub] Starting. isDataUrl=${isDataUrl}`);

    const hasVision = !!process.env.GOOGLE_VISION_API_KEY;
    const hasSerpApi = !!process.env.SERPAPI_KEY;
    const hasBing = !!process.env.BING_SEARCH_API_KEY;

    // If no API keys at all — return a single actionable advisory
    if (!hasVision && !hasSerpApi && !hasBing) {
        console.warn('[SiphonHub] No visual search API keys configured.');
        return {
            connectorType: 'siphon_hub',
            query: isDataUrl ? 'local_upload' : imageUrl,
            results: [{
                title: 'Visual Search — API Configuration Required',
                url: 'https://aletheia-live.vercel.app',
                description: [
                    '**Visual intelligence engines are locked.** To enable automated reverse image search, set one or more of these in your Vercel project settings:\n',
                    '**1. GOOGLE_VISION_API_KEY** — Best option. Free 1000/month. Identifies people, finds all pages containing the image.',
                    '   → console.cloud.google.com → Enable "Cloud Vision API" → Create API Key\n',
                    '**2. BING_SEARCH_API_KEY** — Free 1000/month. Microsoft official API.',
                    '   → portal.azure.com → Cognitive Services → Bing Search v7\n',
                    '**3. SERPAPI_KEY** — Free 100/month. Google + Yandex results.',
                    '   → serpapi.com → Sign up for free tier',
                ].join('\n'),
                category: 'image_search',
                platform: 'Aletheia Engine',
                confidenceScore: 0,
                confidenceLabel: 'LOW',
                isVerified: false,
                metadata: { source: 'advisory', actionRequired: 'configure_visual_api_keys' }
            }],
            generatedAt: new Date().toISOString(),
        };
    }

    // Get image data
    const imgData = await toBase64(imageUrl);
    if (!imgData) {
        console.error('[SiphonHub] Could not read image data');
        return { connectorType: 'siphon_hub', query: imageUrl, results: [], generatedAt: new Date().toISOString() };
    }

    // Get public URL (needed for SerpAPI)
    let publicUrl: string | null = null;
    if (hasSerpApi) {
        publicUrl = await getPublicUrl(imageUrl, imgData.base64, imgData.mimeType);
    }

    // Run all available engines concurrently
    const [visionRes, serpRes, bingRes] = await Promise.allSettled([
        googleVisionEngine(imgData.base64),
        serpApiEngine(publicUrl),
        bingVisionEngine(imgData.base64, imgData.mimeType),
    ]);

    const extract = (r: PromiseSettledResult<SearchResult[]>) =>
        r.status === 'fulfilled' ? r.value : [];

    const all = [
        ...extract(visionRes),
        ...extract(serpRes),
        ...extract(bingRes),
    ];

    // Deduplicate by URL
    const seen = new Set<string>();
    const results = all.filter(r => {
        if (!r.url || seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });

    console.log(`[SiphonHub] Final: ${results.length} results (Vision:${extract(visionRes).length}, SerpAPI:${extract(serpRes).length}, Bing:${extract(bingRes).length})`);

    return {
        connectorType: 'siphon_hub',
        query: isDataUrl ? 'local_upload' : imageUrl,
        results,
        generatedAt: new Date().toISOString(),
    };
}
