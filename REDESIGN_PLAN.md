# REDESIGN_PLAN.md — ROZE visual rebuild

Presentation layer only. Data, routing, i18n keys, payments, notifications and
`/track` security are untouched. Every existing gate must still pass.

---

## 1. What I saw in the "before" screenshots

I captured the current build with Playwright before planning, because the last
review failed by never looking. Confirming the brief, and adding one item it
does not mention:

1. **Header logo is a sticker.** The mark sits in a black rounded rectangle
   floating on a light bar. It reads as a placeholder asset, not identity.
2. **The hero redraws the logo.** Two large overlapping circles — one teal
   gradient, one solid black — with the real logo in a *second* black plate on
   top. The mark appears twice in one viewport at two sizes.
3. **The eyebrow prints brand rationale.** «بيع وصيانة — دائرتين متقاطعتين»
   ("sales and service — two intersecting circles") is the designer's note on
   what the mark means, printed as customer copy.
4. **One hue everywhere.** Cool near-white ground, teal badges, teal buttons,
   mint product tiles. Nothing anchors it.
5. **NOT IN THE BRIEF — six near-identical rails.** Featured, new arrivals,
   offers, phones, laptops, entertainment: six stacked grids of identical pale
   tiles. On desktop the page is ~10,000px of the same component. This is as
   damaging as the palette. **Fixing it is part of this rebuild.**

## 2. Visual direction — "warm workshop"

A neighbourhood repair shop that also sells: warm, plain-spoken, technical.
Not a glossy consumer-electronics chain.

**Ground.** Warm off-white `#FAF9F7`, with `#F2EFEA` for alternating bands so
sections separate without borders. Warm neutrals make teal read as a chosen
accent; the old cool `#F4FAFA` made everything one wash.

**Rhythm.** Light band → light band → **ink band** → light. Two full-bleed ink
sections (maintenance, footer) give the page a spine and give the logo a home
where it is legitimate.

**Teal is an accent, never a surface.** Buttons, small fills, icon strokes,
focus rings. No large teal panels. Mist only as a hairline tint on hover.

**Gold is hairlines and warranty badges.** Under 5% of any screen. Never a fill.

**Typography carries the page.** Tajawal 800 at display size does the work the
decorative circles were doing. IBM Plex Mono for prices, SKUs, spec rows and
hours — the technical voice is the brand's real texture.

**Product tiles read as spec cards,** not empty boxes: warm card, hairline
border, category glyph in low-opacity teal-deep, name, mono price, mono SKU.
A full grid of placeholders should look like a catalogue, not like a loading
state.

## 3. Logo policy

`.logo-plate` is deleted. No container is invented to hold the mark.

| Slot | Treatment |
|---|---|
| Header (light) | **Wordmark**: ROZE in Poppins 700, ink, brand tracking. Not the PNG. |
| Footer (ink band) | **The real logo**, via `next/image`, sized to what it renders. |
| Hero | **Neither.** Typographic. |

That gives at most one logo per viewport, never on a light ground, never
redrawn. The mark is never approximated in CSS or SVG anywhere — no circles, no
rings, no "echo" shapes.

## 4. Homepage composition

Header · Hero · Trust strip · Category grid · **One** top-picks rail ·
Maintenance ink band · Social proof · Location & hours · Footer.

**The six rails collapse to one.** Featured/new/offers become tabs or a single
curated rail with a "view all" into `/offers`; the per-category rails are
replaced by the category grid, which is what they were badly duplicating. This
is the single biggest structural fix.

**Hero copy is written fresh in Arabic.** The eyebrow is a customer benefit or
absent. Open-until-midnight, seven days, is above the fold — it is the real
differentiator.

**Hero visual:** ink ground with a soft brand-gradient field (mist → teal →
indigo) bled behind the type, plus restrained non-circular geometry. Structured
so a photograph can replace the gradient layer without recomposition; the swap
point is documented in the component.

## 5. Imagery

No third-party product photography — Apple/Samsung/Sony imagery is owned and
using it on a live storefront creates real liability. The placeholder system is
restyled to look deliberate. Licence-free atmosphere imagery is permitted only
for wide bands, never as a stand-in for a specific product. None is added in
this pass; the hero works without it.

## 6. Where I disagree with the brief

**One point.** §5 lists "Top picks — product rail" as a single item, and I am
going further: I am also *removing* the five other rails that exist today. The
brief describes the target structure but does not say the extra rails must go,
and a literal reading would leave them below the listed sections. They are the
main reason the page reads as filler. If you want the offers and new-arrival
rails back as separate sections, say so — but the homepage should not be six
grids of the same component.

Everything else in the brief I agree with, including that the F4 substitution
was the root failure. R10 will use real Playwright screenshots reviewed as
images; the tooling is confirmed working before any code was written.

## 7. Task graph

R1 palette/tokens (Opus) → R2 header/footer, R3 hero (Opus), R4 placeholders →
R5 trust/category/rail, R6 maintenance/proof/location → R7 motion → R8 interior
pages → R9 performance → R10 visual gate with screenshots.

Every task is verified by me against its criteria, and the full pre-existing
suite (39 tests, keycheck, contrast, SEO, search, service, page audit, build)
is re-run at the end.
