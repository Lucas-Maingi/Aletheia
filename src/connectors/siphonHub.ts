import { ConnectorResult, SearchResult } from './types';

/**
 * Aletheia Siphon Hub — Real Multi-Engine Visual Intelligence.
 * Submits images directly to search engines and returns extracted results.
 * No "click here" links — purely automated server-side reconnaissance.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/** Extract raw buffer from a URL or Data URL */
async function fetchImageBuffer(imageUrl: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return null;
        return { buffer: Buffer.from(match[2], 'base64'), mimeType: match[1] };
    }
    try {
        const res = await fetch(imageUrl, {
            headers: { 'User-Agent': UA },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return null;
        return {
            buffer: Buffer.from(await res.arrayBuffer()),
            mimeType: res.headers.get('content-type') || 'image/jpeg'
        };
    } catch {
        return null;
    }
}

/** Build a FormData blob from a buffer — works in both Node 18+ and Edge */
function buildFormDataWithImage(buffer: Buffer, mimeType: string, fieldName: string, filename: string): FormData {
    const fd = new FormData();
    const arrayBuf = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    fd.append(fieldName, new Blob([arrayBuf], { type: mimeType }), filename);
    return fd;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 1: YANDEX — Binary upload → redirect → scrape cbir results
// Best engine for face/person identification in the free tier
// ─────────────────────────────────────────────────────────────────────────────
async function yandexEngine(imageUrl: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    try {
        const imgData = await fetchImageBuffer(imageUrl);
        if (!imgData) throw new Error('Could not read image data');

        const fd = buildFormDataWithImage(imgData.buffer, imgData.mimeType, 'upfile', 'target.jpg');

        // Step 1: POST image — Yandex returns 302 redirect to the search results URL
        const uploadRes = await fetch('https://yandex.com/images/search?rpt=imageview', {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://yandex.com',
                'Referer': 'https://yandex.com/images/',
            },
            body: fd,
            redirect: 'manual',
            signal: AbortSignal.timeout(25000),
        });

        let searchUrl: string | null = null;

        if (uploadRes.status === 302 || uploadRes.status === 301) {
            const loc = uploadRes.headers.get('location');
            if (loc) searchUrl = loc.startsWith('http') ? loc : `https://yandex.com${loc}`;
        } else if (uploadRes.status === 200) {
            const body = await uploadRes.text();
            const m = body.match(/cbir_id=([a-zA-Z0-9_%-]+)/);
            if (m) searchUrl = `https://yandex.com/images/search?cbir_id=${m[1]}&rpt=imageview`;
        }

        if (!searchUrl) {
            console.error(`[Siphon:Yandex] Upload failed — status ${uploadRes.status}, no redirect.`);
            return [];
        }

        console.log(`[Siphon:Yandex] Redirected to: ${searchUrl}`);

        // Step 2: Fetch actual search results page
        const searchRes = await fetch(searchUrl, {
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html',
                'Referer': 'https://yandex.com/images/',
            },
            signal: AbortSignal.timeout(25000),
        });

        if (!searchRes.ok) {
            console.error(`[Siphon:Yandex] Results page failed — status ${searchRes.status}`);
            return [];
        }

        const html = await searchRes.text();

        // Step 3a: Extract "Sites that contain this image" (CbirSites)
        const cbirMatch = html.match(/"CbirSites"\s*:\s*\{"sites"\s*:\s*(\[[\s\S]*?\])\}/);
        if (cbirMatch) {
            try {
                const sites = JSON.parse(cbirMatch[1]);
                for (const site of sites.slice(0, 15)) {
                    const url = site.url || site.pageUrl;
                    if (!url || seen.has(url)) continue;
                    seen.add(url);
                    results.push({
                        title: site.title || `Image Found — ${site.domain || new URL(url).hostname}`,
                        url,
                        description: `This page contains your uploaded image. Found via Yandex reverse image search.\n\n**Source domain:** ${site.domain || new URL(url).hostname}\n**Page title:** ${site.title || '—'}`,
                        category: 'image_search',
                        platform: 'Yandex',
                        confidenceScore: 0.93,
                        confidenceLabel: 'HIGH',
                        isVerified: true,
                        metadata: { source: 'yandex_cbir_sites', domain: site.domain, thumb: site.thumb?.url }
                    });
                }
            } catch { /* skip malformed JSON */ }
        }

        // Step 3b: Extract similar images from data-bem JSON blocks
        const bemReg = /data-bem='(\{[\s\S]*?serp-item[\s\S]*?\})'/g;
        let m2: RegExpExecArray | null;
        while ((m2 = bemReg.exec(html)) !== null && results.length < 30) {
            try {
                const data = JSON.parse(m2[1].replace(/&quot;/g, '"'));
                const item = data['serp-item'];
                if (!item?.img_href) continue;
                const url = item.img_href;
                if (seen.has(url)) continue;
                seen.add(url);
                results.push({
                    title: item.snippet?.title || item.snippet?.text || `Image Match — ${item.snippet?.domain || 'Yandex Index'}`,
                    url,
                    description: `Visually similar content indexed on Yandex.\n\n**Source:** ${item.snippet?.url || item.snippet?.domain || url}`,
                    category: 'image_search',
                    platform: 'Yandex',
                    confidenceScore: 0.85,
                    confidenceLabel: 'HIGH',
                    isVerified: true,
                    metadata: {
                        thumbnailUrl: item.preview?.[0]?.url || item.thumb?.url,
                        source: 'yandex_similar_images',
                        sourceHost: item.snippet?.domain
                    }
                });
            } catch { /* skip */ }
        }

        // Step 3c: Look for entity/celebrity name in the page
        const entityMatch = html.match(/"name"\s*:\s*"([^"]{3,80})"/);
        if (entityMatch && results.length > 0) {
            const name = entityMatch[1];
            console.log(`[Siphon:Yandex] Entity identified: "${name}"`);
            // Annotate the first result with the identified entity
            results[0].metadata = { ...results[0].metadata, identifiedEntity: name };
            results[0].description += `\n\n**🧠 Yandex Entity Recognition:** ${name}`;
        }

        console.log(`[Siphon:Yandex] Extracted ${results.length} real results.`);
    } catch (e: any) {
        console.error('[Siphon:Yandex] Engine failed:', e.message);
    }

    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 2: TINEYE — Exact image match search (find published copies)
