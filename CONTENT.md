# CONTENT.md — editing the site without being a developer

This covers the three things that change most often: **products**, **page text**,
and **product photos**. You need a code editor and the ability to run two
commands. Nothing here requires understanding the application code.

Anything you edit here is plain text. If something breaks, the fix is almost
always a missing comma or a missing `"` quote mark.

---

## 1. Adding or editing a product

Products live in `prisma/seed.ts`. Find the product list and copy an existing
entry — copying is safer than writing one from scratch, because you inherit the
right shape.

```ts
{
  slug: 'iphone-16-pro',            // URL: /product/iphone-16-pro. Lowercase, hyphens, no spaces.
  sku: 'APL-IP16P-256',             // Must be unique.
  titleAr: 'آيفون 16 برو',           // Model numbers stay in Latin, even in Arabic.
  titleEn: 'iPhone 16 Pro',
  descriptionAr: 'جملتين عن الجهاز…', // Real sentences. Concrete, not marketing.
  descriptionEn: 'Two sentences…',
  price: 899000,                    // ← SEE THE PRICE RULE BELOW
  compareAtPrice: 999000,           // Optional. The "was" price. Must be HIGHER than price.
  stockQuantity: 5,
  inStock: true,                    // Must agree with stockQuantity.
  isFeatured: true,                 // Shows on the homepage "featured" row.
  isNewArrival: true,               // Shows on the homepage "new arrivals" row.
  categorySlug: 'phones',
  brandSlug: 'apple',
}
```

### THE PRICE RULE — read this one carefully

**Prices are written in fils, not dinars. 1 JOD = 1000 fils.**

| The customer should see | You write |
|---|---|
| د.أ 899.000 | `899000` |
| د.أ 25.500 | `25500` |
| د.أ 8.750 | `8750` |

Writing `899` would price an iPhone at less than one dinar. When in doubt:
**take the dinar price and add three zeros.**

### Stock

`stockQuantity` and `inStock` must agree:
- In stock: `stockQuantity: 5, inStock: true`
- Sold out: `stockQuantity: 0, inStock: false`

A sold-out product still gets its own page, and customers can still ask about it
on WhatsApp — only the "add to cart" button switches off. That enquiry is often
the sale, so it is deliberate.

### Discounts

Set `compareAtPrice` **above** `price`. The site shows the old price struck
through, works out the percentage, and adds the product to `/offers`
automatically. A `compareAtPrice` equal to or below `price` is ignored — no fake
discounts will ever display.

### Apply your changes

```bash
npm run db:seed
```

Safe to run as many times as you like. It updates existing products by `slug`
and adds new ones; it never creates duplicates.

---

## 2. Editing page text

All visible text lives in two files:

- `messages/ar.json` — **Arabic. This is the original.** Write here first.
- `messages/en.json` — English.

They mirror each other exactly. Find the phrase you want to change, edit the
text after the `:`, keep the quotes.

```json
"hero": {
  "headline": "بيع وصيانة تحت سقف واحد",
  ...
}
```

**Two rules:**

1. **Never delete a line from one file without deleting the same line from the
   other.** The two files must always have exactly the same set of names.
2. **Never change anything inside curly braces.** `{count}`, `{reference}` and
   `{phone}` are slots the site fills in with real values. `{count} أجهزة` is
   correct; renaming it to `{عدد} أجهزة` breaks the page.

Then check your work:

```bash
node scripts/keycheck.mjs
```

It prints any name that exists in one language but not the other. If it says
`(none)` twice, you are fine.

### Long page text
About, FAQ, How to buy, Warranty and Privacy all live under `"pages"` in the
same two files. The FAQ is a list of `q1_title` / `q1_answer` pairs — to add a
question, copy a pair, bump the number, and add it in **both** files.

### Business details — do NOT edit these in the message files
Phone numbers, the address, opening hours and the Google rating live in exactly
one place: `lib/site.ts`. Change them there and they update everywhere at once —
header, footer, contact page, WhatsApp links, and the data Google reads. They
are deliberately not in the text files so they can never disagree with each
other.

---

## 3. Adding real product photos

Right now every product uses a placeholder graphic. To use real photos:

1. Save the photo as `.jpg` or `.webp`, ideally square, on a white background,
   at least 800×800.
2. Put it in `public/products/` — for example `public/products/iphone-16-pro.jpg`.
3. In `prisma/seed.ts`, find that product's image entry and set the url:

```ts
images: [{
  url: '/products/iphone-16-pro.jpg',   // matches the filename in public/products/
  altAr: 'آيفون 16 برو باللون الأسود',   // describe the photo, for blind users and Google
  altEn: 'iPhone 16 Pro in black',
  isPrimary: true,
}]
```

4. Run `npm run db:seed`.

Add more entries to `images` for extra angles; the first with `isPrimary: true`
is the one shown in listings.

---

## 4. Publishing your changes

```bash
npm run build
npm start
```

If `npm run build` prints an error, your change has a syntax problem — usually a
missing comma or quote. The error message names the file and line number.
