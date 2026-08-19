# ROZE — Design System

Single source of truth: **`app/globals.css`**. Tailwind CSS v4.3, CSS-first.
There is no `tailwind.config.ts` and none may be created — all tokens live in the
`@theme` block of `app/globals.css`.

---

## 0. The three contracts

1. **Color** — every hex/rgb/hsl in this project lives in `app/globals.css` and
   nowhere else. Components use utilities (`bg-teal`, `text-teal-deep`,
   `border-line`) or `var(--color-*)`. Need a new color? Add it to `@theme` first.
2. **Direction** — RTL-first (Arabic is the default locale). Logical properties
   only: `inline-start` / `inline-end`, `margin-inline`, `padding-block`,
   `text-align: start`. Never `left`, `right`, `ml-*`/`mr-*`, `pl-*`/`pr-*`,
   `text-left`/`text-right`. In Tailwind use the logical utilities: `ms-*`,
   `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`,
   `border-s`, `border-e`, `rounded-s-*`, `rounded-e-*`.
3. **Contrast** — see §3. `#66C0C9` fails AA. This is a gate, not a preference.

---

## 1. Colors

| Token (CSS var)      | Value                | Tailwind utilities                                | Role |
|----------------------|----------------------|---------------------------------------------------|------|
| `--color-teal`       | `#66C0C9`            | `bg-teal` `text-teal` `border-teal` `fill-teal`    | Primary. Fills, wide backgrounds, interactive surfaces, display type ≥24px. **Never small text on light.** |
| `--color-teal-deep`  | `#1E6A74`            | `bg-teal-deep` `text-teal-deep` `border-teal-deep` | Text-safe teal on light (6.1:1). Links, small text, icons on paper. |
| `--color-mist`       | `#B5DDDF`            | `bg-mist` `text-mist` `border-mist`                | Card grounds, fields, hover states. |
| `--color-ink`        | `#060606`            | `bg-ink` `text-ink` `border-ink`                   | Body text, dark section grounds. |
| `--color-gold`       | `#E1CF7E`            | `bg-gold` `text-gold` `border-gold`                | Rare accent: warranty / genuine badges, thin dividers. **Never a background, never body text. Keep under 5% of any screen.** |
| `--color-indigo`     | `#525BA2`            | `bg-indigo` `text-indigo` `border-indigo`          | Gradient end + active/focus states. Never standalone as a brand color. |
| `--color-paper`      | `#F4FAFA`            | `bg-paper` `text-paper`                            | Page ground (already set on `body`). |
| `--color-line`       | `rgba(6,6,6,.12)`    | `border-line` `divide-line`                        | Hairlines on light. |
| `--color-muted`      | `#5C6B6D`            | `text-muted`                                       | Secondary text on light. |
| `--color-line-invert`| `rgba(244,250,250,.16)` | `border-line-invert`                           | Hairlines on ink. |
| `--color-muted-invert`| `#B5DDDF`           | `text-muted-invert`                                | Secondary text on ink. |

Tailwind's stock `teal-*` and `indigo-*` ramps are cleared, so those names can
only ever mean the ROZE values.

### Signature gradient

```css
--roze-ring: linear-gradient(135deg, #B5DDDF 0%, #66C0C9 45%, #525BA2 100%);
```

