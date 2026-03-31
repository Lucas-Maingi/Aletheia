import { ConnectorResult, SearchResult } from './types';
const GENERIC_BLOCKLIST = new Set(['new target', 'new investigation', 'untitled', 'unknown', 'target', 'subject', 'search', 'placeholder', 'case', 'dossier', 'null', 'undefined', 'anonymous', 'investigation']);

/**
 * Interpol Red Notices Search - Global Criminal Background
 * Hits the official INTERPOL API to check if a subject has an active international arrest warrant.
 */
export async function interpolSearch({ name, username }: { name?: string, username?: string }): Promise<ConnectorResult> {
    const results: SearchResult[] = [];
    const query = (name || username || '').trim();

    if (!query || GENERIC_BLOCKLIST.has(query.toLowerCase()) || query.length < 3) {
        return { connectorType: 'interpol_search', query: query, results: [], generatedAt: new Date().toISOString() };
    }

    try {
        // Simple heuristic to split name vs forename if there's a space
        const parts = query.split(' ').map(p => p.trim()).filter(Boolean);
        let apiUrl = `https://ws-public.interpol.int/notices/v1/red?name=${encodeURIComponent(query)}`;

        if (parts.length >= 2) {
            const forename = parts[0];
            const lastName = parts.slice(1).join(' ');
            apiUrl = `https://ws-public.interpol.int/notices/v1/red?forename=${encodeURIComponent(forename)}&name=${encodeURIComponent(lastName)}`;
        }

        const res = await fetch(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json();
            const notices = data._embedded?.notices || [];

            if (notices.length > 0) {
                // If there's an exact match on Interpol, this is monumental.
                results.push({
                    title: `⚠️ INTERPOL RED NOTICE — ${notices.length} Match(es) Found`,
                    url: `https://www.interpol.int/How-we-work/Notices/View-Red-Notices`,
                    description: `CRITICAL ALERT: Found ${notices.length} active international arrest warrant(s) (Red Notice) potentially matching the target "${query}". A Red Notice is a request to law enforcement worldwide to locate and provisionally arrest a person pending extradition, surrender, or similar legal action.`,
                    category: 'criminal',
                    platform: 'Interpol',
                });

                for (const notice of notices.slice(0, 3)) { // Log up to 3 details
                    const dobStr = notice.date_of_birth ? ` DOB: ${notice.date_of_birth}` : '';
                    results.push({
                        title: `Interpol Notice — ${notice.forename} ${notice.name}`,
                        url: notice._links?.self?.href || `https://www.interpol.int/`,
                        description: `Fugitive wanted by jurisdiction. Entity Name: ${notice.forename} ${notice.name}.${dobStr} Nationalities: ${(notice.nationalities || []).join(', ')}.`,
                        category: 'criminal',
                        platform: 'Interpol',
                    });
                }
            }
        } else {
            // Only log systemic errors for debugging if needed, but for Interpol we can fail silently to avoid spam.
            console.error(`Interpol API blocked: ${res.status}`);
        }
    } catch (e) {
        console.error("Interpol search failed:", e);
    }

    return {
        connectorType: 'interpol_search',
        query,
        results,
        generatedAt: new Date().toISOString(),
    };
}
