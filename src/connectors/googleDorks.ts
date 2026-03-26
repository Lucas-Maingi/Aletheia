import { ConnectorResult, SearchResult } from './types';

function getRandomUserAgent() {
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Intelligence Dorks — uses DuckDuckGo Instant Answer, Wikipedia API, 
 * and DuckDuckGo HTML search to find real information about the target.
 */
export async function googleDorks({ name, username, email }: {
    name?: string;
    username?: string;
    email?: string;
}): Promise<ConnectorResult> {
    const results: SearchResult[] = [];
    const query = email || username || name || '';

    if (!query) {
        return { connectorType: 'google_dork', query: '', results: [], generatedAt: new Date().toISOString() };
    }

    const quickFetch = (url: string, opts: RequestInit = {}) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000);
        const headers = {
            'User-Agent': getRandomUserAgent(),
            ...(opts.headers || {})
        };
        return fetch(url, { ...opts, headers, signal: controller.signal }).finally(() => clearTimeout(id));
    };

    const allChecks = [
        // 1. DuckDuckGo Instant Answer
        (async () => {
            try {
                const ddgQuery = encodeURIComponent(query);
                const ddgRes = await quickFetch(`https://api.duckduckgo.com/?q=${ddgQuery}&format=json&no_redirect=1&no_html=1`, {
                    headers: { 'User-Agent': 'OpenVector-OSINT-Engine/1.0' },
                });
                if (ddgRes.ok) {
                    const text = await ddgRes.text();
                    if (text && text.trim().startsWith('{')) {
                        try {
                            const ddg = JSON.parse(text);
                            if (ddg.AbstractText) {
                                results.push({
                                    title: `${ddg.AbstractSource || 'Web Encyclopedia'} — ${ddg.Heading || query}`,
                                    url: ddg.AbstractURL || `https://duckduckgo.com/?q=${ddgQuery}`,
                                    description: ddg.AbstractText.slice(0, 1500),
                                    category: 'identity',
                                    platform: ddg.AbstractSource || 'DuckDuckGo',
                                    confidenceScore: 0.85,
                                    confidenceLabel: 'HIGH'
                                });
                            }
                        } catch { /* skip */ }
                    }
                }
            } catch { /* skip */ }
        })(),

        // 2. Wikipedia API — Case-insensitive search with opensearch first, then extract
        (async () => {
            if (!name && !username) return;
            const wikiTarget = name || username || '';
            try {
                // Use opensearch to find the correct article title (handles case)
                const searchRes = await quickFetch(
                    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(wikiTarget)}&limit=1&format=json`,
                    { headers: { 'User-Agent': 'OpenVector-OSINT-Scanner/1.0 (info@openvector.dev)' } }
                );
                if (!searchRes.ok) return;

                const searchData = await searchRes.json();
                const articleTitle = searchData?.[1]?.[0]; // First result title

                if (!articleTitle) return;

                // Now fetch the full extract using the correct title
                const wikiRes = await quickFetch(
                    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(articleTitle)}`,
                    { headers: { 'User-Agent': 'OpenVector-OSINT-Scanner/1.0 (info@openvector.dev)' } }
                );
                if (!wikiRes.ok) return;

                const wikiData = await wikiRes.json();
                const pages = wikiData.query?.pages;
                if (!pages) return;

                const pageId = Object.keys(pages)[0];
                if (pageId !== '-1' && pages[pageId].extract) {
                    results.push({
                        title: `Wikipedia — ${pages[pageId].title}`,
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pages[pageId].title)}`,
                        description: pages[pageId].extract.slice(0, 2000),
                        category: 'identity',
                        platform: 'Wikipedia',
                        confidenceScore: 0.90,
                        confidenceLabel: 'HIGH'
                    });
                }
            } catch { /* skip */ }
        })(),

        // 3. Yahoo General Web Search — finds news articles, interviews, public records
        (async () => {
            try {
                const searchQuery = name || username || email || '';
                const res = await quickFetch(`https://search.yahoo.com/search?p=${encodeURIComponent(searchQuery)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                });
                if (!res.ok) return;

                const html = await res.text();
                const resultBlocks = html.split('class="compTitle').slice(1, 6); // Top 5

                const entries: string[] = [];

                for (const block of resultBlocks) {
                    const titleMatch = block.match(/<h3[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/) || block.match(/<h3[^>]*>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
                    const snippetArea = block.substring(0, 1500);
                    const snippetMatch = snippetArea.match(/class="compText[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
                    const urlMatch = block.match(/href="[^"]*RU=([^/&"]+)/) || block.match(/href="([^"]+)"/);

                    if (titleMatch && urlMatch) {
                        let rawUrl = decodeURIComponent(urlMatch[1]);
                        let title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
                        let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
                        
                        // Ignore internal Yahoo links and redirects
                        if (!rawUrl.includes('yahoo.com/search') && !rawUrl.startsWith('/')) {
                            const snippetLower = snippet.toLowerCase();
                            const titleLower = title.toLowerCase();
                            const targetLower = searchQuery.toLowerCase();
                            
                            const targetTokens = searchQuery.toLowerCase().split(/[\s@._-]+/).filter((t: string) => t.length > 2);
                            const hasRelevance = targetTokens.length > 0 
                                ? targetTokens.some((t: string) => titleLower.includes(t) || snippetLower.includes(t) || rawUrl.toLowerCase().includes(t))
                                : (titleLower.includes(targetLower) || snippetLower.includes(targetLower));

                            const isGenericUrl = rawUrl.toLowerCase().includes('/login') || rawUrl.toLowerCase().includes('/signup');
                            const isGenericTitle = titleLower.includes('sign up') || titleLower.includes('log in');

                            const isHighlyRelevant = !isGenericUrl && !isGenericTitle && hasRelevance && !rawUrl.toLowerCase().includes('yahoo.com/search');

                            if (isHighlyRelevant) {
                                entries.push(`• ${title}\n  ${snippet}\n  Source: ${rawUrl}`);
                            }
                        }
                    }
                }

                if (entries.length > 0) {
                    results.push({
                        title: `Web Intelligence — ${searchQuery}`,
                        url: `https://search.yahoo.com/search?p=${encodeURIComponent(searchQuery)}`,
                        description: `TOP ${entries.length} SEARCH RESULTS:\n\n${entries.join('\n\n')}`,
                        category: 'general',
                        platform: 'Yahoo Search',
                        confidenceScore: 0.60,
                        confidenceLabel: 'MEDIUM'
                    });
                }
            } catch { /* skip */ }
        })(),

        // 4. GitHub Code Search (for emails only)
        (async () => {
            if (!email) return;
            try {
                const ghRes = await quickFetch(`https://api.github.com/search/code?q=${encodeURIComponent(email)}`, {
                    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'OpenVector-OSINT' },
                });
                if (ghRes.ok) {
                    const data = await ghRes.json();
                    if (data.total_count > 0) {
                        const files = data.items?.slice(0, 5).map((item: any) =>
                            `• ${item.repository?.full_name}/${item.name}`
                        ).join('\n') || '';

                        results.push({
                            title: `GitHub Code Exposure — ${data.total_count} files`,
                            url: `https://github.com/search?q=${encodeURIComponent(email)}&type=code`,
                            description: `FOUND ${email} in ${data.total_count} public code file(s):\n\n${files}`,
                            category: 'breach',
                            platform: 'GitHub',
                            confidenceScore: 0.90,
                            confidenceLabel: 'HIGH'
                        });
                    }
                }
            } catch { /* skip */ }
        })(),

        // 5. Broad-Spectrum Social Site Dorks via Yahoo
        (async () => {
            const target = name || username || email || '';
            if (!target) return;
            
            const cleanTarget = (email ? email.split('@')[0] : target).toLowerCase();
            // FIDELITY: Only search for the FULL email string. 
            // Do NOT search for handles derived from the email prefix.
            const searchTerms = email ? `"${email}"` : `"${target}"`;

            const platforms = [
                { name: 'LinkedIn', site: 'linkedin.com/in' },
                { name: 'Twitter/X', site: 'x.com OR site:twitter.com' },
                { name: 'Instagram', site: 'instagram.com' },
                { name: 'Facebook', site: 'facebook.com' },
                { name: 'Truth Social', site: 'truthsocial.com' },
            ];

            for (const p of platforms) {
                try {
                    const dork = `site:${p.site} ${searchTerms}`;
                    const res = await quickFetch(`https://search.yahoo.com/search?p=${encodeURIComponent(dork)}`, {
                        headers: {
                            'User-Agent': getRandomUserAgent(),
                        },
                    });
                    if (!res.ok) continue;

                    const html = await res.text();
                    const resultBlocks = html.split('class="compTitle').slice(1, 4);

                    for (const block of resultBlocks) {
                        const titleMatch = block.match(/<h3[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/) || block.match(/<h3[^>]*>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
                        const snippetArea = block.substring(0, 1500);
                        const snippetMatch = snippetArea.match(/class="compText[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
                        const urlMatch = block.match(/href="[^"]*RU=([^/&"]+)/) || block.match(/href="([^"]+)"/);

                        if (titleMatch && urlMatch) {
                            let url = decodeURIComponent(urlMatch[1]);
                            let title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
                            let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : 'No biography available.';

                            // Only accept if highly relevant and not a generic yahoo link
                            const snippetLower = snippet.toLowerCase();
                            const titleLower = title.toLowerCase();
                            const urlLower = url.toLowerCase();
                            const emailLower = email?.toLowerCase() || '';
                            const cleanTargetLower = cleanTarget.toLowerCase();
                            
                            // Check if either the full email or the handle appears in the result
                            const isHighlyRelevant = 
                                (urlLower.includes(cleanTargetLower) || titleLower.includes(cleanTargetLower) || (email && snippetLower.includes(emailLower))) &&
                                !urlLower.includes('/login') && 
                                !urlLower.includes('/signup') && 
                                !urlLower.includes('password') &&
                                !url.includes('yahoo.com/search');

                            if (isHighlyRelevant && !results.some(r => r.url === url)) {
                                results.push({
                                    title: `${p.name} Profile — ${title}`,
                                    url,
                                    description: `### 🪪 Social Identity Discovery\n\n**Platform:** ${p.name}\n**Profile Name:** ${title}\n\n**Biography / Snippet:**\n> ${snippet}\n\n**Direct Link:** ${url}`,
                                    category: 'social',
                                    platform: p.name,
                                    confidenceScore: 0.92,
                                    confidenceLabel: 'HIGH'
                                });
                                break; 
                            }
                        }
                    }
                } catch { /* skip platform */ }
            }
        })(),

        // 6. Deep Entity Search (Fallback for all targets)
        (async () => {
            const target = name || username || email || '';
            if (!target) return;
            try {
                // Specialized dork for profile gathering for major public figures or deeply hidden accounts
                const dork = `"${target}" (site:x.com OR site:truthsocial.com OR site:instagram.com OR site:linkedin.com/in) -news -article`;
                const res = await quickFetch(`https://search.yahoo.com/search?p=${encodeURIComponent(dork)}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                });
                if (!res.ok) return;

                const html = await res.text();
                const resultBlocks = html.split('class="compTitle').slice(1, 5);

                for (const block of resultBlocks) {
                    const titleMatch = block.match(/<h3[^>]*>[\s\S]*?<span[^>]*>(.*?)<\/span>/) || block.match(/<h3[^>]*>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
                    const snippetArea = block.substring(0, 1500);
                    const snippetMatch = snippetArea.match(/class="compText[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
                    const urlMatch = block.match(/href="[^"]*RU=([^/&"]+)/) || block.match(/href="([^"]+)"/);

                    if (titleMatch && urlMatch) {
                        let url = decodeURIComponent(urlMatch[1]);
                        let title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
                        let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : 'No biography available.';
                        
                        // Parse platform from URL
                        let platform = 'Web';
                        if (url.includes('x.com') || url.includes('twitter.com')) platform = 'X/Twitter';
                        else if (url.includes('truthsocial.com')) platform = 'Truth Social';
                        else if (url.includes('instagram.com')) platform = 'Instagram';
                        else if (url.includes('linkedin.com')) platform = 'LinkedIn';

                        if (platform !== 'Web' && !results.some(r => r.url === url) && !url.includes('yahoo.com/search')) {
                            const snippetLower = snippet.toLowerCase();
                            const titleLower = title.toLowerCase();
                            const targetLower = target.toLowerCase();

                            const isGeneric = 
                                titleLower.includes('sign up') || 
                                titleLower.includes('log in') ||
                                snippetLower.includes('sign up to see photos') ||
                                snippetLower.includes('log in to instagram') ||
                                snippetLower.includes('forgot password') ||
                                snippetLower.includes('create an account') ||
                                snippetLower.includes('discover what\'s new') ||
                                (titleLower === platform.toLowerCase() && snippetLower.length < 50);

                            const isHighlyRelevant = !isGeneric && 
                                (titleLower.includes(targetLower) ||
                                 snippetLower.includes(targetLower) ||
                                 url.toLowerCase().includes(target.replace(/\s+/g, '').toLowerCase()));

                            if (isHighlyRelevant) {
                                results.push({
                                    title: `Verified Global Profile — ${title}`,
                                    url,
                                    description: `### 🪪 Verified Profile Postcard\n\n**Platform:** ${platform}\n**Identity:** ${title}\n\n**Biography / Snippet:**\n> ${snippet}\n\n**Direct Link:** ${url}`,
                                    category: 'social',
                                    platform,
                                    confidenceScore: 0.95,
                                    confidenceLabel: 'HIGH'
                                });
                            }
                        }
                    }
                }
            } catch { /* skip */ }
        })(),
    ];

    await Promise.allSettled(allChecks);

    return {
        connectorType: 'google_dork',
        query,
        results,
        generatedAt: new Date().toISOString(),
    };
}
