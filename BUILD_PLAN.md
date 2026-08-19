# BUILD_PLAN.md — ROZE Mobiles & Computers Storefront

My interpretation of the brief, the architecture I'm committing to, and the places
where I think the brief is wrong. Written before any code.

---

## 1. What I read

| Source | Verdict |
|---|---|
| `ref/roze-brand-identity.html` | Read in full (the 102KB line 226 is the base64 logo, stripped for reading). 7 tokens, 3 font families, 60/30/10 rule, contrast caveat on `#66C0C9`, logo-on-white failure mode, voice rules, 5 service categories, confirmed contact block. Treated as law. |
| `ref/actionjoclonereport.html` | Read in full. Taking: page families, URL patterns, filter/sort model, the "arbitrary category depth" requirement, the Arabic-search and RTL-QA warnings from §7. Taking nothing else — no copy, no naming, no visual language. |
| `ref/RozeLogo.png` | 2400×1338 transparent PNG, white circle baked in. Only logo asset. |

## 2. Architecture I'm committing to

```
app/
  [locale]/                    ar (no prefix, default) | en (/en)
    page.tsx                   home
    category/[...slug]/        arbitrary depth
    product/[slug]/
    brands/[slug]/ , brands-list/
    search/ , offers/ , maintenance/ , track/
    cart/ , checkout/ , checkout/confirmation/[ref]/
    (static)/about|faq|how-to-buy|contact|warranty|privacy/
components/ui/                 primitives (C1)
components/layout/             header, megamenu, footer, mobilenav (C2)
components/commerce/           product card, gallery, price, filters (C3)
lib/
  arabic.ts                    normalization + transliteration (§7 of brief)
  search/                      SearchProvider interface + FuseProvider
  payments/                    PaymentProvider interface + whatsapp | cod
  hours.ts                     Asia/Amman open-now
  money.ts                     JOD 3-decimal formatting
  site.ts                      single source for business facts + env URLs
prisma/schema.prisma
messages/ar.json | en.json
```

**Key decision: every seam the brief calls out as "later" is an interface today.**
`PaymentProvider`, `SearchProvider`, and the catalog data access layer are the three
swap points. Adding HyperPay is a fourth file in `lib/payments/`, not a refactor.

**Business facts live in exactly one file** (`lib/site.ts`), typed, imported by the
footer, contact page, JSON-LD, WhatsApp links, and the hours badge. No phone number
is ever typed twice.

## 3. Where I disagree with the brief

I'd rather say this now than after building it.

### 3.1 SQLite + "deploy target Vercel" is a contradiction — this one matters

Vercel's filesystem is ephemeral and read-only at runtime. A file-backed SQLite
database cannot persist orders there. Since Phase 1's *entire* order path terminates
in a COD record written to the DB, deploying this to Vercel as specified would
silently lose every order.

**What I'm doing:** building on SQLite via Prisma with an env-driven `DATABASE_URL`,
which is correct for development and for any Node host with a persistent volume
(Hetzner, Railway, Fly, a VPS). `EXTENDING.md` will document the one-line switch to
Postgres/Turso, and `HANDOFF.md` will state plainly that **Vercel requires that
switch before taking real orders.** I am not silently choosing a different DB than
you asked for — I'm flagging the constraint and shipping the swap path.

### 3.2 Tailwind v4 has no `tailwind.config.ts`

A1's acceptance criteria name `tailwind.config.ts`. Tailwind v4 is CSS-first: tokens
go in `@theme` inside `globals.css`. Producing a JS config would be writing a v3
artifact into a v4 project. **I'm putting all tokens in `app/globals.css` under
`@theme`** and treating that as satisfying A1. Flagging it rather than quietly
diverging.

### 3.3 Client-side Fuse.js does not survive the client's growth

Fine for a 48-SKU demo. At ~1500 SKUs the JSON payload and the index build become a
real cost on mobile over Jordanian 4G. I'll build it, because it's right for Phase 1
and needs no infrastructure — but behind a `SearchProvider` interface so a server
route or Meilisearch is a drop-in. Documented in `EXTENDING.md`.

### 3.4 "Lighthouse ≥ 90" is not a gate I can honestly self-certify

I can audit contrast programmatically, verify keyboard paths, check `prefers-reduced-motion`,
confirm image sizing and font-display, and inspect the production bundle. I cannot
produce a trustworthy Lighthouse number from this environment against a local dev
build. **F3 will report what I actually measured and will not claim a score I didn't
run.** If a number is required for sign-off, it should be run against the deployed
URL after the domain lands.

### 3.5 Three unconfirmed phone numbers, one WhatsApp button

The brand guide itself flags this as open (§08, item 03). The WhatsApp button is
going to be the most-clicked control on the site, so guessing is expensive. I'm
routing **sales → showroom `+962 79 900 0301`** (the Google-verified one) and
**maintenance → `+962 796 003040`**, both as single env vars, and putting it at the
top of `HANDOFF.md` as a client question. §E2's acceptance criterion ("routes to a
service number, not the showroom number") is satisfied by that split.

### 3.6 A rate limiter without Redis is per-instance

`/track`'s rate limit will be in-memory. That is genuinely effective on a single
Node process and genuinely useless behind multiple instances. Documented, not hidden.

### 3.7 Everything else in the brief I agree with

Especially: maintenance as a top-level peer, the `#1E6A74` text rule, the logo-on-dark
rule, Arabic normalization before indexing, and no card checkout in Phase 1. The
scope call in §2 of the brief is the right one.

## 4. Model assignment

Following the brief's policy. Opus: A1 design system, E1 cart/order architecture,
F4 design critique, and any twice-failed task. Haiku: seed data, i18n JSON, assets,
JSON-LD/SEO, offers page, static-page copy, handoff docs. Sonnet: everything else.

## 5. Verification stance

A subagent reporting success is a claim. Every task is verified by me against its
acceptance criteria: read the diff, run `npm run build`, run the linter, and for
visual tasks actually render the page in the browser and look at it. `npm run build`
runs at minimum every 5 completed tasks.

## 6. What Phase 1 deliberately will not contain

SMS OTP · card/BNPL gateways · courier APIs · multi-warehouse inventory · admin
panel with roles · user accounts and login · wishlist · coupons · reviews.
Extension points documented in `EXTENDING.md`.
