import { ConnectorResult, SearchResult } from './types';

/**
 * Username Search — queries real public APIs AND uses DuckDuckGo HTML search
 * to find social profile data that direct scraping can't get (JS-rendered pages).
 */
const SERVICE_BLOCKLIST = new Set(['gmail', 'outlook', 'hotmail', 'yahoo', 'apple', 'icloud', 'protonmail', 'proton', 'mail', 'live', 'me', 'msn', 'yandex', 'google', 'facebook', 'instagram', 'twitter', 'x', 'linkedin', 'github', 'reddit', 'medium', 'youtube', 'tiktok']);

export async function usernameSearch(username: string): Promise<ConnectorResult> {
    const results: SearchResult[] = [];

    if (SERVICE_BLOCKLIST.has(username.toLowerCase())) {
        return {
            connectorType: 'username_search',
            query: username,
            results: [],
            generatedAt: new Date().toISOString(),
        };
    }

    // Helper: fetch with a 10-second timeout (improved resilience)
    const quickFetch = (url: string, opts: RequestInit = {}) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000);
        return fetch(url, { ...opts, signal: controller.signal })
            .finally(() => clearTimeout(id));
    };

    const allChecks = [
        // 1. GitHub Profile (real API — returns JSON with followers, repos, bio, etc.)
        (async () => {
            try {
                const ghRes = await quickFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
                    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'OpenVector-OSINT' },
                });
                if (ghRes.ok) {
                    const gh = await ghRes.json();
                    results.push({
                        title: `GitHub — ${gh.login}`,
                        url: gh.html_url,
                        description: [
                            gh.name ? `Name: ${gh.name}` : null,
                            gh.bio ? `Bio: ${gh.bio}` : null,
                            gh.company ? `Company: ${gh.company}` : null,
                            gh.location ? `Location: ${gh.location}` : null,
                            `Followers: ${gh.followers} | Following: ${gh.following}`,
                            `Public repos: ${gh.public_repos}`,
                            gh.created_at ? `Joined: ${new Date(gh.created_at).toDateString()}` : null,
                            gh.email ? `Email: ${gh.email}` : null,
                            gh.blog ? `Website: ${gh.blog}` : null,
                        ].filter(Boolean).join(' · '),
                        category: 'developer',
                        platform: 'GitHub',
                        metadata: {
                            avatarUrl: gh.avatar_url,
                            followers: gh.followers,
                            repos: gh.public_repos,
                            profileUrl: gh.html_url,
                        },
                        confidenceScore: 0.95,
                        confidenceLabel: 'HIGH'
                    });
                }
            } catch { /* skip */ }
        })(),

        // 2. Reddit Profile (real API — returns karma, account age, bio)
        (async () => {
            try {
                const rdRes = await quickFetch(`https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`, {
                    headers: { 'User-Agent': 'OpenVector-OSINT/1.0' },
                });
                if (rdRes.ok) {
                    const rd = await rdRes.json();
                    const d = rd?.data;
                    if (d && !d.is_suspended) {
                        results.push({
                            title: `Reddit — u/${d.name}`,
                            url: `https://reddit.com/user/${d.name}`,
                            description: [
                                `Link karma: ${d.link_karma?.toLocaleString()}`,
                                `Comment karma: ${d.comment_karma?.toLocaleString()}`,
                                d.created_utc ? `Account created: ${new Date(d.created_utc * 1000).toDateString()}` : null,
                                d.subreddit?.public_description ? `Bio: ${d.subreddit.public_description}` : null,
                                d.is_gold ? 'Reddit Gold member' : null,
                            ].filter(Boolean).join(' · '),
                            category: 'social',
                            platform: 'Reddit',
                            metadata: {
                                avatarUrl: d.icon_img || d.subreddit?.icon_img,
                                karma: (d.link_karma || 0) + (d.comment_karma || 0),
                                profileUrl: `https://reddit.com/user/${d.name}`,
                            },
                            confidenceScore: 0.90,
                            confidenceLabel: 'HIGH'
                        });
                    }
                }
            } catch { /* skip */ }
        })(),

        // 3. Medium (server-side rendered — direct scrape WORKS)
        (async () => {
            try {
                const res = await quickFetch(`https://medium.com/@${username}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                        'Accept': 'text/html',
                    },
                });
                if (res.ok) {
                    const html = await res.text();
                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                    const descMatch = html.match(/<meta[^>]+(?:name|property)="[^"]*description"[^>]+content="([^"]+)"/i) ||
                        html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:name|property)="[^"]*description"/i);
                    const title = titleMatch?.[1]?.trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"') || '';
                    const desc = descMatch?.[1]?.trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"') || '';

                    if (title && title.toLowerCase().includes(username.toLowerCase()) && !title.toLowerCase().includes('404')) {
                        results.push({
                            title: `Medium — @${username}`,
                            url: `https://medium.com/@${username}`,
                            description: `VERIFIED PROFILE SCRAPED:\nPage Title: ${title}\nProfile Bio: ${desc || 'No public bio available.'}`,
                            category: 'content',
                            platform: 'Medium',
                            confidenceScore: 0.85,
                            confidenceLabel: 'HIGH'
                        });
                    }
                }
            } catch { /* skip */ }
        })(),

        // 4. DuckDuckGo Social Profile Search — THE KEY to getting social data
        // Instead of trying to scrape JS-rendered social sites directly, we search DDG
        // for cached profile descriptions from Twitter, Instagram, LinkedIn, etc.
        (async () => {
            try {
                const platforms = [
                    { name: 'Twitter/X', query: `site:twitter.com OR site:x.com "${username}"` },
                    { name: 'Instagram', query: `site:instagram.com "${username}"` },
                    { name: 'LinkedIn', query: `site:linkedin.com/in "${username}"` },
                    { name: 'YouTube', query: `site:youtube.com "@${username}"` },
                    { name: 'TikTok', query: `site:tiktok.com "@${username}"` },
                ];

                for (const p of platforms) {
                    try {
                        const res = await quickFetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(p.query)}`, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Accept': 'text/html',
                            },
                        });
                        if (!res.ok) continue;

                        const html = await res.text();

                        // Extract the first result title and snippet
                        const titleMatches = html.match(/<a class="result__a"[^>]*>([\s\S]*?)<\/a>/g);
                        const snippetMatches = html.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);
                        const urlMatches = html.match(/<a class="result__url" href="([^"]+)"/g);

                        if (titleMatches && titleMatches.length > 0) {
                            const resultTitle = titleMatches[0].replace(/<[^>]+>/g, '').trim();
                            const resultSnippet = snippetMatches?.[0]?.replace(/<[^>]+>/g, '')
                                .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim() || '';
                            let resultUrl = urlMatches?.[0]?.match(/href="([^"]+)"/)?.[1] || '#';
                            if (resultUrl.startsWith('//')) resultUrl = `https:${resultUrl}`;

                            // Only include if the result looks like it's actually about the target
                            if (resultTitle.toLowerCase().includes(username.toLowerCase()) ||
                                resultSnippet.toLowerCase().includes(username.toLowerCase())) {
                                results.push({
                                    title: `${p.name} — @${username}`,
                                    url: resultUrl,
                                    description: `PROFILE DATA (via search index):\n${resultTitle}\n\n${resultSnippet}`,
                                    category: 'social',
                                    platform: p.name,
                                    confidenceScore: 0.60,
                                    confidenceLabel: 'MEDIUM'
                                });
                            }
                        }
                    } catch { /* skip this platform */ }
                }
            } catch { /* skip */ }
        })(),

        // 5. General web presence search — finds news, mentions, interviews
        (async () => {
            try {
                const res = await quickFetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${username}" profile OR bio OR about`)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html',
                    },
                });
                if (!res.ok) return;

                const html = await res.text();
                const snippetMatches = html.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);

                if (snippetMatches && snippetMatches.length > 0) {
                    const topSnippets = snippetMatches.slice(0, 3).map(s =>
                        s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim()
                    );

                    results.push({
                        title: `Web Mentions — ${username}`,
                        url: `https://duckduckgo.com/?q=${encodeURIComponent(`"${username}" profile`)}`,
                        description: `FOUND ${snippetMatches.length} web references:\n\n${topSnippets.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}`,
                        category: 'general',
                        platform: 'Web Search',
                        confidenceScore: 0.30,
                        confidenceLabel: 'LOW'
                    });
                }
            } catch { /* skip */ }
        })(),
    ];

    await Promise.allSettled(allChecks);

    return {
        connectorType: 'username_search',
        query: username,
        results,
        generatedAt: new Date().toISOString(),
    };
}
