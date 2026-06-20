# OpenVector: The Architect's Learning Roadmap

**Author:** Built by the product's core architect (AI pair-programmer) — the one who wrote every file referenced here.

**Goal:** Master full-stack engineering, OSINT systems design, and AI integration by reading and understanding this production codebase file-by-file. You guide, you validate, you learn. AI assists — it does not replace your thinking.

**Method:** For every module: Read → Trace → Understand → Document in your notebook → Implement one small thing → Test → Move on.

---

## How This Roadmap Works

### Module Documentation Format

Every module follows this structure:

```
Module N: [Name]
├─ Purpose:             Why this module exists in the product
├─ Inputs:              What you need to know BEFORE starting this module
├─ Outputs:             What you'll know AFTER completing this module
├─ Technologies:        Specific tools, libraries, concepts used
├─ Risks:               What can go wrong if this module is built poorly
├─ Learning Objectives: Specific skills you'll gain
├─ Files to Read:       Exact files, in order, with line counts
├─ Architecture Diagram: ASCII visualization of how this module works
├─ Notebook Checkpoint: Specific things to write in your physical book
├─ Hands-On Task:       One small implementation exercise
├─ Self-Test Questions: Prove you understood it
└─ Estimated Time:      Realistic time for reading + understanding
```

### Phases Overview

```
Phase 0: Ethics & Legal Foundation         (Module 0)
Phase 1: Project Anatomy                   (Modules 1-2)
Phase 2: Core Infrastructure               (Modules 3-4)
Phase 3: Data Collection Engine            (Modules 5-6)
Phase 4: Intelligence & AI                 (Modules 7-8)
Phase 5: Data Layer                        (Module 9)
Phase 6: User-Facing Systems              (Modules 10-11)
Phase 7: Production Readiness              (Modules 12-14)
```

---

## Complete File Map

Every file in the project, organized by the module where you'll study it:

```
OpenVector/
├── package.json                          ← Module 1
├── tsconfig.json                         ← Module 1
├── next.config.ts                        ← Module 1
├── tailwind.config.ts                    ← Module 1
├── postcss.config.mjs                    ← Module 1
├── eslint.config.mjs                     ← Module 1
├── vercel.json                           ← Module 1
├── .env.example                          ← Module 1
├── .gitignore                            ← Module 1
│
├── prisma/
│   └── schema.prisma                     ← Module 9
│
├── src/
│   ├── middleware.ts                      ← Module 3
│   │
│   ├── lib/
│   │   ├── prisma.ts                     ← Module 4
│   │   ├── supabase/                     ← Module 4
│   │   ├── auth-utils.ts                 ← Module 4
│   │   ├── security.ts                   ← Module 4
│   │   ├── rate-limit.ts                 ← Module 4
│   │   ├── serialization.ts             ← Module 4
│   │   ├── utils.ts                      ← Module 4
│   │   ├── ai.ts                         ← Module 7
│   │   ├── investigation-polling.ts     ← Module 10
│   │   ├── launch-config.ts             ← Module 10
│   │   ├── screenshot.ts               ← Module 10
│   │   ├── themes.ts                     ← Module 10
│   │   └── osint/                        ← Module 6
│   │
│   ├── connectors/
│   │   ├── types.ts                      ← Module 5
│   │   ├── index.ts                      ← Module 5
│   │   ├── ipinfo.ts            (46 lines)  ← Module 5 (START here)
│   │   ├── visualIntel.ts       (small)     ← Module 5
│   │   ├── peopleSearch.ts      (small)     ← Module 5
│   │   ├── securityTrails.ts    (medium)    ← Module 5
│   │   ├── interpolSearch.ts    (medium)    ← Module 5
│   │   ├── whatsMyName.ts       (medium)    ← Module 5
│   │   ├── cryptoSearch.ts      (medium)    ← Module 5
│   │   ├── darkWebSearch.ts     (medium)    ← Module 5
│   │   ├── domainSearch.ts      (medium)    ← Module 6
│   │   ├── exifMetadata.ts      (medium)    ← Module 6
│   │   ├── ecosystemSearch.ts   (large)     ← Module 6
│   │   ├── registrationScout.ts (11KB)      ← Module 6
│   │   ├── usernameSearch.ts    (13KB)      ← Module 6
│   │   ├── reverseImage.ts      (15KB)      ← Module 6
│   │   ├── siphonHub.ts         (17KB)      ← Module 6
│   │   ├── googleDorks.ts       (20KB)      ← Module 6
│   │   └── breachSearch.ts      (23KB)      ← Module 6
│   │
│   ├── app/
│   │   ├── layout.tsx                    ← Module 10
│   │   ├── page.tsx                      ← Module 10
│   │   ├── globals.css                   ← Module 10
│   │   ├── api/
│   │   │   ├── investigations/           ← Module 8
│   │   │   ├── chat/                     ← Module 8
│   │   │   ├── auth/                     ← Module 9
│   │   │   ├── billing/                  ← Module 11
│   │   │   ├── checkout/                 ← Module 11
│   │   │   ├── webhooks/                 ← Module 11
│   │   │   ├── search/                   ← Module 8
│   │   │   ├── admin/                    ← Module 11
│   │   │   ├── user/                     ← Module 11
│   │   │   ├── notifications/            ← Module 11
│   │   │   ├── watchlists/               ← Module 11
│   │   │   ├── feedback/                 ← Module 11
│   │   │   ├── system/                   ← Module 12
│   │   │   ├── debug/                    ← Module 12
│   │   │   ├── diagnostic/              ← Module 12
│   │   │   └── migrate/                 ← Module 12
│   │   └── dashboard/                    ← Module 10
│   │
│   ├── components/
│   │   ├── ui/                           ← Module 10
│   │   ├── dashboard/                    ← Module 10
│   │   │   ├── (34 component files)
│   │   │   ├── identity-graph.tsx        ← Module 8 (Graph Engine)
│   │   │   ├── investigation-graph.tsx   ← Module 8
│   │   │   └── facial-analysis.tsx       ← Module 8 (most complex UI)
│   │   ├── landing/                      ← Module 10
│   │   ├── header.tsx                    ← Module 10
│   │   └── footer.tsx                    ← Module 10
│   │
│   ├── context/                          ← Module 10
│   └── styles/                           ← Module 10
│
├── docs/                                 ← Reference material
├── scripts/                              ← Module 12
└── test files (root)                     ← Module 12
```

---

## Module 0: OSINT Ethics, Legality & Responsibility

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Establish the legal and ethical framework before touching any code. OpenVector gathers intelligence from public sources — but "public" has boundaries. |
| **Inputs** | None — this is your starting point |
| **Outputs** | Understanding of legal OSINT boundaries, ethical frameworks, data privacy regulations, and responsible use |
| **Technologies** | No code — pure knowledge |
| **Risks** | Building an intelligence tool without legal awareness exposes you to criminal liability (CFAA in US, Computer Misuse Act in UK), civil lawsuits, and platform bans |
| **Learning Objectives** | Define legal vs. illegal data gathering; understand GDPR/CCPA implications; establish personal ethical boundaries |

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  LEGALITY SPECTRUM                    │
│                                                       │
│  ✅ LEGAL (OSINT)              ❌ ILLEGAL              │
│  ├─ Public social profiles     ├─ Hacking accounts    │
│  ├─ Public DNS/WHOIS records   ├─ Bypassing auth      │
│  ├─ Breach databases (public)  ├─ Scraping with ToS   │
│  ├─ Published court records    │   violations          │
│  ├─ Public API endpoints       ├─ Social engineering   │
│  ├─ Google-indexed content     │   for credentials     │
│  └─ Open government data       ├─ Accessing private    │
│                                │   databases           │
│  ⚠️ GRAY ZONE                  └─ Intercepting comms   │
│  ├─ Rate-limited scraping                              │
│  ├─ Cached breach data                                 │
│  ├─ Facial recognition                                 │
│  └─ Cross-platform correlation                         │
└─────────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

