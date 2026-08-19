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

## 3. Real product photography

The placeholder system is designed so this is a file drop, not a code change.

1. Put images in `public/products/`.
2. Set `ProductImage.url` to `/products/<filename>` (see CONTENT.md §3).

`lib/product-image.ts` returns the placeholder whenever a product has no image,
so a half-finished photo shoot degrades gracefully instead of showing broken
images. Nothing needs to be switched on.

**If photos move to a CDN**, add the host to `images.remotePatterns` in
`next.config.ts` — `next/image` blocks unlisted remote hosts by design.

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
