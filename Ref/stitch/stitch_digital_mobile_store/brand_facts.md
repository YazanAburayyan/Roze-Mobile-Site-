# ROZE — distilled brand + business facts

Extracted from `ref/roze-brand-identity.html`. This is the working reference for all
build tasks — read this instead of the 136KB HTML. It is faithful to the source; the
source remains authoritative if they ever conflict.

## Business (confirmed)

```
Name (EN):      Roze Mobiles & Computers
Name (AR):      روز موبايل
Category:       Computer store / electronics retail + repair
Address (AR):   الجبيهة — شارع أبو نصير — مبنى ١٥٧
Address (EN):   Jubaiha — Abu Nsair Street — Building 157
City:           Amman, Jordan
Coordinates:    32.049966, 35.875740
Google Maps:    https://maps.google.com/?cid=8128987237016048278
Plus Code:      2VXG+X7 Amman, Jordan
Showroom phone: +962 79 900 0301    (verified on Google)  -> sales / WhatsApp sales
Service phone:  +962 796 003040     (business card)       -> maintenance / WhatsApp service
Service phone:  +962 789 998992     (business card)
Facebook:       https://www.facebook.com/RozeMobile
Rating:         4.5 stars, 159 reviews (Google) — surface as social proof
Hours:          Saturday–Thursday  10:00 – 00:00
                Friday             13:00 – 00:00   (Asia/Amman)
Currency:       JOD, three decimals, e.g. د.أ 249.500
```

Late-night hours are a selling point. The site must show a live Open now / Closed
indicator computed in `Asia/Amman`, and the hours must be visible above the fold.

## Colors — pixel-sampled from the real logo

| Token | Hex | Role |
|---|---|---|
| `--roze-teal` | `#66C0C9` | Primary. Fills, wide backgrounds, interactive elements, large display type. **Not small text on light.** |
| `--roze-teal-deep` | `#1E6A74` | Derived. Text-safe teal on light backgrounds — 6.1:1, passes AA. Body links, small text. |
| `--roze-mist` | `#B5DDDF` | Card backgrounds, fields, hover states. From the logo ring's halo. |
| `--roze-ink` | `#060606` | Primary text and dark section backgrounds. Near-pure black, not grey. |
| `--roze-gold` | `#E1CF7E` | Rare accent only: warranty / genuine badges, thin dividers. Never a background, never body text. |
| `--roze-indigo` | `#525BA2` | End of the ring gradient. Gradients and active states only, never standalone. |
| `--roze-paper` | `#F4FAFA` | Page ground. |

Signature gradient (from the logo ring):
`linear-gradient(135deg, #B5DDDF 0%, #66C0C9 45%, #525BA2 100%)`

Supporting values from the guide: `--line: rgba(6,6,6,.12)`, `--muted: #5C6B6D`,
`--r-sm: 10px`, `--r-md: 16px`, `--r-lg: 22px`,
`--shadow: 0 2px 8px rgba(6,6,6,.06), 0 12px 32px rgba(6,6,6,.06)`.

### Distribution — 60 / 30 / 10
60% neutral (white/black) · 30% teal + mist · 10% gold + indigo.
Gold stays under 5% of any screen or the brand loses its calm.

### The contrast rule (hard gate)
`#66C0C9` on white is 2.1:1 and fails WCAG AA. Any text under 24px on a light
background uses `#1E6A74`. Checked by the F3 gate.

## Typography

| Family | Use | Weights |
|---|---|---|
| **Tajawal** | Arabic — headings and body both | 800/700 headings, 400 body, 300 long-form |
| **Poppins** | Latin — brand names, wordmark, device model names | 700 wordmark (tracking .02em), 400 tagline (tracking .42em), 500 brand names 15–18px |
| **IBM Plex Mono** | Numbers, specs tables, phone numbers, part codes, SKUs | 400/500 |

Type scale from the guide:
- Display / h1: 800 · 40–64px · line-height 1.15 · tracking -0.02em
- Section h2: 800 · 26–40px · line-height 1.25 · tracking -0.01em
- h3: 700 · 18px
- Body: 400 · 16–17px · line-height 1.75
- Lede: 17px, muted, max-width 62ch
- Eyebrow/label: IBM Plex Mono · 11px · tracking .18em · uppercase · muted

All three are Google Fonts, free, loaded with `display: swap`.

## The logo

`ref/RozeLogo.png` — 2400×1338 transparent PNG. Two intersecting circles: one solid,
one gradient ring. The intersection is the whole idea — **sales and service meeting in
one shop.**

Hard rules:
- The white circle is **baked into the artwork**. On white it disappears and the mark
  breaks. Place it only on ink `#060606`, teal `#66C0C9`, or imagery.
- A header on a light ground needs a dark or teal container behind the logo.
- Raster, not vector. Never upscale past 2400px native width.
- Clear space ≥ half the radius of the solid circle. Minimum width 120px on screen.
- On photographic backgrounds, put it over a ≥60% black scrim.
- Never recolor the gradient, flip it, stretch it, add shadow/border/glow, or separate
  the ROZE wordmark from the circles.

## Voice

- **Concrete before clever.** «صيانة الشاشة خلال ٤٨ ساعة» beats «حلول تقنية متكاملة».
  Numbers and timeframes build trust; general language does not.
- **Arabic first.** Arabic is the base language. English is for technical terms and
  device model names, which are never translated.
- **Service at the level of sales.** The logo's intersection means maintenance is not a
  side service. It gets space in the site equal to the sales sections.
- Buttons name their action: «احجز موعد صيانة», never «اضغط هنا».
- Empty state example: «ما في أجهزة بهاي الفئة حالياً. جرّب فئة ثانية أو اتصل فينا ونجيبها.»
- Error example: «رقم الموبايل لازم يبدأ بـ ٠٧ ويكون ١٠ أرقام.» — explains the fix,
  does not apologise.

## Catalogue structure

```
1. الهواتف واكسسواراتها      Mobile phones + accessories (cases, chargers, audio,
                             screen protection, power banks)
2. اللابتوبات واكسسواراتها    Laptops & computers + accessories (mice, keyboards,
                             bags, drives, memory)
3. أجهزة الترفيه              Entertainment / gaming devices + accessories
4. الصيانة                    Maintenance & repair — phones and laptops
```

Every product category splits into **devices** and **accessories for that category**.
Maintenance is a **top-level peer**, not a footnote — same visual weight as any sales
category. This is a brand requirement, not a layout preference.

## Open questions the client still owes (do not invent answers)

1. Domain + hosting — build domain-agnostic, every absolute URL from one env var.
2. Shop and product photography — placeholder system that swaps by dropping files.
3. **Which of the three numbers is WhatsApp** — currently assuming showroom for sales,
   `+962 796 003040` for service.
4. Warranty policy text — length of repair warranty, device warranty.
