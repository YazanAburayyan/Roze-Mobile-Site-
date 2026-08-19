# HANDOFF.md — ROZE storefront

What was built, what was deliberately left out, and what the client still owes.

---

## 1. What exists

A complete bilingual storefront. Arabic is the default language at `/`; English
mirrors under `/en`. Every page works in both, right-to-left and left-to-right.

**Catalogue** — 4 top-level categories (phones, laptops, entertainment, and
maintenance as a genuine peer), nested subcategories to arbitrary depth,
17 brands, 48 demo products with real bilingual copy and realistic JOD prices.

**Pages** — home, category (filterable, any depth), product, brand, brand index,
search, offers, maintenance, cart, checkout, order confirmation, order tracking,
and six static pages (about, FAQ, how to buy, contact, warranty, privacy).
179 pages prerender at build.

**Checkout** — cart persisted in the browser, checkout form with Jordanian phone
validation and governorate selection, terminating in **cash on delivery** or a
**WhatsApp handoff** with the order pre-formatted. Orders are saved to the
database before either path runs, so an abandoned WhatsApp chat still leaves
ROZE an order and a callback number.

**Maintenance** — 10 real repair services with price ranges, turnaround times and
warranty periods, plus a booking form that routes to the service line.

**Order tracking** — at `/track`, no account needed: order reference plus phone.

**Arabic search** — `ايفون`, `آيفون` and `iPhone` all find the same products.
Diacritics, alef variants, ta-marbuta and Arabic-Indic digits are all folded.
27 unit tests cover it.

---

## 2. What the client still owes

Nothing here blocks development; all were flagged in the brand guide too.

### 2.1 Which number is WhatsApp? — the most important one

Three numbers are known, and it is not confirmed which receives WhatsApp. The
WhatsApp button will be the most-used control on the site, so a wrong guess is
expensive. Current assumption:

| Purpose | Number | Basis |
|---|---|---|
| Sales / cart handoff | **+962 79 900 0301** | the Google-verified showroom line |
| Repairs / bookings | **+962 796 003040** | first service number on the card |

Both are environment variables (`NEXT_PUBLIC_WHATSAPP_SALES`,
`NEXT_PUBLIC_WHATSAPP_SERVICE`) — correcting them is a config change, not a code
change.

### 2.2 Domain and hosting

The site is domain-agnostic. When the domain exists, set `NEXT_PUBLIC_SITE_URL`
and every canonical URL, hreflang tag, sitemap entry and social preview follows.

### 2.3 Product photography

Every product currently shows a branded placeholder. Real photos are a file drop
into `public/products/` plus one field per product — see CONTENT.md section 3.
Also worth shooting: the shopfront, the interior, and the repair bench, for the
about and contact pages.

### 2.4 Warranty policy

`/warranty` is honest about what is known (repairs are guaranteed, the term is
on the receipt; devices follow the manufacturer) and does **not** invent
durations. The page has a marked comment showing exactly where the real policy
text drops in. Needed: repair warranty length, and whether device warranties are
handled in-shop or via the agent.

### 2.5 Shipping rates — placeholder commercial policy

The site currently charges a flat **3 JOD** delivery, free over **100 JOD**.
Those numbers were invented to make checkout work end-to-end; they are not a
client decision. They live in two constants at the bottom of
`lib/cart/store.ts` (`FLAT_SHIPPING_FILS`, `FREE_SHIPPING_THRESHOLD_FILS`).
**Confirm these before launch.**

---

## 3. Deliberately not built

No card payments, BNPL or digital wallets, no SMS OTP, no user accounts or
login, no wishlist, no coupons, no product reviews, no admin panel, no courier
API, no analytics or tracking pixels.

The card-payment omission is a business constraint, not a technical one:
Jordanian acquirers need a trade licence, a tax number and 1–3 weeks of
paperwork. **Start that paperwork now** — it is the longest external dependency.
The code is ready for it (section 4).

---

## 4. Adding a payment gateway

Full walkthrough in **EXTENDING.md section 1**. Summary: write one file in
`lib/payments/` implementing the `PaymentProvider` interface, add it to the
registry array, add two translation keys, and build the callback route. Nothing
outside `lib/payments/` changes — the checkout page renders its options from the
registry, and `Order.paymentMethod` is a plain string, so no migration is
needed.

---

## 5. Before going live — required

1. ~~Switch to Postgres.~~ **Done.** The project now runs on Supabase Postgres
   in `eu-central-1`, with the transaction pooler for the app and a direct
   session connection for migrations. The SQLite persistence risk is gone.
   Set `DATABASE_URL` and `DIRECT_URL` in the host's environment — see
   `.env.example` and EXTENDING.md section 2.
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain.
3. Confirm the WhatsApp numbers (2.1) and shipping rates (2.5).
4. Replace placeholder product images.
5. Drop in the real warranty text.
6. Run `npm run build`, then with the app running: `node scripts/audit-pages.mjs`.

---

## 6. Verification status

Everything below was run and passed at handoff — not self-reported by the agents
that wrote the code.

