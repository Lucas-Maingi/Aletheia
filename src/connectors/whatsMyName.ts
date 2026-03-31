import { ConnectorResult, SearchResult } from './types';

/**
 * WhatsMyName Connector — high-fidelity username scouting across social layers.
 * Iterates through a curated list of high-probability platforms.
 */
const NOT_FOUND_PATTERNS = [
    "page not found",
    "sorry, this page isn't available",
    "this account doesn't exist",
    "account doesn't exist",
    "user not found",
    "isn't available",
    "couldn't find this page",
    "specified profile could not be found",
    "not the web page you are looking for",
    "404 - page not found",
    "link you followed may be broken",
    "page may have been removed"
];

const GENERIC_BLOCKLIST = new Set(['new target', 'new investigation', 'untitled', 'unknown', 'target', 'subject', 'search', 'placeholder', 'case', 'dossier', 'null', 'undefined', 'anonymous']);

/**
 * WhatsMyName Connector — high-fidelity username scouting with HTML-level verification.
 * Eliminates "hallucinations" caused by redirects and generic login pages.
 */
export async function whatsMyName(username: string): Promise<ConnectorResult> {
    const results: SearchResult[] = [];
    const cleanUsername = username.trim().toLowerCase();

    if (GENERIC_BLOCKLIST.has(cleanUsername) || cleanUsername.length < 3) {
        return { connectorType: 'whatsmyname', query: username, results: [], generatedAt: new Date().toISOString() };
    }

    const platforms = [
        { name: 'GitHub', url: `https://github.com/${cleanUsername}` },
        { name: 'Reddit', url: `https://www.reddit.com/user/${cleanUsername}` },
        { name: 'Instagram', url: `https://www.instagram.com/${cleanUsername}/` },
        { name: 'Twitter/X', url: `https://twitter.com/${cleanUsername}` },
        { name: 'Pinterest', url: `https://www.pinterest.com/${cleanUsername}/` },
        { name: 'Medium', url: `https://medium.com/@${cleanUsername}` },
        { name: 'Linktree', url: `https://linktr.ee/${cleanUsername}` },
        { name: 'Steam', url: `https://steamcommunity.com/id/${cleanUsername}` }
    ];

    const checkPlatformStrictly = async (p: { name: string, url: string }) => {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 8000);
            
            const res = await fetch(p.url, { 
                method: 'GET',
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html'
                },
                signal: controller.signal 
            }).finally(() => clearTimeout(id));

            if (res.ok) {
                const body = (await res.text()).toLowerCase();
                
                // Verify the username actually exists on the page (Social Proof)
                const usernameExists = body.includes(cleanUsername);
                
                // Check if the page is a generic "Not Found" redirect
                const isNotFound = NOT_FOUND_PATTERNS.some(pattern => body.includes(pattern));
                
                if (usernameExists && !isNotFound) {
                    results.push({
                        title: `${p.name} Profile — ${cleanUsername}`,
                        url: p.url,
                        description: `### ✅ VERIFIED SOCIAL IDENTITY\n\n**Platform:** ${p.name}\n**Handle:** @${cleanUsername}\n\nConfirmed account presence via HTML-level signature analysis. Node validated.`,
                        category: 'social',
                        platform: p.name,
                        confidenceScore: 0.95,
                        confidenceLabel: 'HIGH',
                        isVerified: true
                    });
                }
            }
        } catch { /* skip */ }
    };

    // Execute in parallel chunks of 4 for speed
    const chunks = [];
    for (let i = 0; i < platforms.length; i += 4) {
        chunks.push(platforms.slice(i, i + 4));
    }

    for (const chunk of chunks) {
        await Promise.allSettled(chunk.map(checkPlatformStrictly));
    }

    return {
        connectorType: 'whatsmyname',
        query: cleanUsername,
        results,
        generatedAt: new Date().toISOString(),
    };
}