Use `.ring-gradient` (fills the background) or `.ring-gradient-border` (renders it
as a 1px gradient border on the element's own radius). Never recolor or reangle it.

Other plain custom properties: `--roze-scrim` (≥60% black, for the logo/text over
photography) and `--roze-measure` (`62ch`).

### 60 / 30 / 10 distribution

- **60%** neutral — `paper` + `ink` (white/black).
- **30%** `teal` + `mist`.
- **10%** `gold` + `indigo`, and **gold stays under 5%** of any screen.

If a screen reads as "teal everywhere", it's wrong. Teal is the accent on a
neutral page, not the page.

---

## 2. Type

Families (Tailwind: `font-arabic`, `font-latin`, `font-mono`; `font-sans` is an
alias of Arabic so unstyled text is already right):

| Utility | Family | Use |
|---|---|---|
| `font-arabic` | Tajawal | Arabic headings **and** body. 800/700 headings, 400 body, 300 long-form. |
| `font-latin`  | Poppins | Wordmark, brand names, device model names. 700 wordmark (`tracking-[.02em]`), 400 tagline (`tracking-[.42em]`), 500 brand names 15–18px. |
| `font-mono`   | IBM Plex Mono | Numbers, prices, specs tables, phone numbers, part codes, SKUs. 400/500. Applied automatically to `code/kbd/samp/pre` and to any element with `data-numeric`. |

Latin model names are **never translated** — wrap them `lang="en"` and they pick up
Poppins automatically.

### Scale (all fluid via `clamp()`)

| Utility | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| `text-display` | 40 → 64px | 1.15 | −0.02em | 800 |
| `text-h1`      | 34 → 52px | 1.15 | −0.02em | 800 |
| `text-h2`      | 26 → 40px | 1.25 | −0.01em | 800 |
| `text-h3`      | 18 → 21px | 1.35 | —        | 700 |
| `text-body`    | 16 → 17px | 1.75 | —        | 400 |
| `text-small`   | 14px      | 1.6  | —        | 400 |
| `text-eyebrow` | 11px      | 1.4  | .18em    | 500 |

Each utility carries its line-height, tracking and weight — don't re-specify them
unless you're deliberately deviating.

### Radii, elevation

`rounded-sm` = 10px · `rounded-md` = 16px · `rounded-lg` = 22px
`shadow-roze` = `0 2px 8px rgba(6,6,6,.06), 0 12px 32px rgba(6,6,6,.06)`

---

## 3. The contrast rule (hard gate)

`#66C0C9` on white/paper is **2.1:1 — it fails WCAG AA.**

- Any text **under 24px** on a light ground uses `text-teal-deep` (`#1E6A74`, 6.1:1).
- `text-teal` is permitted only for **display type ≥24px at weight 700+**, or on an
  ink ground.
- Icons that carry meaning follow the text rule, not the display rule.
- `gold` is never text and never a background — badge borders and hairlines only.
- On ink grounds use `text-paper`, `text-mist`, or `text-muted-invert`.

---

## 4. The logo rule

`Ref/RozeLogo.png` — 2400×1338 transparent PNG, **with a white circle baked into
the artwork**. On a white or paper ground the mark visually breaks.

**Never place the logo directly on a light background. Always use `.logo-plate`.**

```tsx
<span className="logo-plate">
  <Image src="/RozeLogo.png" alt="Roze Mobiles & Computers" width={160} height={89} priority />
</span>
```

- `.logo-plate` — ink `#060606` ground (default; use this in the header).
- `.logo-plate--teal` — teal ground, the only other sanctioned surface.
- `.logo-plate--scrim` — ≥60% black scrim, for the logo over photography.

The plate bakes in the clear-space padding (≥ half the solid circle's radius) and
enforces the 120px minimum on-screen logo width via `min-inline-size`.

Also forbidden: upscaling past 2400px native width, recoloring the gradient,
flipping, stretching, adding shadow/border/glow to the mark, or separating the
ROZE wordmark from the circles.

---

## 5. What `app/layout.tsx` must supply

The theme families reference next/font CSS variables. Layout owns this wiring:

```ts
import { Tajawal, Poppins, IBM_Plex_Mono } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
```

Then, on `<html>`:

```tsx
<html lang="ar" dir="rtl" className={`${tajawal.variable} ${poppins.variable} ${plexMono.variable}`}>
```

**Required variable names — exactly these three:**
`--font-tajawal`, `--font-poppins`, `--font-plex-mono`.
All three must be `display: "swap"`. Layout must also `import "./globals.css"`.
Default document is `lang="ar" dir="rtl"`; the English locale flips to
`lang="en" dir="ltr"` and nothing in the CSS needs to change.

---

## 6. Base layer — already handled, don't re-do it

- `body`: paper ground, ink text, Tajawal, 16→17px, line-height 1.75, antialiased,
  `text-align: start`.
- Headings get `text-wrap: balance`, paragraphs `text-wrap: pretty`.
- `a` defaults to `teal-deep`.
- `:focus-visible` — 3px indigo outline, 3px offset, plus a mist halo so it is
  unmistakable on both paper and ink. Inside `.on-ink` / `.logo-plate` the ring
  inverts (mist outline, indigo halo). **Never write `outline: none`.** If you build
  a custom control, make sure the real focusable element is the one receiving focus.
- `@media (prefers-reduced-motion: reduce)` kills animations, transitions and smooth
  scrolling globally. Don't add motion that bypasses it (no JS-driven scroll
  animation without a `matchMedia` check).
- `::selection` is mist on ink.

## 7. Component classes (the whole list)

| Class | What it does |
|---|---|
| `.wrap` | Page container: `max-inline-size: 1080px`, centered, fluid inline padding `clamp(1rem, 4vw, 2rem)`. |
| `.eyebrow` | Mono 11px, .18em tracking, uppercase, muted. Inverts inside `.on-ink`. |
| `.lede` | 17px muted intro paragraph, `max-inline-size: 62ch`. Inverts inside `.on-ink`. |
| `.logo-plate` (+ `--teal`, `--scrim`) | The logo container. See §4. |
| `.ring-gradient` | Signature gradient as a background. |
| `.ring-gradient-border` | Signature gradient as a 1px border. |
| `.on-ink` | Marker class on dark sections; flips eyebrow/lede/focus colors. |

That's deliberately short. **Buttons, cards, badges, inputs and the rest are React
components in a later task, not CSS classes.** Don't grow this list.

---

## 8. If you are building a component, read this

- [ ] No hex, `rgb()`, or `hsl()` anywhere in your file — utilities or `var(--color-*)` only.
- [ ] No physical direction properties or utilities. `ms/me/ps/pe/start/end/text-start`.
      Test your component with `dir="ltr"` **and** `dir="rtl"`.
- [ ] Text under 24px on a light ground is `text-ink`, `text-muted`, or
      `text-teal-deep` — **never** `text-teal`.
- [ ] Gold appears only as a badge border/hairline, and barely.
- [ ] Sizes come from the scale: `text-display|h1|h2|h3|body|small|eyebrow`.
      Radii from `rounded-sm|md|lg`. Elevation from `shadow-roze`.
- [ ] Numbers (prices, phones, SKUs, spec values) use `font-mono` or `data-numeric`,
      with `tabular-nums`. Prices are JOD with three decimals: `د.أ 249.500`.
- [ ] Every interactive element is a real `<button>` / `<a>` / `<input>` so
      `:focus-visible` applies. No `outline: none`, no `tabIndex={-1}` on controls.
- [ ] Dark sections get `class="on-ink"` on the section wrapper.
- [ ] Any animation degrades under `prefers-reduced-motion`.
- [ ] Arabic-first copy: concrete before clever, buttons name their action
      («احجز موعد صيانة», never «اضغط هنا»). Errors explain the fix.
- [ ] Maintenance is a top-level peer of the sales categories — give it equal
      visual weight, never footnote styling.
