# ROZE Mobiles & Computers — Storefront

Bilingual (Arabic-first) e-commerce storefront for **Roze Mobiles & Computers**,
a phone/laptop retail and repair shop in Jubaiha, Amman.

Arabic is the default language and lives at `/`. English mirrors under `/en`.

---

## Requirements

- Node.js 20+ (developed on 24)
- npm 10+

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in the two database URLs
npm run db:deploy              # apply migrations
npm run db:seed                # load the demo catalogue
npm run dev
```

Open <http://localhost:3000> (Arabic) or <http://localhost:3000/en> (English).

The database is **Supabase Postgres (eu-central-1)**. Two connection strings are
required and they are not interchangeable — see `.env.example` for which is
which, and EXTENDING.md section 2 for why.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (Arabic search normalisation) |
| `npm run db:migrate` | Create + apply a migration after changing the schema |
| `npm run db:deploy` | Apply existing migrations (use this in CI/production) |
| `npm run db:seed` | Seed the demo catalogue (idempotent — safe to re-run) |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run db:reset` | **Destructive.** Drop everything, re-migrate, re-seed |

### Verification scripts

These back the project's quality gates. Run them after any significant change.

| Command | Checks |
|---|---|
| `node scripts/keycheck.mjs` | `messages/ar.json` and `en.json` have identical keys and matching ICU placeholders |
| `node scripts/verify-contrast.mjs` | Brand palette meets WCAG AA, and that teal still fails as small text (it must — see below) |
| `npx tsx scripts/verify-seo.mts` | Every JSON-LD block matches the confirmed business facts |
| `npx tsx scripts/verify-search.mts` | Arabic search: `ايفون` / `آيفون` / `iPhone` all find the same products |
| `npx tsx scripts/verify-service.mts` | Repair bookings route to the service line, orders to sales, Arabic survives URL encoding |
| `node scripts/audit-pages.mjs` | Walks every route in both locales: RTL correctness, alt text, one `h1`, canonical + hreflang, no physical CSS *(needs `npm run dev` running)* |
| `node scripts/generate-assets.mjs` | Regenerates favicons/OG image from `ref/RozeLogo.png` |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 ·
next-intl · Prisma + Supabase Postgres · Zustand · react-hook-form + zod ·
Fuse.js · lucide-react.

**Tailwind v4 is CSS-first — there is no `tailwind.config.ts`.** Every design
token lives in the `@theme` block at the top of `app/globals.css`.

## Project layout

```
app/[locale]/          Pages. Arabic at /, English at /en.
app/actions/           Server actions (checkout, service booking, order lookup)
components/ui/         Design-system primitives
components/commerce/   Product cards, price display, filters, the shared grid
components/layout/     Header, mega menu, footer, breadcrumb, mobile nav
components/home/       Homepage sections
lib/site.ts            EVERY confirmed business fact. Single source of truth.
lib/catalog.ts         All catalogue queries. Pages never touch Prisma directly.
lib/payments/          PaymentProvider interface + cod/whatsapp implementations
lib/arabic.ts          Arabic normalisation for search
messages/              ar.json (source of truth) + en.json
prisma/                Schema and seed
scripts/               Asset generation and the verification scripts above
ref/                   Brand guide, logo, distilled BRAND_FACTS.md
```

## Three rules this codebase enforces

These are checked by the verification scripts and by review. Breaking them is a
regression, not a style preference.

1. **No hex outside `app/globals.css`.** All colour comes from brand tokens.
2. **No physical direction CSS.** No `ml-`, `pr-`, `text-left`, `border-r-`.
   Logical only (`ms-`, `pe-`, `text-start`, `border-e`) — the site is RTL-first
   and must be identical in both directions.
3. **No hardcoded user-facing strings and no hardcoded business facts.** UI text
   comes from `messages/*.json`; addresses, phones and hours come from
   `lib/site.ts`.

### The contrast rule
Brand teal `#66C0C9` is **2.00:1 on paper and fails WCAG AA**. It is for fills,
wide backgrounds and large display type only. Any text under 24px on a light
ground uses `#1E6A74` (5.91:1, passes AA). `scripts/verify-contrast.mjs` asserts
both halves of this, including that teal still fails.

### The logo rule
`ref/RozeLogo.png` has a white circle baked into the artwork — on a white
background the mark visually breaks. The logo may only sit on ink `#060606`,
teal, or imagery. Use the `.logo-plate` class, which makes this impossible to
get wrong.

## Documentation

- **[CONTENT.md](CONTENT.md)** — adding products and editing page text, for non-developers
- **[EXTENDING.md](EXTENDING.md)** — payment gateways, Postgres, real photography, search at scale
- **[HANDOFF.md](HANDOFF.md)** — what was built, what was deferred, what the client still owes
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** — tokens, type scale, component rules
- **[BUILD_PLAN.md](BUILD_PLAN.md)** — architecture decisions and where they diverge from the original brief