Write these in your book:

1. **"OSINT = Open Source Intelligence"** — Information gathered from publicly available sources. It is NOT hacking.
2. **CFAA (US)** — Computer Fraud and Abuse Act. Accessing a computer system without authorization is a federal crime. Our connectors only query public APIs and search engines.
3. **GDPR (EU)** — Users have the right to be forgotten. If we store data about EU citizens, they can demand deletion.
4. **CCPA (California)** — Similar to GDPR but for California residents.
5. **"Ethical OSINT rule"** — Just because data is public does not mean it's ethical to aggregate it. Correlation amplifies privacy invasion.
6. **Our product's ethical line:** We gather, correlate, and present. We do NOT: bypass authentication, scrape behind logins, hack, social engineer, or store data longer than necessary.
7. **Why this matters for YOUR career:** Employers in cybersecurity, compliance, and intelligence value engineers who understand legal boundaries. This knowledge is rare and marketable.

### Self-Test Questions

1. Is scraping someone's public Twitter profile legal? What about 10,000 profiles?
2. If a breach database is publicly accessible, is it legal to query it?
3. What is the difference between OSINT and surveillance?
4. If a user asks you to "find everything about person X," what ethical questions should you ask first?
5. What data protection right does a European user have that could affect our product?

**⏱ Estimated Time: 1 hour of reading and note-taking**

---

## Module 1: Project Anatomy (Configuration Files)

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand what tools, libraries, and frameworks the project uses before reading any application code |
| **Inputs** | Basic understanding of what a web application is |
| **Outputs** | Complete mental model of the tech stack, build system, and project structure |
| **Technologies** | Node.js, npm, TypeScript, Next.js 16, React 19, Prisma ORM, Supabase, TailwindCSS 4, Vercel |
| **Risks** | Misconfigured dependencies cause build failures; wrong TypeScript settings cause type errors; missing env vars cause runtime crashes |
| **Learning Objectives** | Read and understand package.json; understand TypeScript compilation; understand Next.js configuration; know every environment variable the app needs |

### Files to Read (In Order)

| # | File | Lines | What It Tells You |
|---|------|-------|-------------------|
| 1 | `package.json` | 81 | Every dependency, every script, the app's identity |
| 2 | `tsconfig.json` | 35 | How TypeScript compiles this project |
| 3 | `next.config.ts` | 38 | Security headers, React compiler, CSP policy |
| 4 | `tailwind.config.ts` | ~80 | Custom design tokens, colors, animations |
| 5 | `postcss.config.mjs` | ~5 | CSS processing pipeline |
| 6 | `eslint.config.mjs` | ~15 | Code quality rules |
| 7 | `vercel.json` | ~5 | Deployment configuration |
| 8 | `.env.example` | ~40 | Every environment variable the app needs |
| 9 | `.gitignore` | ~20 | What is NOT committed to git (secrets, build artifacts) |

### Architecture

```
┌─────────────────────────────────────────────────┐
│              PROJECT CONFIGURATION               │
│                                                   │
│  package.json ─────┐                              │
│    "What tools"    │                              │
│                    ▼                              │
│  tsconfig.json ─── TypeScript Compiler ──┐        │
│    "How to         │                     │        │
│     compile"       │                     ▼        │
│                    │               next.config.ts │
│  tailwind.config ──┤               "How to build  │
│    "How to style"  │                & secure"     │
│                    │                     │        │
│  .env.example ─────┤                    ▼        │
│    "What secrets"  │            vercel.json       │
│                    │            "How to deploy"   │
│                    ▼                              │
│              ┌─────────┐                          │
│              │ npm run  │                          │
│              │   dev    │                          │
│              └─────────┘                          │
│                   │                               │
│                   ▼                               │
│          http://localhost:3000                     │
└─────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

Write these in your book:

1. **Tech Stack:**
   - Framework: Next.js 16 (React 19)
   - Language: TypeScript (strict mode)
   - Database: PostgreSQL via Supabase
   - ORM: Prisma 5
   - Auth: Supabase Auth (session-based)
   - AI: Google Gemini API (via raw fetch, not SDK)
   - Styling: TailwindCSS 4
   - UI Components: Radix UI primitives (18 packages!)
   - Animations: Framer Motion
   - Charts: Recharts
   - Deployment: Vercel

2. **Key npm scripts:**
   - `npm run dev` → starts dev server
   - `npm run build` → `prisma generate && next build` (generates DB client first!)
   - `npm run lint` → runs ESLint

3. **Critical tsconfig settings:**
   - `strict: true` → catches more bugs at compile time
   - `module: "esnext"` → modern JavaScript modules
   - `paths: { "@/*": ["./src/*"] }` → `@/` means `src/` (import shortcut)

4. **Security headers in next.config.ts:**
   - CSP (Content Security Policy) → controls what resources can load
   - X-Frame-Options: DENY → prevents clickjacking
   - X-Content-Type-Options: nosniff → prevents MIME sniffing attacks

### Self-Test Questions

1. What command generates the Prisma client? Why does it run before `next build`?
2. What does `"strict": true` in tsconfig.json enforce?
3. What does `@/lib/prisma` resolve to as an actual file path?
4. Name 3 security headers in next.config.ts and what attack each prevents.
5. Why is `.env.local` in `.gitignore`? What would happen if it wasn't?

**⏱ Estimated Time: 45 minutes**

---

## Module 2: TypeScript Patterns in OpenVector

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Learn the TypeScript patterns used throughout the codebase so you can read any file confidently |
| **Inputs** | Basic JavaScript knowledge |
| **Outputs** | Ability to read and understand every TypeScript construct in the project |
| **Technologies** | TypeScript 5, generics, interfaces, type guards, async/await, discriminated unions |
| **Risks** | Without TypeScript fluency, you'll be guessing at what code does instead of knowing |
| **Learning Objectives** | Read interfaces; understand generics; use async/await; understand optional chaining; read type assertions |

### Key Patterns (With Real Examples From Our Code)

**Pattern 1: Interfaces** — defining the shape of data
```typescript
// From src/connectors/types.ts (THE contract every connector follows)
export interface SearchResult {
    title: string;
    url: string;
    description: string;
    category: string;
    platform?: string;          // ? means OPTIONAL
    isVerified?: boolean;
    error?: string;
    metadata?: Record<string, any>;  // flexible key-value store
    confidenceScore?: number;   // 0.0 to 1.0
    confidenceLabel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED';  // UNION TYPE
}
```

**Pattern 2: Generics** — functions that work with any type
```typescript
// From src/lib/serialization.ts
export function serializeData<T>(data: T): T {
    // T = "whatever type you pass in, I'll return the same type"
    // If you call serializeData<User>(user), T becomes User
}
```

**Pattern 3: Type assertion (`as`)** — telling TypeScript "trust me"
```typescript
// From src/lib/prisma.ts
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};
// "Treat globalThis as an object that MAY have a prisma property"
```

**Pattern 4: Async/Await with error handling**
```typescript
// From src/connectors/ipinfo.ts
export async function ipinfo(ip: string): Promise<ConnectorResult> {
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
            const data = await res.json();
            // process data...
        }
    } catch { /* skip on failure */ }
    return { connectorType: 'ipinfo', query: ip, results, generatedAt: ... };
}
```

**Pattern 5: Non-null assertion (`!`)** — "I know this exists"
```typescript
// From src/middleware.ts
process.env.NEXT_PUBLIC_SUPABASE_URL!
// The ! says "I guarantee this env var exists at runtime"
```

### 📓 Notebook Checkpoint

Write a "TypeScript Cheat Sheet" page:

| Symbol | Meaning | Example |
|--------|---------|---------|
| `?` after property | Optional (might not exist) | `platform?: string` |
| `!` after value | Non-null assertion (trust me, it exists) | `process.env.KEY!` |
| `<T>` | Generic type parameter | `function fn<T>(data: T): T` |
| `as` | Type assertion (cast) | `x as unknown as Type` |
| `\|` | Union type (one of these) | `'HIGH' \| 'LOW'` |
| `Record<K,V>` | Object with keys K and values V | `Record<string, any>` |
| `Promise<T>` | Async function returns T | `Promise<ConnectorResult>` |
| `??` | Nullish coalescing (use right if left is null/undefined) | `value ?? 'default'` |
| `?.` | Optional chaining (don't crash if null) | `data?.user?.email` |

### Self-Test Questions

1. In `ConnectorResult`, what does `results: SearchResult[]` mean? (Array of SearchResult)
2. Why does `confidenceLabel` use `'HIGH' | 'MEDIUM' | 'LOW'` instead of just `string`?
3. What's the difference between `x?.y` and `x!.y`?
4. Why does `serializeData<T>` use a generic instead of accepting `any`?
5. What does `Promise<ConnectorResult>` tell you about the `ipinfo()` function?

**⏱ Estimated Time: 30 minutes**

---

## Module 3: The Request Gateway (Middleware)

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the FIRST code that runs on every single request before any page or API route |
| **Inputs** | Module 1 (project config), Module 2 (TypeScript patterns) |
| **Outputs** | Understanding of request interception, session management, auth flow, guest identity |
| **Technologies** | Next.js middleware, Supabase SSR, cookies, HTTP headers, UUID generation |
| **Risks** | Broken middleware = broken auth = security disaster. Every user could see every other user's data. |
| **Learning Objectives** | Understand middleware pattern; learn cookie-based sessions; understand guest vs authenticated users; learn route protection |

### Files to Read

| # | File | Lines | What It Teaches You |
|---|------|-------|---------------------|
| 1 | `src/middleware.ts` | 127 | Request interception, auth, guest identity, route protection |

### Architecture

```
Every HTTP Request to OpenVector
         │
         ▼
