import { ConnectorResult, SearchResult } from './types';

/**
 * Domain Search — fetches real data from free public APIs.
 * Sources: crt.sh (subdomains), RDAP/WHOIS (registration), Cloudflare DNS (records)
 * No API key required.
 */
export async function domainSearch(domain: string): Promise<ConnectorResult> {
    const results: SearchResult[] = [];
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase().trim();

    const quickFetch = (url: string, opts: RequestInit = {}) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);
        return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(id));
    };

    const checks = [
        // 1. Certificate Transparency — crt.sh (finds subdomains)
        async () => {
            try {
                const crtRes = await quickFetch(`https://crt.sh/?q=%.${cleanDomain}&output=json`);
                if (crtRes.ok) {
                    const certs: any[] = await crtRes.json();
                    const subdomains = [...new Set(
                        certs
                            .map(c => c.name_value as string)
                            .flatMap(n => n.split('\n'))
                            .filter(n => n && !n.includes('*') && n.endsWith(cleanDomain))
                            .slice(0, 20)
                    )];

                    if (subdomains.length > 0) {
                        const firstSeen = certs.reduce((min, c) => c.not_before < min ? c.not_before : min, certs[0]?.not_before || '');
                        results.push({
                            title: `SSL Certificates — ${cleanDomain}`,
                            url: `https://crt.sh/?q=%.${cleanDomain}`,
                            description: `Found ${certs.length} certificates. ${subdomains.length} unique subdomains detected. Oldest cert: ${firstSeen ? new Date(firstSeen).toDateString() : 'Unknown'}.`,
                            category: 'infrastructure',
                            platform: 'Certificate Transparency',
                            metadata: { subdomains },
                            confidenceScore: 0.95,
                            confidenceLabel: 'HIGH'
                        });
                    }
                }
            } catch { /* skip */ }
        },

        // 2. RDAP — WHOIS replacement (registration info)
        async () => {
            try {
                const rdapRes = await quickFetch(`https://rdap.org/domain/${cleanDomain}`);
                if (rdapRes.ok) {
                    const rdap = await rdapRes.json();
                    const registrar = rdap.entities?.find((e: any) => e.roles?.includes('registrar'));
                    const events: Record<string, string> = {};
                    (rdap.events || []).forEach((ev: any) => { events[ev.eventAction] = ev.eventDate; });
                    const nameservers = (rdap.nameservers || []).map((ns: any) => ns.ldhName).join(', ');

                    results.push({
                        title: `WHOIS / RDAP — ${cleanDomain}`,
                        url: `https://rdap.org/domain/${cleanDomain}`,
                        description: [
                            registrar?.vcardArray?.[1]?.find((a: any) => a[0] === 'fn')?.[3] ? `Registrar: ${registrar.vcardArray[1].find((a: any) => a[0] === 'fn')[3]}` : null,
                            events.registration ? `Registered: ${new Date(events.registration).toDateString()}` : null,
                            nameservers ? `Nameservers: ${nameservers}` : null,
                        ].filter(Boolean).join(' · '),
                        category: 'registry',
                        platform: 'RDAP',
                        confidenceScore: 0.95,
                        confidenceLabel: 'HIGH'
                    });
                }
            } catch { /* skip */ }
        },

        // 3. DNS Records via Cloudflare (parallelized types)
        ...['A', 'MX', 'TXT'].map(type => async () => {
            try {
                const dnsRes = await quickFetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=${type}`, {
                    headers: { Accept: 'application/dns-json' }
                });
                if (dnsRes.ok) {
                    const dns = await dnsRes.json();
                    const records: string[] = (dns.Answer || []).map((r: any) => r.data);
                    if (records.length > 0) {
                        results.push({
                            title: `DNS ${type} Record — ${cleanDomain}`,
                            url: `https://dnschecker.org/#${type}/${cleanDomain}`,
                            description: `${records.length} record(s): ${records.join(', ')}`,
                            category: 'dns',
                            platform: 'Cloudflare DNS',
                            confidenceScore: 0.90,
                            confidenceLabel: 'HIGH'
                        });
                    }
                }
            } catch { /* skip */ }
        }),

        // 4. Website Scraper
        async () => {
            try {
                const res = await quickFetch(`http://${cleanDomain}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                });
                if (res.ok) {
                    const html = await res.text();
                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                    const title = titleMatch ? titleMatch[1].trim().replace(/&quot;/g, '"') : '';
                    if (title) {
                        results.push({
                            title: `Website Title — ${cleanDomain}`,
                            url: `http://${cleanDomain}`,
                            description: `Live homepage found. Site Title: "${title}"`,
                            category: 'content',
                            platform: 'Web Scraper'
                        });
                    }
                }
            } catch { /* skip */ }
        }
    ];

    await Promise.allSettled(checks.map(fn => fn()));

    return {
        connectorType: 'domain_search',
        query: cleanDomain,
        results,
        generatedAt: new Date().toISOString(),
    };
}
