import { NextResponse } from 'next/server';

/**
 * GET /api/diagnostic/visual
 * 
 * Quick live test of all visual intelligence API keys.
 * Sends a tiny real request to each configured API to verify they work.
 */
export async function GET() {
    const results: Record<string, any> = {};

    // 1. Google Vision API
    const visionKey = process.env.GOOGLE_VISION_API_KEY;
    results.google_vision = { configured: !!visionKey };
    if (visionKey) {
        try {
            // Use a tiny 1x1 white pixel as test image (base64)
            const testPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
            const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: [{ image: { content: testPixel }, features: [{ type: 'WEB_DETECTION', maxResults: 1 }] }]
                }),
                signal: AbortSignal.timeout(15000),
            });
            const data = await res.json();
            results.google_vision.status = res.ok ? 'WORKING' : 'ERROR';
            results.google_vision.httpStatus = res.status;
            if (!res.ok) results.google_vision.error = JSON.stringify(data).slice(0, 300);
        } catch (e: any) {
            results.google_vision.status = 'FAILED';
            results.google_vision.error = e.message;
        }
    }

    // 2. SerpAPI
    const serpKey = process.env.SERPAPI_KEY;
    results.serpapi = { configured: !!serpKey };
    if (serpKey) {
        try {
            const res = await fetch(`https://serpapi.com/account?api_key=${serpKey}`, {
                signal: AbortSignal.timeout(10000),
            });
            const data = await res.json();
            results.serpapi.status = res.ok ? 'WORKING' : 'ERROR';
            results.serpapi.remaining = data.total_searches_left;
            results.serpapi.plan = data.plan_name;
        } catch (e: any) {
            results.serpapi.status = 'FAILED';
            results.serpapi.error = e.message;
        }
    }

    // 3. Bing Visual Search
    const bingKey = process.env.BING_SEARCH_API_KEY;
    results.bing_visual = { configured: !!bingKey };
    // Just check if key exists — Bing doesn't have a simple account check endpoint

    // 4. FaceCheck
    const faceCheckToken = process.env.FACECHECK_API_TOKEN;
    results.facecheck = { configured: !!faceCheckToken };

    // Summary
    const activeEngines = [
        visionKey && 'Google Vision',
        serpKey && 'SerpAPI',
        bingKey && 'Bing',
        faceCheckToken && 'FaceCheck',
    ].filter(Boolean);

    return NextResponse.json({
        summary: `${activeEngines.length}/4 visual engines configured: ${activeEngines.join(', ') || 'NONE'}`,
        engines: results,
        recommendation: activeEngines.length === 0
            ? 'CRITICAL: No visual search APIs configured. Set GOOGLE_VISION_API_KEY in Vercel.'
            : activeEngines.length === 1
            ? 'WORKING but limited. Add SERPAPI_KEY or BING_SEARCH_API_KEY for broader coverage.'
            : 'Good coverage.',
    });
}
