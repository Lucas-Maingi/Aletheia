/**
 * Aletheia Demo Data
 * Pre-built synthetic investigation data for the interactive demo.
 * Zero API dependencies — this data is static and always works.
 */

// ─── PERSON INVESTIGATION DEMO ───────────────────────────────

export const DEMO_PERSON = {
  investigation: {
    id: 'demo-person-001',
    title: 'Operation Echo — john.doe@example.com',
    status: 'completed',
    subjectName: 'John Michael Doe',
    subjectEmail: 'john.doe@example.com',
    subjectUsername: 'johndoe_dev',
    createdAt: '2026-06-18T09:30:00Z',
    updatedAt: '2026-06-18T09:31:42Z',
    scanDuration: '42 seconds',
  },

  entities: [
    { type: 'email', value: 'john.doe@example.com', confidence: 100, source: 'Input' },
    { type: 'email', value: 'jdoe.work@protonmail.com', confidence: 78, source: 'Breach Correlation' },
    { type: 'username', value: 'johndoe_dev', confidence: 95, source: 'GitHub' },
    { type: 'username', value: 'johndoe_dev', confidence: 88, source: 'Reddit' },
    { type: 'username', value: 'jdoe2024', confidence: 72, source: 'Twitter/X' },
    { type: 'domain', value: 'johndoe.dev', confidence: 91, source: 'WHOIS Correlation' },
    { type: 'ip', value: '203.0.113.42', confidence: 65, source: 'DNS History' },
    { type: 'phone', value: '+1-555-0142', confidence: 45, source: 'People Search' },
    { type: 'name', value: 'John Michael Doe', confidence: 96, source: 'LinkedIn' },
    { type: 'location', value: 'San Francisco, CA', confidence: 82, source: 'IP Geolocation + Social' },
  ],

  evidence: [
    {
      id: 'ev-001',
      title: 'GitHub Profile — johndoe_dev',
      content: 'Active developer account. 142 repositories, 1.2K followers. Primary languages: TypeScript, Python, Rust. Bio: "Security researcher | Building tools for the open web." Joined: 2019. Last active: 2 days ago.',
      connector: 'usernameSearch',
      platform: 'GitHub',
      category: 'social',
      confidenceScore: 0.95,
      confidenceLabel: 'VERIFIED' as const,
      sourceUrl: 'https://github.com/johndoe_dev',
      timestamp: '2026-06-18T09:30:12Z',
    },
    {
      id: 'ev-002',
      title: 'Reddit Account — johndoe_dev',
      content: 'Active in r/netsec, r/cybersecurity, r/osint. Karma: 24,500. Recent posts discuss vulnerability disclosure and OSINT tooling. Account age: 5 years.',
      connector: 'usernameSearch',
      platform: 'Reddit',
      category: 'social',
      confidenceScore: 0.88,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://reddit.com/user/johndoe_dev',
      timestamp: '2026-06-18T09:30:14Z',
    },
    {
      id: 'ev-003',
      title: 'Twitter/X Account — @jdoe2024',
      content: 'Bio: "InfoSec | CTF Player | 🔐". 3,200 followers. Tweets about security conferences (DEF CON, Black Hat). Location listed as "Bay Area". Linked to personal blog at johndoe.dev.',
      connector: 'usernameSearch',
      platform: 'Twitter/X',
      category: 'social',
      confidenceScore: 0.72,
      confidenceLabel: 'MEDIUM' as const,
      sourceUrl: 'https://x.com/jdoe2024',
      timestamp: '2026-06-18T09:30:16Z',
    },
    {
      id: 'ev-004',
      title: 'LinkedIn Profile — John Michael Doe',
      content: 'Senior Security Engineer at TechCorp Inc. (2022-Present). Previous: Security Analyst at CyberGuard (2019-2022). Education: MS Computer Science, Stanford. Skills: Penetration Testing, OSINT, Threat Intelligence, Python, Go.',
      connector: 'usernameSearch',
      platform: 'LinkedIn',
      category: 'professional',
      confidenceScore: 0.96,
      confidenceLabel: 'VERIFIED' as const,
      sourceUrl: 'https://linkedin.com/in/johnmdoe',
      timestamp: '2026-06-18T09:30:18Z',
    },
    {
      id: 'ev-005',
      title: 'Breach Detection — Adobe (2013)',
      content: 'Email john.doe@example.com found in Adobe breach (Oct 2013). 153 million records compromised. Data exposed: Email, encrypted password, password hint. Password hint: "fav pet + year".',
      connector: 'breachSearch',
      platform: 'HIBP',
      category: 'breach',
      confidenceScore: 0.98,
      confidenceLabel: 'VERIFIED' as const,
      sourceUrl: 'https://haveibeenpwned.com',
      timestamp: '2026-06-18T09:30:22Z',
    },
    {
      id: 'ev-006',
      title: 'Breach Detection — LinkedIn (2021)',
      content: 'Email john.doe@example.com found in LinkedIn data scrape (Jun 2021). 700 million records. Data exposed: Email, name, phone, job title, employer, geolocation.',
      connector: 'breachSearch',
      platform: 'HIBP',
      category: 'breach',
      confidenceScore: 0.95,
      confidenceLabel: 'VERIFIED' as const,
      sourceUrl: 'https://haveibeenpwned.com',
      timestamp: '2026-06-18T09:30:24Z',
    },
    {
      id: 'ev-007',
      title: 'Breach Detection — Dropbox (2016)',
      content: 'Email john.doe@example.com found in Dropbox breach (Aug 2016). 68 million records. Data exposed: Email, bcrypt-hashed password.',
      connector: 'breachSearch',
      platform: 'HIBP',
      category: 'breach',
      confidenceScore: 0.92,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://haveibeenpwned.com',
      timestamp: '2026-06-18T09:30:26Z',
    },
    {
      id: 'ev-008',
      title: 'Domain Intelligence — johndoe.dev',
      content: 'Registered via Namecheap (2020-01-15). Expires: 2027-01-15. DNS: A record → 76.76.21.21 (Vercel). MX: ProtonMail. TXT: Google site verification active. SSL: Let\'s Encrypt, valid.',
      connector: 'domainSearch',
      platform: 'WHOIS/DNS',
      category: 'infrastructure',
      confidenceScore: 0.91,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://who.is/whois/johndoe.dev',
      timestamp: '2026-06-18T09:30:30Z',
    },
    {
      id: 'ev-009',
      title: 'IP Geolocation — 203.0.113.42',
      content: 'Location: San Francisco, CA, United States. ISP: Comcast Cable Communications. Timezone: America/Los_Angeles. Coordinates: 37.7749° N, 122.4194° W.',
      connector: 'ipinfo',
      platform: 'IPinfo',
      category: 'geolocation',
      confidenceScore: 0.90,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://ipinfo.io/203.0.113.42',
      timestamp: '2026-06-18T09:30:32Z',
    },
    {
      id: 'ev-010',
      title: 'Google Dork — Pastebin Exposure',
      content: 'Found on Pastebin (paste ID: abc123): SSH public key associated with john.doe@example.com. Posted 2023-08-14. Key fingerprint matches GitHub account.',
      connector: 'googleDorks',
      platform: 'Google/Pastebin',
      category: 'exposure',
      confidenceScore: 0.68,
      confidenceLabel: 'MEDIUM' as const,
      sourceUrl: 'https://pastebin.com/abc123',
      timestamp: '2026-06-18T09:30:36Z',
    },
    {
      id: 'ev-011',
      title: 'Registration Scout — Service Detection',
      content: 'Email registered on: Slack (workspace: techcorp), Notion, Figma, AWS Console, DigitalOcean. Professional SaaS footprint consistent with security engineering role.',
      connector: 'registrationScout',
      platform: 'Multi-Platform',
      category: 'registration',
      confidenceScore: 0.75,
      confidenceLabel: 'MEDIUM' as const,
      sourceUrl: '#',
      timestamp: '2026-06-18T09:30:40Z',
    },
  ],

  dossier: `### Executive Dossier — Operation Echo

**Target:** John Michael Doe (john.doe@example.com)
**Threat Level:** LOW — Professional security researcher, no malicious indicators
**Exposure Score:** 7.2 / 10 — Significant digital footprint with breach exposure

---

#### 1. Identity & Bio Profile

**Full Name:** John Michael Doe
**Location:** San Francisco, Bay Area, California
**Occupation:** Senior Security Engineer at TechCorp Inc. (2022–Present)
**Education:** MS Computer Science, Stanford University
**Previous Role:** Security Analyst at CyberGuard (2019–2022)

**Primary Pivot Points:**
- 📧 Email: john.doe@example.com (Primary), jdoe.work@protonmail.com (Work)
- 🌐 Domain: johndoe.dev (Hosted on Vercel, MX: ProtonMail)
- 📍 Coordinates: 37.7749° N, 122.4194° W (San Francisco)

---

#### 2. Connectivity Grid

| Platform | Handle | Confidence | Activity |
|----------|--------|------------|----------|
| GitHub | johndoe_dev | 95% ✅ | 142 repos, TypeScript/Python/Rust |
| Reddit | johndoe_dev | 88% ✅ | r/netsec, r/cybersecurity active |
| Twitter/X | @jdoe2024 | 72% ⚠️ | 3.2K followers, InfoSec content |
| LinkedIn | johnmdoe | 96% ✅ | Senior Security Engineer |
| Slack | techcorp workspace | 75% ⚠️ | Detected via registration scout |

---

#### 3. Digital Footprint — Infrastructure

| Asset | Details | Confidence |
|-------|---------|------------|
| johndoe.dev | Registered 2020, Namecheap, Vercel hosting | 91% |
| ProtonMail | MX records confirm encrypted email use | 85% |
| SSH Key | Public key found on Pastebin, matches GitHub | 68% |
| IP: 203.0.113.42 | Comcast, San Francisco, CA | 90% |

---

#### 4. Exposure Map — Breach Intelligence

| Breach | Date | Records | Data Exposed |
|--------|------|---------|-------------|
| Adobe | Oct 2013 | 153M | Email, encrypted password, hint |
| Dropbox | Aug 2016 | 68M | Email, bcrypt password |
| LinkedIn | Jun 2021 | 700M | Email, name, phone, job, geo |

**⚠️ Critical Finding:** Password hint in Adobe breach reads "fav pet + year" — potential social engineering vector if pet name is discoverable from social media.

---

#### 5. Next-Phase Pivots

1. **Cross-reference** jdoe.work@protonmail.com across breach databases for additional exposure
2. **EXIF analysis** on images from johndoe.dev blog posts for embedded geolocation
3. **GitHub commit history** analysis for email addresses, API keys, or infrastructure details in commit messages

---

*Intelligence Dossier generated by Aletheia Intelligence Engine*
*Evidence SHA-256 hashed at ingestion for provenance verification*`,

  stats: {
    connectorsRun: 12,
    connectorsSucceeded: 11,
    connectorsFailed: 1,
    evidenceCount: 11,
    entitiesFound: 10,
    breachesFound: 3,
    platformsMatched: 7,
    scanDurationMs: 42000,
    confidenceAvg: 0.84,
  },

  timeline: [
    { time: '09:30:00', event: 'Investigation created', type: 'system' },
    { time: '09:30:02', event: '12 connectors dispatched in parallel', type: 'system' },
    { time: '09:30:12', event: 'GitHub profile confirmed — johndoe_dev (VERIFIED)', type: 'social' },
    { time: '09:30:14', event: 'Reddit account matched — johndoe_dev (HIGH)', type: 'social' },
    { time: '09:30:16', event: 'Twitter/X account found — @jdoe2024 (MEDIUM)', type: 'social' },
    { time: '09:30:18', event: 'LinkedIn profile resolved — John Michael Doe (VERIFIED)', type: 'professional' },
    { time: '09:30:22', event: '3 breach records found in HIBP (VERIFIED)', type: 'breach' },
    { time: '09:30:30', event: 'Domain johndoe.dev — WHOIS + DNS resolved (HIGH)', type: 'infrastructure' },
    { time: '09:30:32', event: 'IP 203.0.113.42 geolocated — San Francisco (HIGH)', type: 'geolocation' },
    { time: '09:30:36', event: 'Pastebin exposure detected — SSH key (MEDIUM)', type: 'exposure' },
    { time: '09:30:40', event: 'Registration scout — 5 services detected (MEDIUM)', type: 'registration' },
    { time: '09:31:00', event: 'AI synthesis initiated — Gemini 1.5 Flash', type: 'ai' },
    { time: '09:31:42', event: 'Intelligence dossier generated — 7.2/10 exposure', type: 'complete' },
  ],

  geoLocations: [
    { city: 'San Francisco', country: 'US', lat: 37.7749, lng: -122.4194, source: 'IP Geolocation + Social' },
  ],
};


