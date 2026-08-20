/**
 * The homepage section map.
 *
 * One list, consumed by the desktop header nav and the mobile drawer, so the
 * two can never drift apart. Each entry is an in-page anchor: the homepage
 * renders a section with the matching `id`, which is what keeps the top-level
 * menu to five items instead of a category tree.
 *
 * `href` points at the homepage anchor rather than a bare `#id` so the links
 * still work from an interior page (a customer on a product page who taps
 * "Contact" lands on the homepage contact block rather than nowhere).
 */
export type HomeSection = {
  id: string;
  href: string;
  /** Full next-intl key, e.g. `nav.about`. */
  labelKey: string;
};

export const HOME_SECTIONS: readonly HomeSection[] = [
  { id: 'top', href: '/', labelKey: 'nav.home' },
  { id: 'about', href: '/#about', labelKey: 'nav.about' },
  { id: 'shop', href: '/#shop', labelKey: 'nav.shop' },
  { id: 'services', href: '/#services', labelKey: 'nav.maintenance' },
  { id: 'contact', href: '/#contact', labelKey: 'nav.contact' },
] as const;