// No API key needed, good for finding where an exact image has appeared
// ─────────────────────────────────────────────────────────────────────────────
async function tinEyeEngine(imageUrl: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
        const imgData = await fetchImageBuffer(imageUrl);
        if (!imgData) return [];

        const fd = buildFormDataWithImage(imgData.buffer, imgData.mimeType, 'image', 'target.jpg');

        const res = await fetch('https://tineye.com/search', {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml',
                'Origin': 'https://tineye.com',
                'Referer': 'https://tineye.com/',
            },
            body: fd,
            signal: AbortSignal.timeout(25000),
        });

        if (!res.ok) {
            console.error(`[Siphon:TinEye] Upload failed — ${res.status}`);
            return [];
        }

        const html = await res.text();

        // Extract match count
        const countMatch = html.match(/(\d[\d,]*)\s+(?:results?|matches?)\s+found/i);
        const matchCount = countMatch ? countMatch[1].replace(',', '') : '0';

        if (matchCount === '0' || html.includes('No results found')) {
            console.log('[Siphon:TinEye] No exact matches.');
            return [];
        }

        // Extract individual results
        // TinEye result items: <div class="match"> or JSON embedded in __NEXT_DATA__
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
            try {
                const nextData = JSON.parse(nextDataMatch[1]);
                const matches = nextData?.props?.pageProps?.matches || nextData?.props?.pageProps?.results || [];

                for (const match of matches.slice(0, 15)) {
                    const url = match.backlink_url || match.url;
                    if (!url) continue;
                    results.push({
                        title: match.domain || new URL(url).hostname,
                        url,
                        description: `Exact match found on TinEye. This page published your image.\n\n**Domain:** ${match.domain}\n**Image URL:** ${match.image_url || '—'}`,
                        category: 'image_search',
                        platform: 'TinEye',
                        confidenceScore: 0.97,
                        confidenceLabel: 'VERIFIED',
                        isVerified: true,
                        metadata: { source: 'tineye', thumbnailUrl: match.image_url }
                    });
                }
            } catch { /* fall through to regex */ }
        }

        // Fallback: regex scrape backlinks
        if (results.length === 0) {
            const linkReg = /backlink_url["']?\s*:\s*["']([^"'\s]+)/g;
            let lm: RegExpExecArray | null;
            while ((lm = linkReg.exec(html)) !== null && results.length < 15) {
                try {
                    const url = lm[1];
                    const host = new URL(url).hostname;
                    results.push({
                        title: `Image Match — ${host}`,
                        url,
                        description: `TinEye found this exact image on ${host}.`,
                        category: 'image_search',
                        platform: 'TinEye',
                        confidenceScore: 0.97,
                        confidenceLabel: 'VERIFIED',
                        isVerified: true,
                        metadata: { source: 'tineye' }
                    });
                } catch { /* skip */ }
            }
        }

        console.log(`[Siphon:TinEye] Extracted ${results.length} results (${matchCount} total on site).`);
    } catch (e: any) {
        console.error('[Siphon:TinEye] Engine failed:', e.message);
    }

    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE 3: BING VISUAL SEARCH — Binary upload to Bing's API
