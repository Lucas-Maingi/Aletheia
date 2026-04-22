# Aletheia OSINT Engine — Developer Guide

> **Version**: 2.5 | **Last Updated**: April 2026  
> **Live URL**: https://aletheia-live.vercel.app  
> **Repo**: https://github.com/Lucas-Maingi/OpenVector

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [How a Scan Works (End-to-End Pipeline)](#5-how-a-scan-works-end-to-end-pipeline)
6. [Connector Architecture](#6-connector-architecture)
7. [Current Connectors & Their Status](#7-current-connectors--their-status)
8. [Environment Variables](#8-environment-variables)
9. [Known Issues & What Needs Fixing](#9-known-issues--what-needs-fixing)
10. [OSINT APIs & Data Sources — Comprehensive List](#10-osint-apis--data-sources--comprehensive-list)
11. [Local Development Setup](#11-local-development-setup)
12. [Deployment](#12-deployment)

---

## 1. What Is This Project?

Aletheia is an **OSINT (Open Source Intelligence) SaaS platform**. Users provide a target identifier (name, email, username, domain, phone number, or a photo), and the engine runs automated intelligence gathering across multiple public data sources, then synthesizes everything into a threat intelligence dossier using AI.

**Core user flow:**
1. User creates an "Investigation" with one or more identifiers
2. Engine runs 10+ connectors in parallel (username search, breach check, reverse image, etc.)
3. Results are saved as "Evidence" in the database
4. Google Gemini AI synthesizes all evidence into a readable intelligence report
5. User reviews findings in a premium dashboard with tabs for Dossier, Findings, Visual Analysis, and Provenance

**Monetization**: Free tier (limited scans) → Pro tier (unlimited, via Lemon Squeezy payments)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion (animations) |
| **UI Components** | Radix UI primitives, custom glassmorphism design system |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma 5 |
| **Auth** | Supabase Auth (email + guest sessions) |
| **AI** | Google Gemini API (gemini-1.5-flash / gemini-1.5-pro) |
| **Payments** | Lemon Squeezy (webhooks for plan upgrades) |
| **Hosting** | Vercel (Hobby plan — 60s function timeout) |
| **Package Manager** | npm |

---

## 3. Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # All backend API routes
│   │   ├── investigations/       # CRUD + scan endpoints
│   │   │   └── [id]/
│   │   │       └── scan/
│   │   │           ├── core/     # Phase 1: Text-based OSINT connectors
│   │   │           ├── visual/   # Phase 2: Image/biometric connectors
│   │   │           └── synthesis/# Phase 3: AI report generation
│   │   ├── auth/                 # Supabase auth sync
│   │   ├── billing/              # Lemon Squeezy subscription check
│   │   ├── checkout/             # Payment flow
│   │   ├── webhooks/             # Lemon Squeezy webhook handler
│   │   ├── watchlists/           # Watchlist CRUD + alerts
│   │   ├── feedback/             # In-app feedback system
│   │   ├── notifications/        # User notification system
│   │   ├── chat/                 # AI chat assistant
│   │   ├── diagnostic/           # Health check endpoints
│   │   └── admin/                # Admin panel routes
│   ├── dashboard/                # Main authenticated UI
│   │   ├── page.tsx              # Dashboard home (metrics + search bar)
│   │   ├── layout.tsx            # Sidebar + header layout
│   │   ├── investigations/       # Investigation list + detail pages
│   │   ├── settings/             # User settings
│   │   └── watchlists/           # Watchlist management
│   ├── pricing/                  # Pricing page
│   ├── auth/                     # Login/signup pages
│   └── page.tsx                  # Public landing page
│
├── components/
│   ├── dashboard/                # 34 dashboard-specific components
│   │   ├── dashboard-client.tsx  # Main dashboard with search bar
│   │   ├── investigation-detail-client.tsx  # Investigation detail view
│   │   ├── facial-analysis.tsx   # Sherlock-style biometric hub UI
│   │   ├── evidence-tab.tsx      # Evidence cards display
│   │   ├── identity-graph.tsx    # D3-style identity network graph
│   │   ├── live-terminal.tsx     # Real-time scan log terminal
│   │   └── ...                   # See full list in components/dashboard/
│   └── ui/                       # Reusable Radix-based UI primitives
│
├── connectors/                   # ⭐ ALL OSINT DATA CONNECTORS
│   ├── types.ts                  # ConnectorResult + SearchResult interfaces
│   ├── index.ts                  # Barrel export
│   ├── usernameSearch.ts         # Username enumeration across platforms
│   ├── whatsMyName.ts            # WhatsMyName.com integration
│   ├── ecosystemSearch.ts        # Cross-platform ecosystem discovery
│   ├── googleDorks.ts            # Google dork queries via SerpAPI
│   ├── domainSearch.ts           # WHOIS + DNS reconnaissance
│   ├── breachSearch.ts           # Data breach checking
│   ├── reverseImage.ts           # FaceCheck.id facial recognition
│   ├── siphonHub.ts              # Multi-engine visual search (Vision + SerpAPI + Bing)
│   ├── visualIntel.ts            # FacialMatch type mapping
│   ├── exifMetadata.ts           # EXIF data extraction from images
│   ├── interpolSearch.ts         # Interpol Red Notice search
│   ├── peopleSearch.ts           # People search engines
│   ├── darkWebSearch.ts          # Dark web intelligence
│   ├── cryptoSearch.ts           # Blockchain address lookup
│   ├── registrationScout.ts      # Email registration discovery
│   ├── securityTrails.ts         # DNS history via SecurityTrails API
│   └── ipinfo.ts                 # IP geolocation via ipinfo.io
│
├── context/
│   └── InvestigationContext.tsx   # Global React context for scan state
│
└── lib/
    ├── ai.ts                     # Gemini AI report synthesis
    ├── prisma.ts                 # Prisma client singleton
    ├── auth-utils.ts             # User auth helpers (guest + real)
    ├── rate-limit.ts             # In-memory rate limiter
    ├── security.ts               # Input sanitization + UUID validation
    ├── investigation-polling.ts  # Client-side polling for live scan updates
    ├── screenshot.ts             # URL screenshot capture
    └── osint/
        └── registry.ts           # Confidence scoring + capability layers
```

---

## 4. Database Schema

The database is PostgreSQL hosted on **Supabase**. ORM is **Prisma**.

### Core Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **User** | User accounts | `email`, `role` (admin/analyst), `plan` (free/pro/lifetime), `facialAiCredits` |
| **Investigation** | A single OSINT case | `title`, `subjectName/Email/Username/Phone/Domain/ImageUrl`, `status` (pending/active/closed/error) |
| **Evidence** | Individual findings | `title`, `content`, `sourceUrl`, `confidenceScore` (0-1), `confidenceLabel`, `provenanceHash` (SHA-256), `metadata` (JSON) |
| **Entity** | Extracted identifiers | `type` (email/username/domain/etc), `value`, `confidence` (0-100) |
| **Report** | AI-generated dossiers | `content` (markdown), `format` |
| **SearchLog** | Real-time scan telemetry | `connectorType`, `query` (log message), `resultCount` |
| **Watchlist** | Monitoring targets | `targetType`, `targetValue`, `status` |
| **WatchlistAlert** | Alert notifications | `title`, `severity` (info/warning/critical) |
| **Notification** | User notifications | `title`, `message`, `type`, `isRead` |
| **Feedback** | In-app feedback | `content`, `type` (bug/feature/general) |

### Schema file: `prisma/schema.prisma`

To apply schema changes:
```bash
npx prisma db push        # Push schema changes to Supabase
npx prisma generate        # Regenerate the Prisma client
```

---

## 5. How a Scan Works (End-to-End Pipeline)

This is the most critical section. Understanding this pipeline is essential.

### Step 1: User Creates Investigation
- **Frontend**: `src/app/dashboard/investigations/new/page.tsx`
- User fills in identifiers (name, email, username, etc.) and optionally uploads an image
- Image is converted to base64 Data URL client-side
- POST to `/api/investigations` → creates a DB record with `status: 'pending'`
- Redirects to `/dashboard/investigations/[id]?scanning=1`

### Step 2: Client Triggers 3-Phase Scan
- **Frontend**: `src/context/InvestigationContext.tsx` → `startScan()` function
- The scan runs in **3 sequential phases**, each hitting a different API route:

```
Phase 1: POST /api/investigations/[id]/scan/core     → Text-based OSINT
Phase 2: POST /api/investigations/[id]/scan/visual   → Image/biometric search  
Phase 3: POST /api/investigations/[id]/scan/synthesis → AI report generation
```

### Phase 1: Core Sweep (`src/app/api/investigations/[id]/scan/core/route.ts`)
- Determines which connectors to run based on available identifiers
- If only an image (no text identifiers) → **skip** Phase 1 entirely
- Runs connectors in chunks of 3 concurrently (to stay within Vercel's 60s timeout)
- Each connector's results are **immediately persisted** to the Evidence table
- All scan activity is logged to SearchLog (powers the live terminal UI)

### Phase 2: Visual Sweep (`src/app/api/investigations/[id]/scan/visual/route.ts`)
- Runs **only if** `investigation.subjectImageUrl` exists
- Calls two connectors concurrently:
  - `reverseImageSearch()` — FaceCheck.id facial recognition (requires `FACECHECK_API_TOKEN`)
  - `siphonHub()` — Multi-engine visual search (Google Vision, SerpAPI, Bing)
- Results saved to Evidence table AND returned as `facialMatches` in the JSON response
- The `facialMatches` array is stored in React context → displayed in the FacialAnalysis component

### Phase 3: AI Synthesis (`src/app/api/investigations/[id]/scan/synthesis/route.ts`)
- Reads all Evidence from DB for this investigation
- Sends to `summarizeFindings()` in `src/lib/ai.ts`
- Uses Google Gemini API (gemini-1.5-flash → fallback to gemini-1.5-pro → gemini-pro)
- AI generates structured markdown report with geo-extraction, vitality audit, associate analysis
- Report saved to the Reports table
- Investigation status set to `closed`

### Step 3: Client Polls for Updates
- **Frontend**: `InvestigationContext.tsx` polls `/api/investigations/[id]/sync` every 4 seconds
- Fetches latest evidence, entities, reports, and logs
- Updates React state → UI updates live

### Key Constraint: Vercel Hobby Plan = 60 Second Timeout
- Each API route has `export const maxDuration = 60;`
- The engine has a `HOBBY_LIMIT = 57000` (57 seconds) safety cutoff
- If time runs out, it saves whatever it has and marks status as `closed`

---

## 6. Connector Architecture

Every connector follows the same interface:

```typescript
// src/connectors/types.ts
interface ConnectorResult {
    connectorType: string;
    query: string;
    results: SearchResult[];
    generatedAt: string;
}

interface SearchResult {
    title: string;
    url: string;
    description: string;
    category: string;         // e.g. 'social', 'image_search', 'breach'
    platform?: string;        // e.g. 'Instagram', 'Google Vision'
    confidenceScore?: number; // 0.0 to 1.0
    confidenceLabel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED';
    isVerified?: boolean;
    metadata?: Record<string, any>;
}
```

**To add a new connector:**
1. Create `src/connectors/myNewConnector.ts`
2. Export an async function that accepts a target string and returns `ConnectorResult`
3. Add it to `src/connectors/index.ts`
4. Call it inside `src/app/api/investigations/[id]/scan/core/route.ts` (or `/visual/route.ts`)

---

## 7. Current Connectors & Their Status

| Connector | File | What It Does | API Key Needed | Status |
|-----------|------|-------------|----------------|--------|
| **Username Search** | `usernameSearch.ts` | Checks 100+ platforms for username existence | None (scraping) | ⚠️ Partially working (some sites block) |
| **WhatsMyName** | `whatsMyName.ts` | Uses WhatsMyName.com dataset for username enumeration | None | ✅ Working |
| **Ecosystem Discovery** | `ecosystemSearch.ts` | Cross-references usernames across platforms | None | ✅ Working |
| **Google Dorks** | `googleDorks.ts` | Automated Google dorking via SerpAPI | `SERPAPI_KEY` | ⚠️ Needs API key |
| **Domain Search** | `domainSearch.ts` | WHOIS + DNS lookup | None (public APIs) | ✅ Working |
| **Breach Search** | `breachSearch.ts` | Checks email/username against breach databases | None (public APIs) | ⚠️ Limited (free APIs have rate limits) |
| **Reverse Image (FaceCheck)** | `reverseImage.ts` | Facial recognition via FaceCheck.id API | `FACECHECK_API_TOKEN` | ❌ No key configured |
| **Siphon Hub (Visual Search)** | `siphonHub.ts` | Google Vision + SerpAPI + Bing reverse image | `GOOGLE_VISION_API_KEY`, `SERPAPI_KEY`, `BING_SEARCH_API_KEY` | ⚠️ Vision key exists but billing not enabled |
| **EXIF Extraction** | `exifMetadata.ts` | Extract EXIF metadata from images | None | ✅ Working |
| **Interpol Search** | `interpolSearch.ts` | Searches Interpol Red Notices | None (public API) | ✅ Working |
| **People Search** | `peopleSearch.ts` | Searches people finder engines | None | ⚠️ Basic implementation |
| **Dark Web Search** | `darkWebSearch.ts` | Checks dark web/paste sites | None | ⚠️ Basic implementation (no real dark web access) |
| **Crypto Search** | `cryptoSearch.ts` | Bitcoin/Ethereum address lookup | None (blockchain.info) | ✅ Working |
| **Registration Scout** | `registrationScout.ts` | Discovers which services an email is registered on | None | ⚠️ Partially working |
| **SecurityTrails** | `securityTrails.ts` | Historical DNS records | `SECURITYTRAILS_API_KEY` | ❌ No key configured |
| **IPinfo** | `ipinfo.ts` | IP geolocation | `IPINFO_TOKEN` (optional) | ✅ Working (basic) |

### 🔴 CRITICAL BLOCKER
**Google Vision API returns HTTP 403** — billing must be enabled on the Google Cloud project even for the free tier. This is why image scans return zero results. Fix: https://console.developers.google.com/billing/enable?project=1004390320510

---

## 8. Environment Variables

All env vars are set in **Vercel Project Settings** (not in `.env` files for production).

### Currently Configured in Vercel

| Variable | Used By | Status |
|----------|---------|--------|
| `DATABASE_URL` | Prisma/Supabase PostgreSQL | ✅ Working |
| `DIRECT_URL` | Prisma migrations only | ✅ Working |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Auth | ✅ Working |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Auth | ✅ Working |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase admin | ✅ Working |
| `GEMINI_API_KEY` | AI report synthesis | ✅ Working |
| `GOOGLE_VISION_API_KEY` | Visual search (siphonHub) | ⚠️ Key exists, billing not enabled |
| `LEMON_SQUEEZY_API_KEY` | Payment verification | ✅ Working |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook validation | ✅ Working |
| `NEXT_PUBLIC_LEMON_SQUEEZY_PRO_LTD_URL` | Pricing checkout | ✅ Working |

### Needs to Be Added

| Variable | Purpose | How to Get |
|----------|---------|-----------|
| `SERPAPI_KEY` | Google Dorks + reverse image search | Free 100/mo at [serpapi.com](https://serpapi.com) |
| `BING_SEARCH_API_KEY` | Bing Visual Search | Free 1000/mo at [Azure Portal](https://portal.azure.com) → Bing Search v7 |
| `FACECHECK_API_TOKEN` | Facial recognition | Paid at [facecheck.id/api](https://facecheck.id/api) |
| `SECURITYTRAILS_API_KEY` | DNS history | Free 50/mo at [securitytrails.com](https://securitytrails.com) |
| `IPINFO_TOKEN` | Enhanced IP geolocation | Free 50k/mo at [ipinfo.io](https://ipinfo.io) |
| `HUNTER_API_KEY` | Email verification + company lookup | Free 25/mo at [hunter.io](https://hunter.io) |
| `SHODAN_API_KEY` | Internet-wide device search | Free at [shodan.io](https://shodan.io) |

---

## 9. Known Issues & What Needs Fixing

### 🔴 Critical (Blocking Core Features)

1. **Google Vision API billing not enabled** — Every image scan completes but returns 0 results. The API key exists but the GCP project needs billing enabled (free tier still requires a payment method).

2. **Visual results not flowing to UI properly** — The `mapFaceCheckResults()` function in `visualIntel.ts` was recently updated to accept Google Vision results, but hasn't been fully tested since the API itself is blocked.

3. **No real-time visual results for image-only investigations** — When scanning with only an image (no text identifiers), Phase 1 (core) is skipped entirely. Phase 2 (visual) runs but if it returns empty (due to API issues), the user sees nothing.

### 🟡 Medium Priority

4. **Username search is fragile** — `usernameSearch.ts` makes direct HTTP requests to 100+ sites. Many have added bot protection, causing timeouts and false negatives. Consider using a proxy rotation service or switching to a dedicated API.

5. **Breach search relies on free public APIs** — `breachSearch.ts` uses free APIs that have strict rate limits. Need to integrate a proper breach database (see API list below).

6. **Dark web connector is basically a stub** — `darkWebSearch.ts` generates search URLs but doesn't actually scrape dark web sources. Would need Tor integration or a dark web intelligence API.

7. **People search is minimal** — `peopleSearch.ts` just generates search URLs for public people search engines. Doesn't scrape or use APIs.

8. **Registration Scout is unreliable** — `registrationScout.ts` attempts to check sign-up flows on various services to determine if an email is registered, but many services have anti-bot measures.

### 🟢 Low Priority (Polish)

9. **Watchlist monitoring is not automated** — Watchlists exist in the DB but there's no background job/cron to actually re-scan them periodically. Need Vercel Cron Jobs or an external scheduler.

10. **Export/PDF generation is basic** — Investigation export exists but could be improved with proper PDF templating.

11. **AI Chat assistant** — There's a chat API route but it's basic. Could be enhanced with RAG over evidence.

---

## 10. OSINT APIs & Data Sources — Comprehensive List

This is the full catalog of APIs and data sources that could power Aletheia. Organized by category, with pricing, what data they return, and how to integrate them.

---

### 🔍 A. USERNAME & SOCIAL MEDIA ENUMERATION

#### 1. WhatsMyName (FREE)
- **URL**: https://whatsmyname.app / https://github.com/WebBreacher/WhatsMyName
- **What it does**: JSON dataset of 500+ websites with URL patterns. Check if a username exists on any of them.
- **How to use**: Download the JSON, iterate over sites, make HTTP requests, check response codes.
- **Already integrated**: Yes (`whatsMyName.ts`)
- **Limitations**: Some sites block automated requests.

#### 2. Maigret (FREE, self-hosted)
- **URL**: https://github.com/soxoj/maigret
- **What it does**: Python-based username checker across 3000+ sites (most comprehensive available).
- **How to use**: Run as a subprocess or set up a microservice. Returns JSON with found profiles.
- **Integration idea**: Deploy as a separate API on Railway/Render, call from Aletheia.

#### 3. Sherlock Project (FREE, self-hosted)
- **URL**: https://github.com/sherlock-project/sherlock
- **What it does**: Python-based username search across 400+ sites.
- **Similar to Maigret but smaller dataset.

#### 4. Social Searcher API (FREE tier available)
- **URL**: https://www.social-searcher.com/api/
- **Pricing**: Free 100 searches/day, paid plans from $3.49/mo
- **What it does**: Real-time social media monitoring and search.

#### 5. SocialScan (FREE)
- **URL**: https://github.com/iojw/socialscan
- **What it does**: Accurate username/email availability checker. Uses actual registration endpoints.

---

### 📸 B. REVERSE IMAGE & FACIAL RECOGNITION

#### 6. Google Cloud Vision API (FREE tier + paid)
- **URL**: https://cloud.google.com/vision
- **Pricing**: **Free 1000 requests/month**, then $1.50/1000
- **What it does**: Web Detection (finds pages containing image), label detection, face detection, OCR
- **Env var**: `GOOGLE_VISION_API_KEY`
- **Already integrated**: Yes (`siphonHub.ts`) — **⚠️ NEEDS BILLING ENABLED ON GCP PROJECT**
- **Setup**: console.cloud.google.com → Enable "Cloud Vision API" → Create API key → Enable billing

#### 7. SerpAPI — Google Lens Reverse Image (FREE tier)
- **URL**: https://serpapi.com
- **Pricing**: **Free 100 searches/month**, paid from $50/mo
- **What it does**: Google Lens reverse image search results with thumbnails, titles, and source URLs
- **Env var**: `SERPAPI_KEY`
- **Already integrated**: Yes (`siphonHub.ts`) — needs key added to Vercel
- **Setup**: Sign up → Dashboard → API Key

#### 8. Bing Visual Search API (FREE tier)
- **URL**: https://www.microsoft.com/en-us/bing/apis/bing-visual-search-api
- **Pricing**: **Free 1000 calls/month**
- **What it does**: Reverse image search via Bing. Returns pages containing the image, visually similar images, entity recognition.
- **Env var**: `BING_SEARCH_API_KEY`
- **Already integrated**: Yes (`siphonHub.ts`) — needs key added to Vercel
- **Setup**: Azure Portal → Create Bing Search v7 resource → Get key

#### 9. FaceCheck.id API (PAID)
- **URL**: https://facecheck.id/api
- **Pricing**: Credits-based, starts ~$5 for 200 searches
- **What it does**: **TRUE facial recognition** — finds matching faces across the internet with confidence scores. The real deal for biometric OSINT.
- **Env var**: `FACECHECK_API_TOKEN`
- **Already integrated**: Yes (`reverseImage.ts`) — needs token purchased
- **This is the most powerful visual connector and should be prioritized.**

#### 10. PimEyes API (PAID, expensive)
- **URL**: https://pimeyes.com
- **Pricing**: From $29.99/month
- **What it does**: The industry standard for face search. Finds faces across billions of web pages.
- **No official API** — would need scraping or browser automation.

#### 11. TinEye API (PAID)
- **URL**: https://tineye.com/api
- **Pricing**: From $200/month for 5000 searches
- **What it does**: Reverse image search focused on where an image appears online and its history.

---

### 📧 C. EMAIL INTELLIGENCE

#### 12. Hunter.io (FREE tier)
- **URL**: https://hunter.io/api
- **Pricing**: **Free 25 searches/month**, paid from $49/mo
- **What it does**: Email verification, company email patterns, associated person data
- **Env var**: `HUNTER_API_KEY`
- **Not yet integrated** — high priority

#### 13. Have I Been Pwned API (FREE for breach checks)
- **URL**: https://haveibeenpwned.com/API/v3
- **Pricing**: **Free for password hash checks**, $3.50/month for breach search API
- **What it does**: Check if an email has been in any data breach. Returns breach names, dates, and exposed data types.
- **Env var**: `HIBP_API_KEY`
- **Should replace/supplement current `breachSearch.ts` implementation**

#### 14. EmailRep.io (FREE)
- **URL**: https://emailrep.io
- **Pricing**: **Free 200 queries/day** (no key needed), 5K/day with free key
- **What it does**: Email reputation scoring — tells you if an email is suspicious, disposable, from a free provider, how old it is, associated breaches.
- **Not yet integrated** — easy to add, very useful

#### 15. Dehashed API (PAID)
- **URL**: https://dehashed.com/api
- **Pricing**: From $5/month
- **What it does**: Search across billions of breached records by email, username, IP, name, phone, etc. Returns actual leaked data.
- **This is the gold standard for breach intelligence.**

#### 16. IntelX (Intelligence X) (FREE tier)
- **URL**: https://intelx.io/api
- **Pricing**: **Free tier available** (limited), paid from $2000/year
- **What it does**: Search across dark web, paste sites, public data leaks, historical WHOIS, and more.

#### 17. Holehe (FREE, self-hosted)
- **URL**: https://github.com/megadose/holehe
- **What it does**: Python tool that checks 120+ sites for account registration using password reset/login endpoints. Very accurate for determining which services an email is registered on.
- **Integration idea**: Deploy as microservice, call from `registrationScout.ts`

---

### 🌐 D. DOMAIN & INFRASTRUCTURE

#### 18. SecurityTrails (FREE tier)
- **URL**: https://securitytrails.com/api
- **Pricing**: **Free 50 queries/month**, paid from $50/mo
- **What it does**: Historical DNS records, subdomains, associated domains, WHOIS history
- **Env var**: `SECURITYTRAILS_API_KEY`
- **Already integrated**: Yes (`securityTrails.ts`) — needs key

#### 19. Shodan (FREE tier)
- **URL**: https://shodan.io/api
- **Pricing**: **Free API with limited results**, paid from $59 one-time
- **What it does**: Search engine for internet-connected devices. Returns open ports, services, banners, vulnerabilities, SSL certs, and more.
- **Env var**: `SHODAN_API_KEY`
- **Not yet integrated** — extremely valuable for infrastructure recon

#### 20. Censys (FREE tier)
- **URL**: https://censys.io/api
- **Pricing**: **Free 250 queries/day**
- **What it does**: Similar to Shodan — internet-wide scanning, certificate transparency, host enumeration.

#### 21. VirusTotal (FREE tier)
- **URL**: https://www.virustotal.com/vtapi/v3
- **Pricing**: **Free 500 requests/day**
- **What it does**: Scan URLs/domains/IPs against 70+ security engines. Returns malware status, associated files, DNS data.
- **Env var**: `VIRUSTOTAL_API_KEY`

#### 22. URLScan.io (FREE)
- **URL**: https://urlscan.io/api/v1
- **Pricing**: **Free 50 scans/day** (public results), paid for private
- **What it does**: Live website scanning with screenshots, HTTP transactions, cookies, and technology detection.

#### 23. BuiltWith (FREE tier)
- **URL**: https://api.builtwith.com
- **Pricing**: Free basic lookups
- **What it does**: Technology profiling — what tech stack a website uses.

#### 24. IPinfo.io (FREE tier)
- **URL**: https://ipinfo.io
- **Pricing**: **Free 50,000 requests/month**
- **What it does**: IP geolocation, ASN, company, privacy detection (VPN/proxy/Tor)
- **Already integrated**: Yes (`ipinfo.ts`)

#### 25. AbuseIPDB (FREE)
- **URL**: https://www.abuseipdb.com/api
- **Pricing**: **Free 1000 checks/day**
- **What it does**: Check if an IP has been reported for abuse/attacks.

---

### 📱 E. PHONE NUMBER INTELLIGENCE

#### 26. NumVerify (FREE tier)
- **URL**: https://numverify.com
- **Pricing**: **Free 100 requests/month**
- **What it does**: Phone number validation, carrier lookup, line type detection, country.

#### 27. Abstract Phone Validation (FREE tier)
- **URL**: https://www.abstractapi.com/api/phone-validation-api
- **Pricing**: **Free 100 requests/month**
- **What it does**: Phone number validation and carrier lookup.

#### 28. Truecaller (No official API)
- **What it does**: Caller ID and phone number identity. Would need unofficial methods.

---

### 🕵️ F. DARK WEB & PASTE SITES

#### 29. IntelX (see above) — searches dark web archives

#### 30. Dehashed (see above) — searches breach data from dark web dumps

#### 31. Ahmia.fi (FREE)
- **URL**: https://ahmia.fi/api
- **What it does**: Search engine for Tor hidden services. Free API.

#### 32. Onion.live (FREE)
- **URL**: https://onion.live
- **What it does**: Directory of Tor hidden services with metadata.

---

### 🔐 G. CRYPTO & FINANCIAL

#### 33. Blockchain.info API (FREE)
- **URL**: https://www.blockchain.com/api
- **Pricing**: Free
- **What it does**: Bitcoin address lookup, transaction history, balance.
- **Already integrated**: Yes (`cryptoSearch.ts`)

#### 34. Etherscan API (FREE tier)
- **URL**: https://etherscan.io/apis
- **Pricing**: **Free 100k calls/day**
- **What it does**: Ethereum address lookup, token transfers, contract interactions.

#### 35. Chainalysis / Elliptic (ENTERPRISE)
- **What it does**: Professional-grade crypto tracing and risk scoring.

---

### 🤖 H. AI & REPORT GENERATION

#### 36. Google Gemini API (FREE tier)
- **URL**: https://ai.google.dev
- **Pricing**: Free for gemini-1.5-flash (rate limited), paid for higher throughput
- **What it does**: AI synthesis of OSINT findings into structured intelligence reports
- **Already integrated**: Yes (`src/lib/ai.ts`)

#### 37. OpenAI API (PAID)
- **URL**: https://platform.openai.com
- **Pricing**: Pay-per-token
- **What it does**: Alternative AI for report synthesis. OpenAI SDK already in `package.json`.

---

### 📊 I. OSINT AGGREGATION PLATFORMS (ALL-IN-ONE APIs)

These are commercial OSINT APIs that combine multiple data sources into a single query:

#### 38. SpiderFoot HX (FREE self-hosted / paid cloud)
- **URL**: https://www.spiderfoot.net
- **What it does**: 200+ data source integrations. Free self-hosted version available.
- **Integration idea**: Run self-hosted and use as an API backend.

#### 39. Recon.dev (FREE)
- **URL**: https://recon.dev
- **What it does**: Subdomain discovery and reconnaissance data aggregation.

#### 40. FullContact (FREE tier)
- **URL**: https://www.fullcontact.com/developer-portal
- **Pricing**: Free 100 matches/month
- **What it does**: Person enrichment from email/phone — returns names, social profiles, demographics.

#### 41. Pipl (ENTERPRISE)
- **URL**: https://pipl.com
- **What it does**: The most comprehensive people search API. Returns identity data from billions of records.

---

## 11. Local Development Setup

```bash
# 1. Clone the repo
git clone https://github.com/Lucas-Maingi/OpenVector.git
cd OpenVector

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in values (see Section 8)

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database (if new)
npx prisma db push

# 6. Run dev server
npm run dev
# → http://localhost:3000
```

### Key Development Commands
```bash
npm run dev           # Start dev server
npm run build         # Production build (includes prisma generate)
npx prisma studio     # Open Prisma database GUI
npx prisma db push    # Push schema changes to Supabase
```

---

## 12. Deployment

The project deploys automatically to **Vercel** on push to `master`.

### Vercel Configuration
- **Framework**: Next.js (auto-detected)
- **Build Command**: `prisma generate && next build`
- **Function Timeout**: 60 seconds (Hobby plan)
- **Environment Variables**: Set in Vercel Dashboard → Settings → Environment Variables

### Deployment Flow
```
git push origin master → Vercel auto-builds → Live at aletheia-live.vercel.app
```

### Diagnostic Endpoints (for testing)
- `/api/diagnostic/visual` — Tests all visual API keys and returns their status
- `/api/diagnostic` — General system health check

---

## Quick Priority Guide for a New Developer

| Priority | Task | Impact |
|----------|------|--------|
| 🔴 1 | Enable GCP billing for Google Vision API | Unblocks ALL image scanning |
| 🔴 2 | Add `SERPAPI_KEY` to Vercel env vars | Enables Google Dorks + backup image search |
| 🔴 3 | Add `BING_SEARCH_API_KEY` to Vercel env vars | Third visual search engine |
| 🟡 4 | Integrate Hunter.io for email intelligence | Major new data source |
| 🟡 5 | Integrate Have I Been Pwned API v3 | Reliable breach checking |
| 🟡 6 | Add Shodan integration | Infrastructure recon |
| 🟡 7 | Add EmailRep.io integration | Free email reputation data |
| 🟢 8 | Set up Vercel Cron for Watchlist monitoring | Background jobs |
| 🟢 9 | Purchase FaceCheck.id credits | True facial recognition |
| 🟢 10 | Deploy Maigret as a microservice | 3000+ site username checking |

---

> **Questions?** Check the codebase — every connector follows the same pattern. Look at `src/connectors/ipinfo.ts` for the simplest example, or `src/connectors/siphonHub.ts` for the most complex one.
