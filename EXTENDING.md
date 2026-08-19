# EXTENDING.md — the seams

Phase 1 deliberately stops short of card payments, a search server and a
multi-instance deployment. Each of those was built as a **seam** rather than a
hard assumption, so adding them later is implementing an interface, not a
rewrite. This document is the map.

---

## 1. Adding a card payment gateway (HyperPay / Tap / MEPS)

**Effort: one new file plus one line.** Nothing outside `lib/payments/` changes.

### Why it's this cheap
- `Order.paymentMethod` is a plain `String`, not an enum — a third value needs
  no migration.
- The checkout page renders its payment options **from the provider registry**,
  so a new provider appears in the UI automatically.
- The order row is persisted *before* the provider runs, so providers never
  touch the database.

### Steps

**1. Write the provider** — `lib/payments/hyperpay.ts`:

```ts
import type { PaymentProvider, OrderDraft, PaymentResult } from './types';
import type { Locale } from '@/i18n/routing';

export const hyperpayProvider: PaymentProvider = {
  id: 'hyperpay',                          // stored verbatim in Order.paymentMethod
  labelKey: 'cardLabel',                   // i18n key under the `checkout` namespace
  descriptionKey: 'cardExplanation',

  isAvailable(draft: OrderDraft) {
    return draft.totalFils >= 1000;        // e.g. a minimum charge
  },

  async process(draft: OrderDraft, locale: Locale): Promise<PaymentResult> {
    const session = await createHyperpayCheckout({
      amount: (draft.totalFils / 1000).toFixed(3),  // fils -> JOD, 3 decimals
      currency: 'JOD',
      merchantTransactionId: draft.reference,
      locale,
    });
    return { status: 'redirect', reference: draft.reference, redirectUrl: session.url };
  },
};
```

**2. Register it** — add to the array in `lib/payments/providers.ts`:

```ts
export const paymentProviders: readonly PaymentProvider[] = [
  codProvider,
  whatsappProvider,
  hyperpayProvider,   // ← the only edit outside the new file
];
```

**3. Add the two i18n keys** to `messages/ar.json` and `messages/en.json` under
`checkout` (`cardLabel`, `cardExplanation`), then run `node scripts/keycheck.mjs`.

**4. Build the return webhook.** The one genuinely new piece of work: a route at
`app/api/payments/hyperpay/callback/route.ts` that verifies the gateway's
signature and moves the order from `pending` to `confirmed`. Never trust an
amount that comes back from the browser — re-read the order from the database
and compare against `totalFils`.

### Before you start
Jordanian acquirers require a trade licence, a tax number and typically 1–3
weeks of paperwork. **Start the paperwork before the code** — it is the long
pole, not the integration.

---

## 2. The database: Supabase Postgres

**This migration is done.** The project ran on SQLite during the initial build
and now runs on Supabase Postgres in `eu-central-1`. This section documents the
setup because the two-URL requirement is the part people get wrong.

### Two connection strings, and they are not interchangeable

| Variable | Port | Mode | Used by |
|---|---|---|---|
| `DATABASE_URL` | 6543 | transaction pooler (`pgbouncer=true`) | the running app |
| `DIRECT_URL` | 5432 | session | Prisma migrations only |

`pgbouncer=true` is required: PgBouncer in transaction mode cannot keep
prepared statements alive across a connection, and Prisma has to be told. And
migrations need a session-scoped connection — they fail through the transaction
pooler, which is why `directUrl` exists in the datasource block.

### The env-loading trap

The Prisma CLI reads `.env`; it does **not** read `.env.local`. Since the real
credentials live in `.env.local` (gitignored), `prisma migrate` would otherwise
silently target whatever URL is in `.env` and report success against the wrong
database. `prisma.config.ts` fixes this by loading `.env` then `.env.local`, in
Next.js's precedence order. Standalone scripts do the same via
`scripts/load-env.ts`.

### Everyday commands

