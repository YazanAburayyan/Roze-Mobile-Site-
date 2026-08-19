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

## 3. Adding product photos

**You do not need a developer, a terminal, or a deploy for this.** Photos are
uploaded through the Supabase dashboard in your browser.

Right now every product shows a placeholder graphic. Here is how to replace it.

### Before you upload — the photo itself

| Requirement | Value |
|---|---|
| Format | WebP or JPEG (PNG works, but the files are bigger) |
| Size on disk | **Under 2 MB** — the bucket rejects anything larger |
| Dimensions | Roughly square, at least 800 × 800 |
| Background | Plain white looks best in the grid |

Square matters: the product grid puts every photo in the same shaped box, so a
very wide or very tall photo will sit awkwardly next to the others.

Give the file a sensible name before uploading — `iphone-16-pro.webp` is good,
`IMG_4471.jpg` is not. **Use only lowercase letters, numbers and hyphens.** No
spaces, no Arabic in the filename.

### Step 1 — upload the photo

1. Go to <https://supabase.com/dashboard> and open the ROZE project.
2. In the left sidebar click **Storage**.
3. Open the bucket called **products**.
4. Click **Upload file** and pick your photo.

That's the upload done. The photo is now live on the internet.

### Step 2 — copy the file name

You need the exact name of the file you just uploaded, for example:

```
iphone-16-pro.webp
```

Just the file name — **not** a full web address, and **not** a path with
folders in front of it. If you uploaded into a folder inside the bucket, include
the folder: `phones/iphone-16-pro.webp`.

### Step 3 — attach it to the product

Open `prisma/seed.ts`, find the product, and put that file name in its image
entry:

```ts
images: [{
  url: 'iphone-16-pro.webp',            // the file name from step 2
  altAr: 'آيفون 16 برو باللون الأسود',   // describe the photo — for blind visitors and Google
  altEn: 'iPhone 16 Pro in black',
  isPrimary: true,                      // the photo shown in listings
}]
```

Then run `npm run db:seed` once, exactly as you would after any product change
(section 1).

> **Why this last step still touches a file:** the *photo* lives in Storage and
> needs no developer, but the link between a photo and a product is still in
> the catalogue file. Until there is an admin panel, that one line has to be
> typed. It is the same file you already edit to add a product, and the same
> command you already run.

### Adding more angles

Add more entries to the `images` list. The one marked `isPrimary: true` is what
shows in the grid; the rest appear in the gallery on the product page.

```ts
images: [
  { url: 'iphone-16-pro.webp',       altAr: '…', altEn: '…', isPrimary: true },
  { url: 'iphone-16-pro-back.webp',  altAr: '…', altEn: '…', isPrimary: false },
]
```

### If a photo does not appear

- **You still see the placeholder graphic.** The file name in `seed.ts` does not
  match the file in the bucket. Check spelling, capitals, and the extension
  (`.webp` vs `.jpg`).
- **The upload was rejected.** The file is over 2 MB, or it is not an image
  format the bucket accepts. Re-export it smaller.
- **A broken image icon.** Tell a developer — this usually means the site's
  image settings need the bucket's address added, which is a one-line config
  change.

Nothing here can break the site: if a photo is missing or misnamed, the product
simply falls back to the placeholder.

---

## 4. Publishing your changes

```bash
npm run build
npm start
```

If `npm run build` prints an error, your change has a syntax problem — usually a
missing comma or quote. The error message names the file and line number.