// ─── DOMAIN INVESTIGATION DEMO ───────────────────────────────

export const DEMO_DOMAIN = {
  investigation: {
    id: 'demo-domain-001',
    title: 'Infrastructure Recon — shadowcorp.io',
    status: 'completed',
    subjectDomain: 'shadowcorp.io',
    createdAt: '2026-06-18T10:15:00Z',
    updatedAt: '2026-06-18T10:16:18Z',
    scanDuration: '38 seconds',
  },

  entities: [
    { type: 'domain', value: 'shadowcorp.io', confidence: 100, source: 'Input' },
    { type: 'domain', value: 'shadowcorp.com', confidence: 85, source: 'DNS Correlation' },
    { type: 'email', value: 'admin@shadowcorp.io', confidence: 78, source: 'WHOIS' },
    { type: 'ip', value: '198.51.100.23', confidence: 92, source: 'DNS A Record' },
    { type: 'ip', value: '198.51.100.24', confidence: 88, source: 'DNS History' },
    { type: 'name', value: 'Shadow Corp LLC', confidence: 90, source: 'WHOIS Registrant' },
    { type: 'location', value: 'Wilmington, DE', confidence: 75, source: 'WHOIS + Corp Records' },
  ],

  evidence: [
    {
      id: 'dv-001',
      title: 'WHOIS Intelligence — shadowcorp.io',
      content: 'Registrar: Namecheap. Created: 2023-03-10. Expires: 2026-03-10. Registrant: Shadow Corp LLC, Wilmington, DE. Admin email: admin@shadowcorp.io. Privacy protection: DISABLED (unusual for legitimate businesses).',
      connector: 'domainSearch',
      platform: 'WHOIS',
      category: 'infrastructure',
      confidenceScore: 0.92,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://who.is/whois/shadowcorp.io',
      timestamp: '2026-06-18T10:15:08Z',
    },
    {
      id: 'dv-002',
      title: 'DNS Records — shadowcorp.io',
      content: 'A: 198.51.100.23 (Hetzner Cloud). MX: mail.shadowcorp.io (self-hosted). TXT: "v=spf1 ip4:198.51.100.23 -all". No DMARC record found (⚠️ email spoofing risk). 3 subdomains detected: mail, api, staging.',
      connector: 'domainSearch',
      platform: 'DNS',
      category: 'infrastructure',
      confidenceScore: 0.95,
      confidenceLabel: 'VERIFIED' as const,
      sourceUrl: '#',
      timestamp: '2026-06-18T10:15:12Z',
    },
    {
      id: 'dv-003',
      title: 'SSL Certificate Intelligence',
      content: 'Issuer: Let\'s Encrypt. Valid: 2026-05-01 to 2026-07-30. Subject Alternative Names: shadowcorp.io, *.shadowcorp.io, api.shadowcorp.io. Certificate transparency logs show 12 issuances in last 6 months (frequent rotation).',
      connector: 'domainSearch',
      platform: 'Certificate Transparency',
      category: 'infrastructure',
      confidenceScore: 0.88,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://crt.sh/?q=shadowcorp.io',
      timestamp: '2026-06-18T10:15:16Z',
    },
    {
      id: 'dv-004',
      title: 'IP Intelligence — 198.51.100.23',
      content: 'Location: Falkenstein, Germany. Provider: Hetzner Online GmbH. ASN: AS24940. Hosting provider frequently used for privacy-conscious operations. 3 other domains also resolve to this IP (shared hosting).',
      connector: 'ipinfo',
      platform: 'IPinfo',
      category: 'geolocation',
      confidenceScore: 0.90,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://ipinfo.io/198.51.100.23',
      timestamp: '2026-06-18T10:15:20Z',
    },
    {
      id: 'dv-005',
      title: 'SecurityTrails — DNS History',
      content: 'Historical A records show migration from AWS (2023) → DigitalOcean (2024) → Hetzner (2025). Previous IP 203.0.113.100 also hosted domain suspicious-deals.net (flagged by Spamhaus). MX history shows transition from Google Workspace to self-hosted mail.',
      connector: 'securityTrails',
      platform: 'SecurityTrails',
      category: 'infrastructure',
      confidenceScore: 0.82,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: 'https://securitytrails.com/domain/shadowcorp.io',
      timestamp: '2026-06-18T10:15:24Z',
    },
    {
      id: 'dv-006',
      title: 'Google Dork — Indexed Documents',
      content: 'site:shadowcorp.io filetype:pdf returned 3 results: "partnership-agreement-v2.pdf", "investor-deck-2024.pdf", "team-directory-internal.pdf". The team directory PDF was accessible without authentication (⚠️ data exposure).',
      connector: 'googleDorks',
      platform: 'Google',
      category: 'exposure',
      confidenceScore: 0.75,
      confidenceLabel: 'MEDIUM' as const,
      sourceUrl: 'https://google.com',
      timestamp: '2026-06-18T10:15:28Z',
    },
    {
      id: 'dv-007',
      title: 'Breach Detection — admin@shadowcorp.io',
      content: 'Email admin@shadowcorp.io found in Collection #1 mega-breach (Jan 2019). 773 million records. Data exposed: Email, plaintext password.',
      connector: 'breachSearch',
      platform: 'HIBP',
      category: 'breach',
      confidenceScore: 0.94,
      confidenceLabel: 'VERIFIED' as const,
      sourceUrl: 'https://haveibeenpwned.com',
      timestamp: '2026-06-18T10:15:32Z',
    },
    {
      id: 'dv-008',
      title: 'Subdomain Enumeration',
      content: 'Discovered subdomains: mail.shadowcorp.io (SMTP), api.shadowcorp.io (REST API, returns 403), staging.shadowcorp.io (⚠️ returns 200 with staging application — exposed). dev.shadowcorp.io (DNS exists but no HTTP response).',
      connector: 'ecosystemSearch',
      platform: 'Multi-Source',
      category: 'infrastructure',
      confidenceScore: 0.85,
      confidenceLabel: 'HIGH' as const,
      sourceUrl: '#',
      timestamp: '2026-06-18T10:15:36Z',
    },
  ],

  dossier: `### Infrastructure Recon Dossier — shadowcorp.io

**Target:** shadowcorp.io (Shadow Corp LLC)
**Threat Level:** ELEVATED — Multiple security misconfigurations detected
**Exposure Score:** 8.1 / 10 — Critical infrastructure weaknesses

---

#### 1. Organization Profile

**Entity:** Shadow Corp LLC
**Jurisdiction:** Wilmington, Delaware, USA
**Registration:** 2023 (domain registered March 2023)
**Admin Contact:** admin@shadowcorp.io (exposed in WHOIS — no privacy protection)

---

#### 2. Infrastructure Map

| Asset | Location | Provider | Risk |
|-------|----------|----------|------|
| shadowcorp.io | Falkenstein, DE | Hetzner | Shared hosting |
| mail.shadowcorp.io | Same IP | Self-hosted | No DMARC → spoofing risk |
| api.shadowcorp.io | Same IP | Hetzner | 403 Forbidden |
| staging.shadowcorp.io | Same IP | Hetzner | ⚠️ EXPOSED — 200 OK |

---

#### 3. Critical Findings

1. **🔴 Staging Environment Exposed** — staging.shadowcorp.io returns 200 with live application. Potential data leak or attack vector.
2. **🔴 Admin Email Breached** — admin@shadowcorp.io found in Collection #1 with plaintext password.
3. **🟡 No DMARC Record** — Domain is vulnerable to email spoofing attacks.
4. **🟡 Internal PDFs Indexed** — Google has indexed a "team-directory-internal.pdf" that is publicly accessible.
5. **🟡 Previous IP Linked to Spam** — Historical IP 203.0.113.100 was also used by suspicious-deals.net (Spamhaus flagged).

---

#### 4. DNS Migration Timeline

| Period | Provider | IP | Notable |
|--------|----------|----|---------|
| 2023 | AWS | 54.x.x.x | Initial setup |
| 2024 | DigitalOcean | 167.x.x.x | Migration |
| 2025–Now | Hetzner | 198.51.100.23 | Current, shared hosting |

---

#### 5. Next-Phase Pivots

1. **Access** staging.shadowcorp.io and document exposed functionality
2. **Download** the indexed team-directory-internal.pdf for personnel mapping
3. **Test** admin@shadowcorp.io credentials against common services

---

*Intelligence Dossier generated by Aletheia Intelligence Engine*
*Evidence SHA-256 hashed at ingestion for provenance verification*`,

  stats: {
    connectorsRun: 10,
    connectorsSucceeded: 10,
    connectorsFailed: 0,
    evidenceCount: 8,
    entitiesFound: 7,
    breachesFound: 1,
    subdomainsFound: 4,
    scanDurationMs: 38000,
    confidenceAvg: 0.88,
  },

  timeline: [
    { time: '10:15:00', event: 'Investigation created', type: 'system' },
    { time: '10:15:02', event: '10 connectors dispatched in parallel', type: 'system' },
    { time: '10:15:08', event: 'WHOIS resolved — Shadow Corp LLC, Wilmington DE', type: 'infrastructure' },
    { time: '10:15:12', event: 'DNS records enumerated — 3 subdomains found', type: 'infrastructure' },
    { time: '10:15:16', event: 'SSL certificate analyzed — 12 issuances detected', type: 'infrastructure' },
    { time: '10:15:20', event: 'IP geolocated — Falkenstein, Germany (Hetzner)', type: 'geolocation' },
    { time: '10:15:24', event: '⚠️ Previous IP linked to flagged domain', type: 'alert' },
    { time: '10:15:28', event: '⚠️ Internal PDF indexed by Google — data exposure', type: 'alert' },
    { time: '10:15:32', event: 'Admin email found in Collection #1 breach', type: 'breach' },
    { time: '10:15:36', event: '⚠️ Staging environment exposed — 200 OK', type: 'alert' },
    { time: '10:15:50', event: 'AI synthesis initiated — Gemini 1.5 Flash', type: 'ai' },
    { time: '10:16:18', event: 'Intelligence dossier generated — 8.1/10 exposure', type: 'complete' },
  ],

  geoLocations: [
    { city: 'Falkenstein', country: 'DE', lat: 50.4756, lng: 12.3632, source: 'IP Geolocation' },
    { city: 'Wilmington', country: 'US', lat: 39.7391, lng: -75.5398, source: 'WHOIS Registrant' },
  ],
};