```bash
npm run db:migrate   # after changing schema.prisma — creates + applies a migration
npm run db:deploy    # apply existing migrations (CI / production)
npm run db:seed      # idempotent demo catalogue
npm run db:studio    # browse the data
```

### What made the move cheap
Money is integer fils everywhere, ids are `cuid()`, and no SQLite-specific
column types were used. Enum-ish columns (`Order.status`, `paymentMethod`,
`ServiceType.deviceType`) are `String` with allowed values in doc comments —
you may convert them to native Postgres enums, but leaving them as strings is
what keeps the payment-provider seam (section 1) a one-file change.

Application code needed no changes: every query goes through `lib/catalog.ts`
and `lib/orders.ts`.

---

## 2a. Authorization model

**This is a deliberate decision, not an inherited default.** It was measured,
reviewed and confirmed. Do not "fix" it without reading this whole section.

### How it works today

| Path | Enforcement |
|---|---|
| The Next.js app (Prisma) | Connects as `postgres`, which has `rolbypassrls = true`. **RLS does not apply.** |
| PostgREST / the public API | RLS is enabled on all tables with **zero policies** → deny-all. |
| Authorization for real | **Server actions.** Nothing in the database enforces it. |

Verified role-by-role: `anon` and `authenticated` can read no rows and write no
rows on any table. `service_role` bypasses RLS — that key must never leave the
server, and this project holds no Supabase keys at all.

### Why this is the right shape here

The app is server-rendered, has no login, and does no client-side database
access. Prisma connects as a privileged role, so RLS *cannot* enforce anything
on the app's own queries. Server actions are therefore the only place
authorization can actually live. RLS-enabled-with-no-policies is exactly the
backstop we want on the PostgREST path: closed by default.

Concretely, `/track` is the only endpoint that exposes customer data, and it
requires an order reference **and** a matching phone number, is rate limited to
8 requests/minute per IP, and returns byte-identical responses for "wrong
phone" and "no such reference". That last property is asserted by
`lib/track-security.test.ts`.

### The trap — read this before adding any client-side Supabase access

If someone adds a Supabase client with the anon key, **every query will return
empty**, because RLS is on and no policy grants anything. The intuitive fix is
to add a permissive policy. Do not do that.

`Order` holds customer names, phone numbers and delivery addresses. A
`using (true)` policy on that table makes all of it readable by anyone holding
the anon key — and **the anon key is a public value**, shipped to every
browser. That is a customer-data breach, reached by a one-line "fix" that looks
like it is simply turning the feature on.

**Adding client-side access requires writing real per-row policies first, not
opening the tables.** For `Product`, `Category` and `Brand`, a read-only
`using (true)` is genuinely fine — that data is already public on the
storefront. For `Order` and `ServiceRequest` it is not, and there is no user
identity to scope a policy to, because there are no accounts. Solve the
identity question before the policy question.

The current, correct state:

```
Do not write permissive policies.
Do not add a Supabase client.
Do not put any Supabase key in the environment.
```

---

## 3. Real product photography

Photos live in a **public Supabase Storage bucket named `products`**. Public
read, no signed URLs: a retail catalogue's product photos are public by
definition, and signing them would add expiry handling and defeat CDN caching
for no benefit.

**The database stores a path inside the bucket** (`iphone-15-pro.webp`), never
a full URL — so the project can change bucket, region or CDN without rewriting
every row. `lib/product-image.ts` resolves it:

| Stored value | Resolves to |
|---|---|
| `iphone-15-pro.webp` | `https://<host>/storage/v1/object/public/products/iphone-15-pro.webp` |
| `/products/local.jpg` | served from `public/` as-is |
| `https://cdn…/a.jpg` | passed through unchanged |
| empty / null | the placeholder — the grid never shows a broken tile |

Two pieces of config must agree, and both read the same variable so they
cannot drift:

- `NEXT_PUBLIC_SUPABASE_STORAGE_HOST` — e.g. `abcdefgh.supabase.co`. **Not a
  credential**; it is the public hostname in every image URL. It lives in an
  env var so the project ref is not hardcoded into a public repo.
