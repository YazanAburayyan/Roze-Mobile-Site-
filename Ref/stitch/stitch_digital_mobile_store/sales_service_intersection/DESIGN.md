---
name: Sales & Service Intersection
colors:
  surface: '#f4fafa'
  surface-dim: '#d5dbdb'
  surface-bright: '#f4fafa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5f5'
  surface-container: '#e9efef'
  surface-container-high: '#e3e9e9'
  surface-container-highest: '#dde4e4'
  on-surface: '#161d1d'
  on-surface-variant: '#3e494a'
  inverse-surface: '#2b3232'
  inverse-on-surface: '#ecf2f2'
  outline: '#6e797a'
  outline-variant: '#bdc9ca'
  surface-tint: '#006970'
  primary: '#006970'
  on-primary: '#ffffff'
  primary-container: '#66c0c9'
  on-primary-container: '#004d53'
  inverse-primary: '#7bd4dd'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#6b5e19'
  on-tertiary: '#ffffff'
  tertiary-container: '#c4b365'
  on-tertiary-container: '#504500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f1fa'
  primary-fixed-dim: '#7bd4dd'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f55'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#f5e390'
  tertiary-fixed-dim: '#d8c777'
  on-tertiary-fixed: '#211b00'
  on-tertiary-fixed-variant: '#524600'
  background: '#f4fafa'
  on-background: '#161d1d'
  surface-variant: '#dde4e4'
  teal-deep: '#1E6A74'
  teal-mist: '#B5DDDF'
  indigo-accent: '#525BA2'
  ink-muted: rgba(6, 6, 6, 0.6)
  border-light: rgba(6, 6, 6, 0.12)
typography:
  display-lg:
    fontFamily: Tajawal
    fontSize: 56px
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Tajawal
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Tajawal
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Tajawal
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Tajawal
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.75'
  body-md:
    fontFamily: Tajawal
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  technical-label:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.18em
  latin-brand:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  section-gap: 5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is built on the intersection of retail excellence and technical precision. It caters to a tech-savvy Jordanian audience that values both premium hardware and reliable maintenance. The UI evokes a sense of "Professional Concrete"—it is informative, structured, and trustworthy, avoiding fluffy marketing language in favor of technical specifications and service guarantees.

The visual style is **Corporate / Modern** with a high-contrast luxury edge. It uses deep "Ink" surfaces to allow hardware photography to pop, balanced by the "Teal" brand color which signals approachability and freshness. The Arabic-first hierarchy ensures that the reading flow is natural for the primary market, while the integration of monospaced fonts for technical data creates a "dashboard" feel that appeals to computer enthusiasts.

## Colors

This design system adheres to a strict **60/30/10 distribution rule** to maintain a premium feel:
- **60% Neutrals:** Utilizes `#F4FAFA` (Paper) for light grounds and `#060606` (Ink) for high-contrast sections and primary text.
- **30% Teal & Mist:** `#66C0C9` is the primary interactive color. For small text (under 24px) on light backgrounds, use the safe `#1E6A74` (Teal-Deep) to ensure WCAG AA compliance.
- **10% Gold & Indigo:** `#E1CF7E` (Gold) is reserved exclusively for "Genuine" badges, warranty markers, and premium accents. Indigo is used only within the signature brand gradient.

**Signature Gradient:** `linear-gradient(135deg, #B5DDDF 0%, #66C0C9 45%, #525BA2 100%)`

## Typography

The typography system is tri-lingual in spirit, though Arabic-first in execution. 
- **Tajawal** handles all primary Arabic communication, using heavy weights for headings to convey the "Concrete" brand voice.
- **Poppins** is used specifically for Latin brand names (e.g., "iPhone", "MacBook") and device models to ensure they look distinct from the surrounding text.
- **IBM Plex Mono** is the "Technical Voice." It is used for all numbers, prices, SKUs, and specification tables. This adds a layer of precision to the service-oriented sections of the UI.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (12 columns) and a fluid 2-column grid on mobile. 

**The Maintenance Peer Rule:**
In the category grid, "Maintenance & Repair" must occupy a top-level slot with equal visual weight to "Mobile Phones" or "Laptops." This is achieved through large, icon-driven tiles.

**Information Density:**
While the brand is premium, the technical nature requires information-dense areas. Use "Stacks" (vertical auto-layouts) for specs, with `stack-sm` for related attributes and `stack-md` for distinct groups.

## Elevation & Depth

The system uses **Tonal Layers** rather than heavy shadows to maintain a clean, professional look. 
- **Level 0 (Ground):** `#F4FAFA` (Paper).
- **Level 1 (Cards):** White surfaces with a subtle `1px solid rgba(6, 6, 6, 0.12)` border.
- **Level 2 (Inlays):** `#B5DDDF` (Mist) used for secondary fields or inset areas within cards.

**Shadow Character:**
When shadows are necessary (e.g., hovering on a product card), use an ambient, low-opacity ink shadow: `0 12px 32px rgba(6, 6, 6, 0.06)`.

## Shapes

The shape language balances modern softness with technical structure. 
- **Large Containers:** Hero sections and primary banners use `22px` (`--r-lg`).
- **Standard Components:** Product cards, category tiles, and maintenance forms use `16px` (`--r-md`).
- **Interactive Small Elements:** Input fields and badges use `10px` (`--r-sm`).
- **Status Pills:** Price tags and stock indicators use a full pill radius (`999px`).

## Components

### Product Cards
Must feature an image container, a "Technical Label" using IBM Plex Mono for the category, and a clear price in the same font. The "Service Intersection" is represented by a small "Repair Available" badge on products Roze services in-house.

### Buttons
- **Primary:** Solid `#66C0C9` with white text (for size > 24px) or `#060606` text. 
- **Secondary:** Transparent with a 2px border of `#66C0C9`.
- **Maintenance Action:** Uses the signature gradient to distinguish service-related CTAs from sales CTAs.

### Badges (The Gold Standard)
Badges for "Certified," "Genuine," or "Extended Warranty" use the Gold (`#E1CF7E`) color. These are kept small and rare to maintain impact.

### Input Fields & Booking Forms
Clean, light fields using `#B5DDDF` for backgrounds on focus. Labels must be Tajawal 700. For maintenance booking, include a "Technical Spec" style summary at the bottom of the form to confirm device details before submission.

### Maintenance Tracker
A specific component showing the status of a repair (e.g., "Diagnostic", "Parts Ordered", "Ready for Pickup"). It uses a horizontal step-indicator with the primary Teal color and Mono numbers for the repair ID.