// ─── CONNECTOR NAMES (for display) ───────────────────────────

export const CONNECTOR_DISPLAY_NAMES: Record<string, { name: string; icon: string; color: string }> = {
  usernameSearch: { name: 'Username Search', icon: '👤', color: 'text-purple-400' },
  breachSearch: { name: 'Breach Database', icon: '🔓', color: 'text-red-400' },
  domainSearch: { name: 'Domain Intelligence', icon: '🌐', color: 'text-blue-400' },
  ipinfo: { name: 'IP Geolocation', icon: '📍', color: 'text-emerald-400' },
  googleDorks: { name: 'Google Dorking', icon: '🔍', color: 'text-amber-400' },
  registrationScout: { name: 'Registration Scout', icon: '📋', color: 'text-cyan-400' },
  securityTrails: { name: 'SecurityTrails', icon: '🛤️', color: 'text-indigo-400' },
  ecosystemSearch: { name: 'Ecosystem Search', icon: '🔗', color: 'text-pink-400' },
  reverseImage: { name: 'Reverse Image', icon: '🖼️', color: 'text-violet-400' },
  darkWebSearch: { name: 'Dark Web Intel', icon: '🕸️', color: 'text-rose-400' },
  cryptoSearch: { name: 'Crypto Trace', icon: '₿', color: 'text-orange-400' },
  whatsMyName: { name: 'WhatsMyName', icon: '🏷️', color: 'text-teal-400' },
};