- `next.config.ts` `images.remotePatterns` — `next/image` refuses to optimise an
  unlisted remote host, and an unlisted host shows as a *broken image*, not a
  warning.

The bucket enforces a **2 MB limit** and accepts only `image/webp`,
`image/jpeg`, `image/png` and `image/avif`. It was created by
`scripts/setup-storage.mts`, which uses SQL over the direct Postgres connection
precisely so no Supabase key is needed. That script is idempotent.

**The upload procedure is deliberately not a developer task** — the shop owner
does it from the Supabase dashboard. See CONTENT.md section 3.

---

## 4. Search beyond ~1500 SKUs

Today search is Fuse.js in the browser over the whole catalogue. That is the
right call at 48 SKUs: no infrastructure, instant results, works offline after
first load. It becomes the wrong call at scale, because the entire catalogue
ships to the client as JSON over mobile data.

The seam is `SearchProvider` in `lib/search/index.ts`:

```ts
export interface SearchProvider {
  search(query: string, limit?: number): SearchHit[];
}
```

To replace it, implement that interface against a server route, Meilisearch or
Typesense and change what `createSearchProvider()` returns. **Keep using
`lib/arabic.ts`** — `normalizeArabic()` and `expandQuery()` are what make
`ايفون`, `آيفون` and `iPhone` find the same product, and that logic is
independent of the engine. If you move to Meilisearch, run the same
normalisation on documents at index time.

Regression test: `npx tsx scripts/verify-search.mts`.

---

## 5. Rate limiting across multiple instances

`lib/rate-limit.ts` is an in-process `Map`. It genuinely protects a single Node
process and does nothing across several — each instance keeps its own counters.
Only `/track` uses it.

If you scale horizontally, swap the `Map` for Redis. The call sites do not
change: `rateLimit(key, { limit, windowMs })` returns
`{ allowed, remaining, resetAt }`.

---

## 6. Things intentionally not built

Each was a deliberate Phase 1 exclusion, not an oversight.

| Not built | Where it would go |
|---|---|
| User accounts / login | Order lookup at `/track` needs no account by design — phone + reference. Adding auth means a `User` model and session handling; the order table already keys on phone. |
| SMS OTP | Needs a provider (Unifonic, Twilio). Only worth it once accounts exist. |
| Coupons / promo codes | Add a `Coupon` model and apply it in `buildOrderDraft()` in `lib/orders.ts` — the one place totals are computed. |
| Wishlist | Mirror the cart: a Zustand store in `lib/` persisted to localStorage. |
| Product reviews | The Google rating is shown as social proof instead. Real reviews need moderation, which needs an admin. |
| Admin panel | The largest deferred piece. Today the catalogue is edited in `prisma/seed.ts` (see CONTENT.md). A real admin needs auth, roles and a media library. |
| Courier integration | `Order` has the address fields an Aramex/DHL API would need. |
| Analytics | Nothing is installed and the privacy policy says so — if you add GA4/Meta Pixel, **update `pages.privacy` in both message files**, or the policy becomes untrue. |

---

## 7. Deploying

Set these in the host's environment:

```
DATABASE_URL              Supabase pooler, :6543, pgbouncer=true  (see §2)
DIRECT_URL                Supabase direct,  :5432                 (migrations)
NEXT_PUBLIC_SITE_URL      https://the-real-domain.com  ← no trailing slash
NEXT_PUBLIC_WHATSAPP_SALES
NEXT_PUBLIC_WHATSAPP_SERVICE
```

Run `npm run db:deploy` as part of the release step so migrations are applied
before the new build serves traffic.

`NEXT_PUBLIC_SITE_URL` is the single value every canonical URL, hreflang tag,
sitemap entry and OG image URL is built from. Setting it correctly is what makes
the site stop being domain-agnostic — nothing else needs to change.

Then:

```bash
npm run build && npm start
```
