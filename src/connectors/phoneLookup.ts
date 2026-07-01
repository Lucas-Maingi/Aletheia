import { ConnectorResult, SearchResult } from './types';

/**
 * NumLookup API Connector — validates phone numbers and retrieves carrier and location intelligence.
 * Requires NUMLOOKUP_API_KEY to be set in the environment variables.
 */
export async function phoneLookup(phone: string): Promise<ConnectorResult> {
    const results: SearchResult[] = [];
    const apiKey = process.env.NUMLOOKUP_API_KEY;

    if (!apiKey) {
        console.warn("[NumLookup] NUMLOOKUP_API_KEY is not defined. Returning empty results.");
        return {
            connectorType: 'phoneLookup',
            query: phone,
            results: [],
            generatedAt: new Date().toISOString(),
        };
    }

    // Clean phone number (keep numbers and + prefix)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const url = `https://api.numlookupapi.com/v1/validate/${cleanPhone}?apikey=${apiKey}`;

    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (res.ok) {
            const data = await res.json();
            
            // The API response is parsed according to numlookupapi.com response payload
            if (data.valid) {
                const descriptionParts = [
                    data.carrier ? `Carrier: ${data.carrier}` : null,
                    data.line_type ? `Line Type: ${data.line_type}` : null,
                    data.location ? `Location: ${data.location}, ${data.country_name || ''}` : (data.country_name ? `Country: ${data.country_name}` : null)
                ].filter(Boolean);

                results.push({
                    title: `Phone Intelligence — ${data.intl_format || phone}`,
                    url: `https://numlookupapi.com/`,
                    description: descriptionParts.length > 0 ? descriptionParts.join(' · ') : 'Valid phone number, no carrier details returned.',
                    category: 'phone_intel',
                    platform: 'NumLookup',
                    metadata: data,
                    confidenceScore: 0.95,
                    confidenceLabel: 'HIGH'
                });
            } else {
                results.push({
                    title: `Phone Lookup — ${phone}`,
                    url: `https://numlookupapi.com/`,
                    description: `Specified number is invalid or could not be mapped by NumLookup.`,
                    category: 'phone_intel',
                    platform: 'NumLookup',
                    metadata: data,
                    confidenceScore: 0.50,
                    confidenceLabel: 'LOW'
                });
            }
        } else {
            console.error(`[NumLookup] API returned status ${res.status}:`, await res.text());
            results.push({
                title: `Phone Lookup Failed — ${phone}`,
                url: `https://numlookupapi.com/`,
                description: `Failed to query phone intelligence. API returned status ${res.status}.`,
                category: 'phone_intel',
                platform: 'NumLookup',
                metadata: { status: res.status },
                confidenceScore: 0.0,
                confidenceLabel: 'LOW'
            });
        }
    } catch (err: any) {
        console.error("[NumLookup] Error calling API:", err);
        results.push({
            title: `Phone Lookup Failed — ${phone}`,
            url: `https://numlookupapi.com/`,
            description: `Network or service resolution error: ${err.message || err}`,
            category: 'phone_intel',
            platform: 'NumLookup',
            metadata: { error: err.message || err },
            confidenceScore: 0.0,
            confidenceLabel: 'LOW'
        });
    }

    return {
        connectorType: 'phoneLookup',
        query: phone,
        results,
        generatedAt: new Date().toISOString(),
    };
}