┌─────────────────────────────────────────────────┐
│              MIDDLEWARE (src/middleware.ts)        │
│              Runs BEFORE any page or API          │
│                                                   │
│  Step 1: Initialize Supabase Client               │
│  ├─ Read cookies from request                     │
│  ├─ Create server-side Supabase client            │
│  └─ Refresh session token if expired              │
│         │                                         │
│  Step 2: Guest Identity Provisioning              │
│  ├─ Is user logged in? → Use their Supabase ID    │
│  ├─ No login + no guest cookie?                   │
│  │   └─ Generate UUID → set 'ale_guest_id' cookie │
│  │       (30-day httpOnly cookie)                  │
│  └─ Inject 'x-ale-guest-id' header for API routes │
│         │                                         │
│  Step 3: Route Protection                         │
│  ├─ Is route public? (/, /auth/*, /dashboard/*)   │
│  │   └─ YES → Allow through                       │
│  ├─ Is user authenticated?                        │
│  │   ├─ NO → Redirect to /auth/login              │
│  │   └─ YES + visiting /auth/login?               │
│  │       └─ Redirect to /dashboard (already in)   │
│  └─ All checks pass → Allow through               │
│         │                                         │
│  Step 4: Return modified response                 │
│  └─ Updated cookies + headers flow to the route   │
└─────────────────────────────────────────────────┘
         │
         ▼
    Page or API Route receives the request
    (with auth state and guest ID already resolved)
```

### 📓 Notebook Checkpoint

1. **"Middleware = the bouncer at the door."** Every request passes through it. If middleware breaks, the whole app breaks.
2. **Guest identity system:** OpenVector allows unauthenticated use. A guest gets a random UUID stored in an httpOnly cookie for 30 days. This lets guests save investigations without signing up.
3. **httpOnly cookie:** JavaScript in the browser CANNOT read this cookie. Only the server can. This prevents XSS attacks from stealing the guest ID.
4. **Header injection trick (line 59-67):** Middleware creates a NEW request with a custom header `x-ale-guest-id`. API routes can then read this header to know who the guest is. This is elegant because cookies aren't always accessible in API routes.
5. **Public routes list (line 84-98):** These routes don't require login. Notice `/dashboard` is public — guests can use the dashboard without signing up.
6. **`matcher` config (line 122-126):** The regex excludes static files (images, CSS, JS) from middleware. No point running auth checks on a PNG file.

### Self-Test Questions

1. Why does the middleware create a NEW `NextResponse.next()` object (line 63) instead of modifying the existing one?
2. What would happen if `ale_guest_id` was NOT httpOnly?
3. Why is `/dashboard` in the public routes list? Shouldn't it require login?
4. What does the matcher regex `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|...)).*)` do?
5. If middleware crashes, what happens to the user?

**⏱ Estimated Time: 45 minutes**

---

## Module 4: Core Infrastructure (The Utility Belt)

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the shared utilities that EVERY part of the application depends on |
| **Inputs** | Module 3 (middleware), Module 2 (TypeScript) |
| **Outputs** | Understanding of database connections, authentication, security, rate limiting, serialization |
| **Technologies** | Prisma ORM, Supabase Auth, connection pooling (PgBouncer), XSS prevention, rate limiting, data serialization |
| **Risks** | DB connection exhaustion crashes the app; missing auth lets users access other users' data; no rate limiting enables abuse; unsafe serialization causes rendering errors |
| **Learning Objectives** | Understand singleton patterns; learn connection pooling; implement ownership validation; understand XSS prevention; learn rate limiting algorithms |

### Files to Read

| # | File | Lines | What It Teaches You |
|---|------|-------|---------------------|
| 1 | `src/lib/prisma.ts` | 42 | Database connection, singleton pattern, connection pooling |
| 2 | `src/lib/auth-utils.ts` | 71 | Dual identity system (Supabase user OR guest), ownership validation |
| 3 | `src/lib/security.ts` | 35 | XSS prevention, UUID validation, injection detection |
| 4 | `src/lib/rate-limit.ts` | 44 | In-memory rate limiter, sliding window pattern |
| 5 | `src/lib/serialization.ts` | 32 | Safe data conversion for client components (Date→string, BigInt→string) |
| 6 | `src/lib/utils.ts` | ~5 | Small utility functions |
| 7 | `src/lib/supabase/` | dir | Supabase client initialization (server vs client) |

### Architecture

```
┌───────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                  │
│          (Every other module depends on these)         │
│                                                        │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  prisma.ts   │    │ auth-utils.ts│                  │
│  │              │    │              │                  │
│  │ Singleton DB │    │ Who is the   │                  │
│  │ client with  │    │ current user?│                  │
│  │ connection   │◄───│              │                  │
│  │ pooling      │    │ Supabase user│                  │
│  │ (max 10)     │    │ OR guest ID  │                  │
│  └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                          │
│         │    ┌──────────────┴──────────────┐            │
│         │    │     validateOwnership()     │            │
│         │    │ "Does this user own this    │            │
│         │    │  investigation?"            │            │
│         │    └─────────────────────────────┘            │
│         │                                              │
│  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ security.ts  │  │ rate-limit   │  │serialization │  │
│  │              │  │              │  │              │  │
│  │ sanitize()   │  │ 10 req/min   │  │ Date→string  │  │
│  │ isValidUuid()│  │ per user+    │  │ BigInt→string│  │
│  │ isSafeQuery()│  │ action combo │  │ for React    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

1. **Singleton Pattern (prisma.ts):**
   ```
   Problem: Next.js hot-reloads in dev → creates new DB client each time → exhausts connections
   Solution: Store client in globalThis → reuse across hot-reloads
   Key line: `globalForPrisma.prisma ?? getPrismaClient()`
   Translation: "Use existing client, OR create new one"
   ```

2. **Connection Pooling (prisma.ts lines 12-27):**
   ```
   PgBouncer = a connection pool manager between app and database
   Port 6543 = PgBouncer port (vs 5432 for direct Postgres)
   connection_limit=10 = max concurrent DB connections
   Why? Serverless functions spin up many instances; each needs a DB connection
   ```

3. **Dual Identity System (auth-utils.ts):**
   ```
   Priority order:
   1. Supabase authenticated user → use their real ID
   2. Guest cookie (ale_guest_id) → use guest UUID
   3. Header injection (x-ale-guest-id) → middleware fallback
   4. Temp ID (randomUUID) → last resort, single-session only
   ```

4. **Ownership Validation:**
   ```
   validateOwnership(investigationId, userId)
   → Queries DB: "Does investigation X belong to user Y?"
   → Returns boolean
   → CRITICAL: Without this, any user could view/edit any investigation
   ```

5. **XSS Prevention (security.ts):**
   ```
   sanitize("Hello <script>alert('hack')</script>")
   → "Hello &lt;script&gt;alert(&#x27;hack&#x27;)&lt;/script&gt;"
   → Browser renders harmless text instead of executing code
   ```

6. **Rate Limiting (rate-limit.ts):**
   ```
   Algorithm: Fixed window counter
   Key: "userId:action" (e.g., "abc123:scan")
   Default: 10 requests per 60 seconds
   In production: should use Redis instead of in-memory (comment on line 2)
   ```

### Self-Test Questions

1. Why does prisma.ts store the client in `globalThis` instead of a regular variable?
2. What is PgBouncer and why does a serverless app need it?
3. In auth-utils.ts, why does it check cookies AND headers for the guest ID?
4. What would happen if `validateOwnership()` always returned `true`?
5. Why does the comment in rate-limit.ts say "replace with Redis in production"?
6. Why does serialization.ts need to convert Dates to strings? (Hint: React Server Components)

**⏱ Estimated Time: 1.5 hours**

---

## Module 5: Connector Engine — Simple Connectors

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the connector pattern by studying the simplest connectors first |
| **Inputs** | Module 2 (TypeScript), Module 4 (infrastructure) |
| **Outputs** | Ability to read any connector; understanding of the connector contract; API integration patterns |
| **Technologies** | Fetch API, AbortController (timeouts), API integration, error handling, confidence scoring |
| **Risks** | API failures, rate limiting from external services, data quality issues, timeout handling |
| **Learning Objectives** | Implement the connector contract (ConnectorResult interface); handle API timeouts; assign confidence scores; graceful error handling |

### Files to Read

| # | File | Lines | Complexity | What It Teaches |
|---|------|-------|------------|-----------------|
| 1 | `src/connectors/types.ts` | 20 | ⭐ | The contract ALL connectors must follow |
| 2 | `src/connectors/index.ts` | 17 | ⭐ | Registry pattern — one import gets all connectors |
| 3 | `src/connectors/ipinfo.ts` | 46 | ⭐ | Simplest connector — single API call, single result |
| 4 | `src/connectors/visualIntel.ts` | ~65 | ⭐ | Small, focused connector |
| 5 | `src/connectors/peopleSearch.ts` | ~45 | ⭐ | Simple search pattern |
| 6 | `src/connectors/securityTrails.ts` | ~90 | ⭐⭐ | API key authentication pattern |
| 7 | `src/connectors/interpolSearch.ts` | ~110 | ⭐⭐ | Law enforcement data pattern |
| 8 | `src/connectors/whatsMyName.ts` | ~130 | ⭐⭐ | Username enumeration pattern |
| 9 | `src/connectors/cryptoSearch.ts` | ~190 | ⭐⭐ | Blockchain/crypto intelligence |
| 10 | `src/connectors/darkWebSearch.ts` | ~185 | ⭐⭐ | Dark web intelligence (simulated) |

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CONNECTOR PATTERN                      │
│                                                            │
│  Every connector follows the same contract:                │
│                                                            │
│  INPUT                     OUTPUT                          │
│  ──────                    ──────                          │
│  query: string      →     ConnectorResult {                │
│  (email, IP,               connectorType: string,          │
│   username,                query: string,                   │
│   domain, etc.)            results: SearchResult[],         │
│                            generatedAt: ISO8601 string      │
│                          }                                  │
│                                                            │
│  Each SearchResult has:                                     │
│  ├─ title           (what was found)                        │
│  ├─ url             (source link)                           │
│  ├─ description     (human-readable summary)                │
│  ├─ category        (e.g., 'geolocation', 'social')        │
│  ├─ platform        (e.g., 'IPinfo', 'GitHub')             │
│  ├─ confidenceScore (0.0 to 1.0 — how reliable)            │
│  ├─ confidenceLabel ('HIGH', 'MEDIUM', 'LOW', 'VERIFIED')  │
│  └─ metadata        (raw API response for deep analysis)    │
└──────────────────────────────────────────────────────────┘

Example: ipinfo.ts flow
──────────────────────────

  Input: "8.8.8.8"
        │
        ▼
  ┌─ Timeout Setup ─┐
  │ AbortController  │  ← "If no response in 8 seconds, abort"
  │ 8000ms limit     │
  └────────┬─────────┘
           │
           ▼
  ┌─ API Call ───────────────────────┐
  │ GET https://ipinfo.io/8.8.8.8   │
  │ (with API token if available)    │
  └────────┬─────────────────────────┘
           │
           ▼
  ┌─ Process Response ──────────────┐
  │ Extract: city, region, country  │
  │ Extract: ISP/org, timezone      │
  │ Extract: coordinates            │
  │ Assign: confidenceScore = 0.90  │
  │ Assign: confidenceLabel = 'HIGH'│
  └────────┬────────────────────────┘
           │
           ▼
  Output: ConnectorResult {
    connectorType: 'ipinfo',
    query: '8.8.8.8',
    results: [{ title: 'IP Intelligence — 8.8.8.8', ... }],
    generatedAt: '2026-06-18T...'
  }
```

### 📓 Notebook Checkpoint

1. **The Connector Contract:**
   ```
   EVERY connector, no matter how complex, returns ConnectorResult:
   { connectorType, query, results[], generatedAt }

   Each result in results[] is a SearchResult:
   { title, url, description, category, platform, confidenceScore, confidenceLabel, metadata }
   ```

2. **AbortController Pattern (ipinfo.ts lines 13-14):**
   ```
   const controller = new AbortController();
   const id = setTimeout(() => controller.abort(), 8000);
   const res = await fetch(url, { signal: controller.signal });

   Translation:
   "Start a timer. If the API doesn't respond in 8 seconds, cancel the request."
   This prevents one slow API from blocking the entire scan.
   ```

3. **Confidence Scoring:**
   ```
   0.90 = HIGH  → IPinfo is a reliable, established service
   0.70 = MEDIUM → Public data, might be outdated
   0.50 = LOW   → Unverified, could be wrong
   1.00 = VERIFIED → Confirmed by multiple sources
   ```

4. **Graceful Failure Pattern:**
   ```
   try { ... } catch { /* skip */ }
   return { results: [] } // Never crashes — returns empty results

   WHY: If IPinfo is down, the scan continues with other connectors.
   A failing connector must NEVER crash the orchestrator.
   ```

5. **Registry Pattern (index.ts):**
   ```
   export * from './usernameSearch';
   export * from './domainSearch';
   // ... all connectors

   ANY file can: import { ipinfo, domainSearch } from '@/connectors';
   ONE import point for ALL connectors = clean architecture
   ```

### Self-Test Questions

1. Why does every connector return `ConnectorResult` instead of its own custom type?
2. What happens if `fetch()` takes longer than 8 seconds in ipinfo.ts?
3. Why is `confidenceScore` a number (0.0-1.0) instead of just a label?
4. Why does `index.ts` use `export *` instead of named exports?
5. If you were building a new connector for "LinkedIn public profiles", what would your function signature look like?

**⏱ Estimated Time: 1.5 hours**

---

## Module 6: Connector Engine — Complex Connectors

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Study the large, production-grade connectors that handle multi-source aggregation, scraping, and complex data processing |
| **Inputs** | Module 5 (simple connectors), Module 2 (TypeScript) |
| **Outputs** | Understanding of multi-source orchestration within a single connector, advanced error handling, data aggregation |
| **Technologies** | DOM parsing, Google dorking, breach databases, reverse image search, multi-API aggregation |
| **Risks** | External API changes break connectors; rate limiting from aggressive sources; false positive data pollution |
| **Learning Objectives** | Read complex async code; understand multi-step data pipelines; implement robust error handling across multiple API calls |

### Files to Read (Ordered by Complexity)

| # | File | Size | What Makes It Complex |
|---|------|------|----------------------|
| 1 | `domainSearch.ts` | 5.6KB | Multi-API: DNS + WHOIS + SecurityTrails |
| 2 | `exifMetadata.ts` | 3.2KB | Image metadata extraction |
| 3 | `ecosystemSearch.ts` | 8KB | Cross-platform correlation |
| 4 | `registrationScout.ts` | 11KB | Service registration detection |
| 5 | `usernameSearch.ts` | 13KB | 25+ platform enumeration |
| 6 | `reverseImage.ts` | 15KB | Multi-engine image search |
| 7 | `siphonHub.ts` | 17KB | Aggregation hub pattern |
| 8 | `googleDorks.ts` | 20KB | Google hacking patterns |
| 9 | `breachSearch.ts` | 23KB | Most complex — multi-provider breach lookup |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│           COMPLEX CONNECTOR: breachSearch.ts              │
│           (23KB — the most sophisticated connector)       │
│                                                           │
│  Input: email or username                                 │
│         │                                                 │
│         ▼                                                 │
│  ┌─ Provider Layer ──────────────────────────────────┐    │
│  │                                                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │  HIBP    │ │ Dehashed │ │ LeakCheck│  ...more  │    │
│  │  │  API     │ │  API     │ │  API     │          │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘          │    │
│  │       │             │             │               │    │
│  │       ▼             ▼             ▼               │    │
│  │  ┌─ Normalization Layer ─────────────────────┐    │    │
│  │  │  Different APIs return different formats   │    │    │
│  │  │  → Normalize ALL into SearchResult[]       │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  │                    │                              │    │
│  │                    ▼                              │    │
│  │  ┌─ Deduplication ──────────────────────────┐    │    │
│  │  │  Same breach found by multiple providers  │    │    │
│  │  │  → Keep only unique entries               │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  │                    │                              │    │
│  │                    ▼                              │    │
│  │  ┌─ Confidence Scoring ─────────────────────┐    │    │
│  │  │  HIBP confirmed → 0.95 (VERIFIED)         │    │    │
│  │  │  Dehashed match → 0.80 (HIGH)             │    │    │
│  │  │  Unconfirmed   → 0.50 (MEDIUM)            │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  └───────────────────────────────────────────────┘    │
│                                                           │
│  Output: ConnectorResult with ALL breach findings          │
└─────────────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

1. **"Start small, read big."** You studied ipinfo.ts (46 lines). Now breachSearch.ts (23KB) uses the SAME pattern but with 10x more complexity. The ConnectorResult contract is identical.

2. **Multi-provider aggregation pattern:**
   ```
   Step 1: Call Provider A (might fail)
   Step 2: Call Provider B (might fail)
   Step 3: Call Provider C (might fail)
   Step 4: Merge all successful results
   Step 5: Deduplicate
   Step 6: Score confidence
   Step 7: Return unified ConnectorResult
   ```

3. **Google Dorking (googleDorks.ts):**
   ```
   Google "dorks" = specialized search queries
   Example: site:pastebin.com "target@email.com"
   → Finds pastes containing the target's email
   This is 100% legal (using Google's public search engine)
   but extremely powerful for OSINT
   ```

4. **Username enumeration (usernameSearch.ts):**
   ```
   Checks 25+ platforms: GitHub, Reddit, Twitter, Instagram, etc.
   For each: HTTP HEAD request to check if profile exists
   Fast because: HEAD requests don't download page content
   ```

### Self-Test Questions

1. Why does breachSearch check multiple providers instead of just one?
2. What is "deduplication" and why is it necessary when aggregating from multiple sources?
3. How does googleDorks.ts avoid getting blocked by Google?
4. Why does usernameSearch use HEAD requests instead of GET?
5. If you needed to add a new breach provider, what would you need to implement?

**⏱ Estimated Time: 2 hours (read 3-4 connectors in depth, skim the rest)**

---

## Module 7: AI Intelligence Layer

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand how raw connector data is transformed into human-readable intelligence by an AI model |
| **Inputs** | Module 5-6 (connectors produce data), Module 2 (TypeScript) |
| **Outputs** | Understanding of LLM integration, prompt engineering, model fallback chains, structured output extraction |
| **Technologies** | Google Gemini API (raw fetch), prompt engineering, JSON extraction from AI output, model fallback strategy |
| **Risks** | API quota exhaustion; malformed AI output crashes parsing; prompt injection from user data; cost overruns |
| **Learning Objectives** | Call an LLM API via raw HTTP; design system prompts; implement model fallback chains; extract structured data from AI text |

### Files to Read

| # | File | Lines | What It Teaches |
|---|------|-------|-----------------|
| 1 | `src/lib/ai.ts` | 124 | Complete AI synthesis pipeline |

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    AI SYNTHESIS PIPELINE                       │
│                    (src/lib/ai.ts)                             │
│                                                                │
│  Input: investigationTitle + evidenceItems[]                   │
│         │                                                      │
│         ▼                                                      │
│  ┌─ Guard Checks ────────────────────────────────────────┐     │
│  │  Is API key present?                                   │     │
│  │  ├─ NO → Return fallback dossier (graceful failure)    │     │
│  │  └─ YES → Continue                                     │     │
│  │                                                        │     │
│  │  Are there any evidence items?                         │     │
│  │  ├─ ZERO → Return "no digital footprint" message       │     │
│  │  └─ >0   → Continue to synthesis                       │     │
│  └────────────────────────────────────────────────────────┘     │
│         │                                                      │
│         ▼                                                      │
│  ┌─ Evidence Preparation ────────────────────────────────┐     │
│  │  Take first 30 evidence items (cost optimization)      │     │
│  │  Format: "- [HIGH Confidence (90%)] Title: Content"    │     │
│  │  Prepend confidence labels for AI to weigh             │     │
│  └────────────────────────────────────────────────────────┘     │
│         │                                                      │
│         ▼                                                      │
│  ┌─ System Prompt (The AI's "personality") ──────────────┐     │
│  │  "You are Aletheia — a high-fidelity intelligence      │     │
│  │   orchestration engine."                                │     │
│  │                                                        │     │
│  │  5 Internal Agent Specializations:                     │     │
│  │  ├─ BioAgent:     Biography & identity                 │     │
│  │  ├─ NetworkAgent: Social connections                    │     │
│  │  ├─ GeoAgent:     Location intelligence                │     │
│  │  ├─ InfraAgent:   Technical infrastructure             │     │
│  │  └─ LeakAgent:    Vulnerability & compromise           │     │
│  │                                                        │     │
│  │  3 Extraction Commands:                                │     │
│  │  ├─ [SIGINT_GEO]  → Structured location JSON           │     │
│  │  ├─ [VITALITY_AUDIT] → Real vs synthetic assessment    │     │
│  │  └─ [ASSOCIATES]  → Linked persons/entities            │     │
│  └────────────────────────────────────────────────────────┘     │
│         │                                                      │
│         ▼                                                      │
│  ┌─ Model Fallback Chain ────────────────────────────────┐     │
│  │  Try: gemini-1.5-flash    ← Fast, cheap, primary       │     │
│  │   ↓ (if fails)                                         │     │
│  │  Try: gemini-1.5-pro      ← More capable, backup       │     │
│  │   ↓ (if fails)                                         │     │
│  │  Try: gemini-pro          ← Legacy fallback             │     │
│  │   ↓ (all fail)                                         │     │
│  │  Return: fallback dossier  ← Never crash                │     │
│  └────────────────────────────────────────────────────────┘     │
│         │                                                      │
│         ▼                                                      │
│  ┌─ API Call (Raw fetch, NOT SDK) ───────────────────────┐     │
│  │  POST https://generativelanguage.googleapis.com/...    │     │
│  │  Body: { contents: [{ role: "user", parts: [...] }],   │     │
│  │         generationConfig: { temperature: 0.3 } }       │     │
│  │                                                        │     │
│  │  WHY raw fetch? "Using raw native fetch to completely   │     │
│  │  bypass buggy SDK fetch wrappers" (line 78 comment)     │     │
│  └────────────────────────────────────────────────────────┘     │
│         │                                                      │
│         ▼                                                      │
│  Output: Markdown intelligence dossier                         │
│  + Embedded JSON blocks (geo, vitality, associates)            │
└──────────────────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

1. **"Raw fetch over SDK"** — Line 78 comment explains why: the Google SDK's fetch wrapper had bugs. Using raw `fetch()` gives full control. This is a real-world engineering lesson: SDKs can break; raw HTTP always works.

2. **Model Fallback Chain Pattern:**
   ```
   models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
   for (const model of models) {
     try { call(model); break; }  // Success → stop trying
     catch { continue; }          // Fail → try next model
   }
   ```
   **Write this pattern down — it's used everywhere in production AI systems.**

3. **Temperature = 0.3** — Low temperature means more deterministic, factual output. High temperature (0.9+) = creative, varied. For intelligence analysis, we want facts, not creativity.

4. **Evidence limit = 30 items** — Line 27: `.slice(0, 30)`. Only sends first 30 pieces of evidence to AI. WHY? Cost. More tokens = more money. 30 items is enough for good synthesis.

5. **Embedded structured data in free text:**
   ```
   The AI returns markdown text, but ALSO embeds JSON blocks:
   [SIGINT_GEO: {"locations": [...]}]
   [VITALITY_AUDIT: {"verdict": "Real", ...}]
   [ASSOCIATES: {"associates": [...]}]

   The frontend later parses these out of the text.
   This is a common pattern: "structured data extraction from LLM output"
   ```

6. **Graceful degradation priority:**
   ```
   1. No API key? → Return helpful error message (not crash)
   2. Zero evidence? → Return "no footprint found" message
   3. API returns bad data? → Try next model
   4. ALL models fail? → Return fallback dossier
   5. Catastrophic error? → catch → return fallback
   
   FIVE levels of protection. The app NEVER crashes from AI failure.
   ```

### Self-Test Questions

1. Why does the code use `fetch()` directly instead of Google's official SDK?
2. What does `temperature: 0.3` mean and why was it chosen?
3. Why limit evidence to 30 items? What if there are 200 findings?
4. How does the model fallback chain work? What happens if all 3 models fail?
5. What is a "system prompt" and why does Aletheia's prompt define 5 agent specializations?
6. What is prompt injection and how could user-controlled data in the evidence potentially exploit the system prompt?

**⏱ Estimated Time: 1.5 hours**

---

## Module 8: The Correlation & Graph Engine

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the core intellectual property of the product: entity correlation and graph visualization |
| **Inputs** | Module 5-7 (connectors produce data, AI synthesizes it) |
| **Outputs** | Understanding of entity resolution, graph theory basics, visual correlation, the investigation orchestration |
| **Technologies** | Graph visualization, entity resolution, React state management, API route orchestration |
| **Risks** | False correlations mislead investigators; graph performance degrades with large datasets; incorrect entity linking |
| **Learning Objectives** | Understand entity resolution; read graph visualization code; understand investigation lifecycle; trace full request flow |

### Files to Read

| # | File | What It Teaches |
|---|------|-----------------|
| 1 | `src/app/api/investigations/` (dir) | The orchestrator: how scans are triggered, run, and stored |
| 2 | `src/app/api/search/` (dir) | How search queries are processed |
| 3 | `src/app/api/chat/` (dir) | AI chat interface for investigators |
| 4 | `src/components/dashboard/identity-graph.tsx` | Entity relationship visualization |
| 5 | `src/components/dashboard/investigation-graph.tsx` | Investigation-level graph view |
| 6 | `src/components/dashboard/facial-analysis.tsx` | Visual intelligence (34KB — most complex component) |

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   CORRELATION & GRAPH ENGINE                      │
│                                                                    │
│  ┌─ Entity Resolution ──────────────────────────────────────┐     │
│  │                                                           │     │
│  │  Raw connector data contains overlapping clues:           │     │
│  │                                                           │     │
│  │  breachSearch found: "john.doe@gmail.com"                 │     │
│  │  usernameSearch found: "johndoe" on GitHub, Reddit        │     │
│  │  domainSearch found: "johndoe.dev" registered by "J.Doe"  │     │
│  │  reverseImage found: profile photo matches LinkedIn       │     │
│  │                                                           │     │
│  │  Question: Are these the SAME person?                     │     │
│  │                                                           │     │
│  │  Entity Resolution = the process of deciding:             │     │
│  │  "john.doe@gmail.com" ←→ "johndoe" (GitHub)              │     │
│  │  are the SAME entity with HIGH confidence                 │     │
│  │                                                           │     │
│  │  This is the CORE VALUE of the product.                   │     │
│  │  Search engines find data. OpenVector CORRELATES it.      │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─ Graph Visualization ────────────────────────────────────┐     │
│  │                                                           │     │
│  │        [Email: john@gmail.com]                             │     │
│  │             /        \                                     │     │
│  │            /          \                                    │     │
│  │  [GitHub: johndoe]  [Domain: johndoe.dev]                  │     │
│  │       |                    |                               │     │
│  │       |                    |                               │     │
│  │  [Reddit: johndoe]  [LinkedIn: John Doe]                   │     │
│  │       \                  /                                 │     │
│  │        \                /                                  │     │
│  │      [Breach: Adobe 2013]                                  │     │
│  │                                                           │     │
│  │  Nodes = entities (email, username, domain, etc.)         │     │
│  │  Edges = relationships (same person, linked account)       │     │
│  │  Weight = confidence (0.0 to 1.0)                         │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                    │
│  ┌─ Investigation Lifecycle ────────────────────────────────┐     │
│  │                                                           │     │
│  │  1. User creates investigation (title, subject details)   │     │
│  │  2. User triggers scan (POST /api/investigations/[id]/scan)│    │
│  │  3. Orchestrator fires ALL connectors in parallel          │     │
│  │  4. Each connector returns ConnectorResult                │     │
│  │  5. Results stored as Evidence rows in database           │     │
│  │  6. AI synthesis called with all evidence                 │     │
│  │  7. Dossier stored as Report in database                  │     │
│  │  8. UI polls for updates → displays results               │     │
│  └───────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

1. **"The graph IS the product."**
   ```
   Anyone can search Google. Anyone can check HIBP.
   What makes OpenVector valuable is CORRELATION:
   - "This email was in 3 breaches"
   - "This username exists on 7 platforms"
   - "These are probably the same person"
   - "Here's the confidence score"
   ```

2. **Entity Resolution — what you need to understand:**
   ```
   - Fuzzy matching: "johndoe" ≈ "john.doe" ≈ "john_doe"
   - Confidence scoring: How sure are we these are the same person?
   - Graph theory: Nodes (entities) + Edges (relationships) + Weights (confidence)
   - False positive risk: Correlating wrong entities = misleading intelligence
   ```

3. **The Investigation Lifecycle:**
   ```
   CREATE → SCAN → COLLECT → SYNTHESIZE → DISPLAY → ARCHIVE
   
   Each step maps to code:
   CREATE: POST /api/investigations (creates DB row)
   SCAN:   POST /api/investigations/[id]/scan (triggers connectors)
   COLLECT: Connectors → Evidence table
   SYNTHESIZE: AI → Report table
   DISPLAY: Dashboard components
   ARCHIVE: Status change to "closed"
   ```

### Self-Test Questions

1. What is "entity resolution" and why is it the core value of this product?
2. If username "john123" is found on GitHub AND Twitter, what confidence score would you assign that they're the same person?
3. What is a graph node? What is a graph edge? Give examples from OpenVector.
4. Why are connectors run in parallel instead of sequentially during a scan?
5. What is the difference between the `Evidence` table and the `Report` table?

**⏱ Estimated Time: 2 hours**

---

## Module 9: Database Design & Multi-Tenancy

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand the complete data model, relationships, and multi-tenant isolation |
| **Inputs** | Module 4 (prisma.ts), Module 8 (investigation lifecycle) |
| **Outputs** | Ability to read the schema, understand relationships, write Prisma queries, understand data isolation |
| **Technologies** | Prisma ORM, PostgreSQL, Supabase, Row-Level Security, database indexes, cascade deletes |
| **Risks** | Data leaks between users; N+1 queries destroying performance; cascade delete accidents; schema migrations in production |
| **Learning Objectives** | Read Prisma schema; understand 1:N relationships; understand cascade deletes; write efficient queries; understand indexing |

### Files to Read

| # | File | Lines | What It Teaches |
|---|------|-------|-----------------|
| 1 | `prisma/schema.prisma` | 219 | THE complete data model — every table, every relationship |
| 2 | `src/app/api/auth/` (dir) | varies | Auth routes that create/validate users |

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA MAP                         │
│                    (9 tables, fully relational)                │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                         USER                             │   │
│  │  id, email, role, plan, stripeCustomerId,                │   │
│  │  facialAiCredits, investigationsCount,                   │   │
│  │  hasLifetimeAccess                                       │   │
│  └───────┬──────────┬──────────┬─────────┬──────────────┘   │
│          │          │          │         │                    │
│     HAS MANY   HAS MANY  HAS MANY  HAS MANY                │
│          │          │          │         │                    │
│          ▼          │          │         ▼                    │
│  ┌──────────────┐   │          │  ┌──────────────┐           │
│  │INVESTIGATION │   │          │  │  WATCHLIST    │           │
│  │              │   │          │  │              │           │
│  │ title,       │   │          │  │ targetType,  │           │
│  │ status,      │   │          │  │ targetValue, │           │
│  │ subject*     │   │          │  │ lastChecked  │           │
│  └──┬───┬───┬───┘   │          │  └──────┬───────┘           │
│     │   │   │        │          │         │                   │
│     │   │   │        │          │    HAS MANY                 │
│     │   │   │        │          │         │                   │
│     ▼   │   ▼        ▼          ▼         ▼                   │
│  ENTITY │ EVIDENCE SEARCHLOG NOTIFICATION WATCHLIST_ALERT     │
│         │                                                     │
│         ▼                                                     │
│      REPORT                                                   │
│                                                               │
│  Key Relationships:                                           │
│  User ──1:N──> Investigation ──1:N──> Entity                  │
│  User ──1:N──> Investigation ──1:N──> Evidence                │
│  User ──1:N──> Investigation ──1:N──> Report                  │
│  User ──1:N──> Investigation ──1:N──> SearchLog               │
│  User ──1:N──> Notification                                   │
│  User ──1:N──> Feedback                                       │
│  User ──1:N──> Watchlist ──1:N──> WatchlistAlert              │
│                                                               │
│  CASCADE DELETES:                                             │
│  Delete User → Deletes ALL investigations, evidence, etc.     │
│  Delete Investigation → Deletes entities, evidence, reports   │
│  Delete Watchlist → Deletes watchlist alerts                  │
└──────────────────────────────────────────────────────────────┘
```

### 📓 Notebook Checkpoint

1. **The 9 Tables:**
   ```
   1. User          — who uses the system
   2. Investigation  — a search/case created by a user
   3. Entity         — a discovered identity element (email, username, IP)
   4. Evidence       — a finding from a connector (with provenance)
   5. Report         — AI-generated dossier
   6. SearchLog      — audit trail of searches
   7. Notification   — in-app alerts
   8. Feedback       — user feedback
   9. Watchlist      — ongoing monitoring targets
   10. WatchlistAlert — alerts from monitored targets
   ```

2. **Evidence table is the richest table (lines 104-135):**
   ```
   Standard fields: title, content, sourceUrl, tags, confidenceScore
   Provenance fields:
   - sourceArchiveUrl  → permanent backup (IPFS/S3)
   - screenshotUrl     → visual snapshot
   - captureTimestamp   → when was this captured
   - provenanceHash     → SHA-256 hash (proves immutability)
   - provenanceSourceId → parent evidence (graph link!)
   - metadata          → flexible JSON storage
   ```

3. **Index strategy:**
   ```
   @@index([userId])          → Fast lookups by user
   @@index([investigationId]) → Fast lookups by investigation
   @@index([provenanceHash])  → Fast lookups by hash
   @@unique([investigationId, provenanceHash]) → No duplicate evidence per investigation
   ```

4. **Cascade delete behavior:**
   ```
   onDelete: Cascade → "If parent dies, children die too"
   onDelete: SetNull → "If parent dies, set reference to NULL (orphan)"
   
   User deleted → ALL their data is deleted (GDPR friendly!)
   Investigation deleted → evidence, entities, reports deleted
   SearchLog → onDelete: SetNull (keep the log even if investigation is deleted)
   ```

### Self-Test Questions

1. If you delete a User, what happens to their Investigations? Their Evidence?
2. Why does Evidence have a `provenanceHash` field? What is it used for?
3. What does `@@map("evidence")` do? (Maps the model name to the actual table name in PostgreSQL)
4. Why is `[investigationId, provenanceHash]` marked as `@@unique`?
5. What is the difference between `@default(now())` and `@updatedAt`?
6. Why does the User model have BOTH `stripeCustomerId` AND `lemonSqueezyCustomerId`?

**⏱ Estimated Time: 1 hour**

---

## Module 10: Dashboard & UI Components

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand how data flows from the backend into a visual interface the user interacts with |
| **Inputs** | Module 8 (investigation flow), Module 9 (data model) |
| **Outputs** | Understanding of React/Next.js component patterns, server vs client components, data fetching, state management |
| **Technologies** | React 19, Next.js App Router, Radix UI, Framer Motion, Recharts, TailwindCSS |
| **Risks** | Slow rendering with large datasets; hydration mismatches; accessibility failures; mobile responsiveness |
| **Learning Objectives** | Read React components; understand server vs client components; understand data fetching patterns; implement UI changes |

### Files to Read (Start with structure, then components)

| # | File | What It Teaches |
|---|------|-----------------|
| 1 | `src/app/layout.tsx` | Root layout, providers, global setup |
| 2 | `src/app/globals.css` | Global styles, CSS variables |
| 3 | `src/app/dashboard/` (dir) | Dashboard pages |
| 4 | `src/components/dashboard/scan-button.tsx` | Small, focused component |
| 5 | `src/components/dashboard/dashboard-client.tsx` | Main dashboard view (16KB) |
| 6 | `src/components/dashboard/evidence-tab.tsx` | Evidence display (30KB) |
| 7 | `src/components/dashboard/live-terminal.tsx` | Real-time scan output |
| 8 | `src/lib/investigation-polling.ts` | Real-time update mechanism |
| 9 | `src/lib/themes.ts` | Theme system |

### 📓 Notebook Checkpoint

1. **Server vs Client Components (Next.js App Router):**
   ```
   Server Component (default): Runs on server, no useState/useEffect
   Client Component: Has "use client" at top, can use React hooks
   
   Rule: Use server components for data fetching, client for interactivity
   ```

2. **34 dashboard components** — this is a mature, production-grade UI. Key ones:
   ```
   dashboard-client.tsx  → Main dashboard view
   evidence-tab.tsx      → Shows findings from connectors
   identity-graph.tsx    → Entity relationship visualization
   facial-analysis.tsx   → AI-powered facial analysis (34KB!)
   live-terminal.tsx     → Real-time scan progress
   command-palette.tsx   → Power-user keyboard shortcuts
   chain-of-custody.tsx  → Forensic evidence trail
   ```

### Self-Test Questions

1. What does `"use client"` at the top of a file mean in Next.js?
2. How does the dashboard know when a scan is complete? (polling vs WebSocket)
3. Why is evidence-tab.tsx 30KB? What makes it so complex?
4. What is a "command palette" and why do power users love them?

**⏱ Estimated Time: 2 hours**

---

## Module 11: SaaS & Business Logic

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand authentication, billing, subscriptions, and the business model |
| **Inputs** | Module 9 (User model with plan, credits), Module 3 (middleware auth) |
| **Outputs** | Understanding of SaaS architecture: auth flows, payment processing, quota enforcement |
| **Technologies** | Supabase Auth, Stripe, LemonSqueezy, Gumroad, webhooks, quota management |
| **Risks** | Payment failures; subscription state inconsistency; quota bypass; data leaks between tenants |
| **Learning Objectives** | Trace auth flow end-to-end; understand webhook security; implement quota enforcement; understand multi-payment-provider strategy |

### Files to Read

| # | File/Dir | What It Teaches |
|---|----------|-----------------|
| 1 | `src/app/api/auth/` | Auth routes |
| 2 | `src/app/api/billing/` | Billing logic |
| 3 | `src/app/api/checkout/` | Payment processing |
| 4 | `src/app/api/webhooks/` | External service callbacks |
| 5 | `src/app/api/user/` | User management |
| 6 | `src/app/api/admin/` | Admin operations |
| 7 | `src/app/api/notifications/` | In-app alerts |
| 8 | `src/app/api/watchlists/` | Monitoring targets |
| 9 | `src/app/api/feedback/` | User feedback |

### 📓 Notebook Checkpoint

1. **Multi-payment-provider strategy:**
   ```
   User model has: stripeCustomerId, lemonSqueezyCustomerId, gumroadCustomerId
   WHY three? Don't depend on a single payment provider.
   If Stripe bans your account (common in security/OSINT), you have fallbacks.
   ```

2. **Plan tiers:** `free`, `pro`, `lifetime`
   - Free: limited investigations, limited facial AI credits (5)
   - Pro: more resources
   - Lifetime: `hasLifetimeAccess: true` — one-time purchase

**⏱ Estimated Time: 1.5 hours**

---

## Module 12: Error Handling, Testing & DevOps

### Module Documentation

| Field | Detail |
|-------|--------|
| **Purpose** | Understand debugging, diagnostics, testing, and deployment |
| **Inputs** | All previous modules |
| **Outputs** | Ability to debug production issues, write tests, deploy safely |
| **Technologies** | Vercel, Sentry, diagnostic endpoints, migration scripts |
| **Risks** | Undetected errors in production; data migration failures; deployment rollback failures |
| **Learning Objectives** | Set up error tracking; write tests; deploy to Vercel; manage environment variables |

### Files to Read

| # | File/Dir | What It Teaches |
|---|----------|-----------------|
| 1 | `src/app/api/system/` | System health checks |
| 2 | `src/app/api/debug/` | Debug endpoints |
| 3 | `src/app/api/diagnostic/` | Diagnostic tools |
| 4 | `src/app/api/migrate/` | Data migrations |
| 5 | `scripts/` (dir) | Utility scripts |
| 6 | `vercel.json` | Deployment config |

**⏱ Estimated Time: 1 hour**

---

## Weekly Schedule

| Week | Modules | Focus |
|------|---------|-------|
| Week 1 | 0, 1, 2, 3 | Ethics, project anatomy, TypeScript, middleware |
| Week 2 | 4, 5 | Infrastructure, simple connectors |
| Week 3 | 6, 7 | Complex connectors, AI layer |
| Week 4 | 8, 9 | Graph engine, database design |
| Week 5 | 10, 11 | Dashboard UI, SaaS/billing |
| Week 6 | 12 | Testing, deployment, E2E validation |

---

## Resources

- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- Supabase docs: https://supabase.com/docs
- TypeScript handbook: https://www.typescriptlang.org/docs/handbook/
- Vercel deployment: https://vercel.com/docs
- OSINT Framework: https://osintframework.com/

---

**This roadmap was written by the architect who built this product. Every file reference, every line number, every architecture diagram reflects the actual codebase as of June 2026. Let's build.**
