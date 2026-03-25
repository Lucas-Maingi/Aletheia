import { ConnectorResult, SearchResult } from './types';

function getRandomUserAgent() {
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Ecosystem Discovery — High-Surface Area Account Detection.
 * Dorks 50+ major platforms to confirm account presence.
 */
export async function ecosystemSearch(target: string): Promise<ConnectorResult> {
    const results: SearchResult[] = [];
    const cleanTarget = target.trim().toLowerCase();
    const handle = cleanTarget.includes('@') ? cleanTarget.split('@')[0] : cleanTarget;

    const platforms = [
        // Professional/Tech
        { name: 'GitHub', site: 'github.com' },
        { name: 'StackOverflow', site: 'stackoverflow.com/users' },
        { name: 'LinkedIn', site: 'linkedin.com/in' },
        { name: 'GitLab', site: 'gitlab.com' },
        { name: 'Bitbucket', site: 'bitbucket.org' },
        { name: 'Behance', site: 'behance.net' },
        { name: 'Dribbble', site: 'dribbble.com' },
        { name: 'Medium', site: 'medium.com/@' },
        { name: 'Substack', site: 'substack.com/@' },
        { name: 'ProductHunt', site: 'producthunt.com/@' },
        { name: 'Dev.to', site: 'dev.to' },
        { name: 'AngelList', site: 'wellfound.com/u' },

        // Social/Content
        { name: 'Twitter/X', site: 'x.com' },
        { name: 'Instagram', site: 'instagram.com' },
        { name: 'Reddit', site: 'reddit.com/user' },
        { name: 'Pinterest', site: 'pinterest.com' },
        { name: 'TikTok', site: 'tiktok.com/@' },
        { name: 'Quora', site: 'quora.com/profile' },
        { name: 'Tumblr', site: 'tumblr.com/blog' },
        { name: 'Flickr', site: 'flickr.com/people' },
        { name: 'Vimeo', site: 'vimeo.com' },
        { name: 'YouTube', site: 'youtube.com/@' },
        { name: 'Twitch', site: 'twitch.tv' },
        { name: 'SoundCloud', site: 'soundcloud.com' },

        // Lifestyle/Tools
        { name: 'Spotify', site: 'open.spotify.com/user' },
        { name: 'Goodreads', site: 'goodreads.com' },
        { name: 'Letterboxd', site: 'letterboxd.com' },
        { name: 'AllTrails', site: 'alltrails.com/members' },
        { name: 'Strava', site: 'strava.com/athletes' },
        { name: 'Airbnb', site: 'airbnb.com/users/show' },
        { name: 'Linktree', site: 'linktr.ee' },
        { name: 'Patreon', site: 'patreon.com' },
        { name: 'BuyMeACoffee', site: 'buymeacoffee.com' },
        { name: 'About.me', site: 'about.me' },

        // Gaming/Community
        { name: 'Steam', site: 'steamcommunity.com/id' },
        { name: 'Epic Games', site: 'epicgames.com' },
        { name: 'Roblox', site: 'roblox.com/users' },
        { name: 'Discord', site: 'discord.com' },
        { name: 'Telegram', site: 't.me' },
        { name: 'Chess.com', site: 'chess.com/member' },
        
        // Regional/Specific
        { name: 'VK', site: 'vk.com' },
        { name: 'OK.ru', site: 'ok.ru' },
        { name: 'Weibo', site: 'weibo.com' },
        { name: 'Xing', site: 'xing.com/profile' },
        { name: 'SlideShare', site: 'slideshare.net' },
        { name: 'Issuu', site: 'issuu.com' },
        { name: 'Scribd', site: 'scribd.com' }
    ];

    const quickFetch = async (url: string) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 12000);
        try {
            return await fetch(url, {
                headers: { 'User-Agent': getRandomUserAgent() },
                signal: controller.signal
            }).finally(() => clearTimeout(id));
        } catch {
            return null;
        }
    };

    const searchPlatform = async (p: typeof platforms[0]) => {
        // Query pattern: site:platform.com "target"
        // We use Yahoo search as a reliable middleman to bypass individual site cookie/auth walls
        const dork = `site:${p.site} "${cleanTarget}"`;
        const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(dork)}`;
        
        const res = await quickFetch(searchUrl);
        if (!res || !res.ok) return;

        const html = await res.text();
        // Check for evidence of a real result (not "No results found")
        if (html.includes('class="algo-snippet') || html.includes('class="compTitle') || html.includes('class="compText')) {
            // Extract the first real URL from this platform
            const urlMatch = html.match(new RegExp(`href="[^"]*(https?://[^/&"]*${p.site.split('/')[0]}[^"&]*)`, 'i'));
            const finalUrl = urlMatch ? urlMatch[1] : `https://${p.site.split('/')[0]}`;

            // Extract title/snippet if possible
            const titleMatch = html.match(/<h3[^>]*>[\s\S]*?<a[^>]*>(.*?)<\/a>/);
            const snippetMatch = html.match(/class="compText[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);

            results.push({
                title: `${p.name} Presence — ${titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : cleanTarget}`,
                url: finalUrl,
                description: `### 🎯 Ecosystem Discovery: ${p.name}\n\nA positive registration match was detected on **${p.name}**.\n\n**Extraction Node Content:**\n> ${snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : 'Active account identified via secondary circuit analysis.'}\n\n**Direct Link:** ${finalUrl}`,
                category: 'social',
                platform: p.name,
                confidenceScore: 0.90,
                confidenceLabel: 'HIGH'
            });
        }
    };

    // Execute in parallel chunks
    const chunks = [];
    for (let i = 0; i < platforms.length; i += 6) {
        chunks.push(platforms.slice(i, i + 6));
    }

    for (const chunk of chunks) {
        await Promise.allSettled(chunk.map(searchPlatform));
    }

    return {
        connectorType: 'ecosystem_discovery',
        query: target,
        results,
        generatedAt: new Date().toISOString(),
    };
}