| Check | Result |
|---|---|
| `npm run build` | Passes — 179 static pages |
| `npx tsc --noEmit` | Zero errors |
| `npx eslint` | Zero errors, zero warnings |
| `npm test` | 27/27 Arabic normalisation tests pass |
| `node scripts/keycheck.mjs` | 344 keys, AR/EN identical, zero placeholder drift |
| `node scripts/verify-contrast.mjs` | Whole palette AA-compliant; teal correctly still fails as small text |
| `npx tsx scripts/verify-seo.mts` | 22/22 JSON-LD assertions against the confirmed facts |
| `npx tsx scripts/verify-search.mts` | Arabic/Latin cross-script search confirmed |
| `npx tsx scripts/verify-service.mts` | Bookings to service line, orders to sales line, Arabic URL-encoding intact |
| `node scripts/audit-pages.mjs` | Clean across 38 page renders (19 routes x 2 locales) |
| Manual browser checks | Zero horizontal overflow at 320px; 3-level category depth; invalid category ancestry 404s; out-of-stock keeps WhatsApp live; filters URL-driven and shareable |

### Not verified, and why

**Lighthouse scores were not run.** A number produced against a local dev build
would not be trustworthy, and this environment could not composite the page to
measure paint timings. What *was* measured instead: contrast computed from the
actual palette, keyboard reachability, `prefers-reduced-motion` support, image
alt coverage, `next/image` sizing, and the production bundle (103 kB shared JS).
**Run Lighthouse against the deployed URL once the domain is live** — that is the
only number worth acting on.

**The design critique (gate F4) was run against computed styles and measured
layout, not against screenshots.** The browser pane in this environment could
not produce images. That instrument is good at catching typography, colour and
structural faults — it found three real ones, below — but it cannot judge
whether the page simply *looks* good. A human should review the rendered site
before launch.

---

## 7. Notable defects found and fixed during the build

Recorded because each is the kind of thing that silently ships.

1. **52px of horizontal overflow on every page at 320px.** The skip link
   combined `sr-only` with `px-4 py-2`; Tailwind v4 emits the padding utilities
   after `sr-only`'s `padding:0`, so the "hidden" link had a real 32px box.
   Padding moved into the `focus:` state.

2. **The Arabic hero said the shop closes at noon.** «الظهيرة» (noon) appeared in
   10 places in `messages/ar.json` where «منتصف الليل» (midnight) was meant — the
   hero subheadline, the footer hours, the FAQ and the about page. The English
   was correct throughout, so the error was invisible to a non-Arabic reader,
   and it contradicted the single selling point the site is built around. A
   «فتوح»/«مفتوح» typo was fixed at the same time.

3. **182 Arabic text nodes were rendering in a Latin font.** Poppins and IBM Plex
   Mono carry no Arabic glyphs, so every Arabic string styled as "latin" or
   "mono" — including both hero CTAs — fell back to an arbitrary system face
   instead of Tajawal. Fixed by adding Tajawal to those font stacks after the
   Latin faces, so Latin runs stay Latin and Arabic runs get Tajawal.

4. **Letter-spacing was breaking Arabic cursive joining.** The `.eyebrow` style
   applied `letter-spacing: .18em` and `text-transform: uppercase` — correct for
   a Latin label, but letter-spacing visually pulls Arabic words apart and
   uppercase does nothing in a script with no case. Both are now disabled under
   RTL.

5. **i18n plurals used the wrong convention.** Six keys were written as
   `key_one`/`key_other` (i18next style) rather than ICU plurals, which next-intl
   expects. Two call sites were already throwing `MISSING_MESSAGE`; others had
   been worked around with helper functions. All six were converted to real ICU
   plurals, and the Arabic ones now carry the full CLDR set
   (zero/one/two/few/many/other) rather than collapsing to two forms.

6. **Six orphaned dev servers were holding the Prisma engine DLL**, which broke
   `npm run build` with an `EPERM` rename error on Windows. Worth knowing if the
   build ever fails that way: kill stray `node` processes first.

---

## 8. Database migration to Supabase (post-build)

Moved off SQLite onto **Supabase Postgres, `eu-central-1`**, using the two
connection strings supplied in `.env.local`.

**What changed:** `prisma/schema.prisma` now uses `provider = "postgresql"` with
both `url` (pooler) and `directUrl` (direct); a `prisma.config.ts` was added;
`package.json` moved from `db:push` to a proper migration workflow. Application
code changed **not at all** — every query already went through `lib/catalog.ts`
and `lib/orders.ts`, which is exactly what that layer was for.

**Two traps worth recording:**

1. **The Prisma CLI does not read `.env.local`** — only `.env`. The real
   credentials can only live in `.env.local` (it is gitignored), so without
   intervention `prisma migrate` would have quietly targeted the stale SQLite
   URL still sitting in `.env` and reported success against the wrong database.
   `prisma.config.ts` now loads `.env` then `.env.local` in Next.js's
   precedence order; standalone scripts use `scripts/load-env.ts`.
2. **Migrations cannot run through the transaction pooler.** They need the
   session-mode connection on :5432, which is what `directUrl` is for. The app
   itself uses the :6543 pooler with `pgbouncer=true`.

**Verified against the live database:**

| Check | Result |
|---|---|
| `public` schema inspected before writing | Empty — nothing clobbered |
| `prisma migrate dev --name init` | Applied cleanly via the direct connection |
| Seed through the pooler | 8 categories, 17 brands, 48 products, 227 attributes, 10 services |
| Parity with the SQLite baseline | Identical counts, incl. 9 out-of-stock and 28 discounted |
| Seed idempotency on Postgres | Re-ran; counts unchanged |
| 3-level category + relation joins | Work over the pooler |
| `npm run build` | 179 pages, same as before |
| All routes + `scripts/audit-pages.mjs` | 200s; clean across 38 renders |
| **Order write path** | Order persisted in a `$transaction` through PgBouncer; priced from the DB not the client; stock decremented; `/track` returned it for the right phone and refused a wrong one |

The order test created one order and deleted it again — the database was left
with zero orders.