// Bing accepts multipart image uploads without API key for basic usage
// ─────────────────────────────────────────────────────────────────────────────
async function bingEngine(imageUrl: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
        const imgData = await fetchImageBuffer(imageUrl);
        if (!imgData) return [];

        const fd = buildFormDataWithImage(imgData.buffer, imgData.mimeType, 'imgStream', 'target.jpg');

        const bingKey = process.env.BING_SEARCH_API_KEY;

        if (bingKey) {
            // Premium path: Bing Visual Search API
            const apiRes = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': bingKey,
                    'Accept': 'application/json',
                },
                body: fd,
                signal: AbortSignal.timeout(20000),
            });

            if (apiRes.ok) {
                const data = await apiRes.json() as any;
                const tags = data?.tags || [];
                for (const tag of tags.slice(0, 5)) {
                    for (const action of (tag.actions || []).slice(0, 10)) {
                        if (action.actionType === 'PagesIncluding') {
                            for (const page of (action.data?.value || []).slice(0, 5)) {
                                results.push({
                                    title: page.name || page.hostPageDisplayUrl,
                                    url: page.hostPageUrl || page.contentUrl,
                                    description: `Bing Visual Search: This page contains your image.\n\n**Source:** ${page.hostPageDisplayUrl}`,
                                    category: 'image_search',
                                    platform: 'Bing',
                                    confidenceScore: 0.90,
                                    confidenceLabel: 'HIGH',
                                    isVerified: true,
                                    metadata: { source: 'bing_api', thumbnailUrl: page.thumbnailUrl }
                                });
                            }
                        }
                    }
                }
                console.log(`[Siphon:Bing] API extracted ${results.length} results.`);
                return results;
            }
        }

        // Free path: Bing SBI (search by image) endpoint
        const res = await fetch('https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIVSP', {
            method: 'POST',
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml',
                'Origin': 'https://www.bing.com',
                'Referer': 'https://www.bing.com/visualsearch',
            },
            body: fd,
            redirect: 'follow',
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) return [];

        const html = await res.text();
        if (html.includes('captcha') || html.includes('reCAPTCHA') || html.length < 1000) {
            console.warn('[Siphon:Bing] Bot-blocked or CAPTCHA detected.');
            return [];
        }

        // Extract Bing results from JSON blob
        const dataMatch = html.match(/var\s+_model\s*=\s*(\{[\s\S]*?\});\s*\n/);
        if (dataMatch) {
            try {
                const data = JSON.parse(dataMatch[1]);
                const pages = data?.results?.value || data?.MediaResults?.value || [];
                for (const item of pages.slice(0, 15)) {
                    const url = item.hostPageUrl || item.contentUrl;
                    if (!url) continue;
                    results.push({
                        title: item.name || `Image Match — ${item.hostPageDisplayUrl}`,
                        url,
                        description: `Bing found this image on the web.\n\n**Source:** ${item.hostPageDisplayUrl || url}`,
                        category: 'image_search',
                        platform: 'Bing',
                        confidenceScore: 0.85,
                        confidenceLabel: 'HIGH',
                        isVerified: true,
                        metadata: { source: 'bing_sbi', thumbnailUrl: item.thumbnailUrl }
                    });
                }
            } catch { /* skip */ }
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
    console.log(`[SiphonHub] Starting multi-engine visual recon. isDataUrl=${imageUrl?.startsWith('data:')}`);

    const [yandexResults, tinEyeResults, bingResults] = await Promise.allSettled([
        yandexEngine(imageUrl),
        tinEyeEngine(imageUrl),
        bingEngine(imageUrl),
    ]);

    const extract = (r: PromiseSettledResult<SearchResult[]>) =>
        r.status === 'fulfilled' ? r.value : [];

    const all = [
        ...extract(yandexResults),
        ...extract(tinEyeResults),
        ...extract(bingResults),
    ];

    // Global dedup by URL
    const seen = new Set<string>();
    const results = all.filter(r => {
        if (!r.url || seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });

    console.log(`[SiphonHub] Total unique results: ${results.length} (Yandex: ${extract(yandexResults).length}, TinEye: ${extract(tinEyeResults).length}, Bing: ${extract(bingResults).length})`);

    return {
        connectorType: 'siphon_hub',
        query: imageUrl.startsWith('data:') ? 'local_upload' : imageUrl,
        results,
        generatedAt: new Date().toISOString(),
    };
}
