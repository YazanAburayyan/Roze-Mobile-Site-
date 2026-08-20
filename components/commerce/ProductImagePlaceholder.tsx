import type { LucideIcon } from "lucide-react";
import { Smartphone, Shield, Zap, Laptop, Mouse, Gamepad2, Headphones, Wrench } from "lucide-react";

/**
 * Keyed by `Category.icon` (see prisma/schema.prisma) — a lucide-react icon
 * name chosen per category at seed time, e.g. "smartphone", "gamepad-2".
 * Kept as a closed map (not a dynamic lucide lookup) so an unexpected string
 * in the database can never resolve to an arbitrary icon.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  shield: Shield,
  zap: Zap,
  laptop: Laptop,
  mouse: Mouse,
  "gamepad-2": Gamepad2,
  headphones: Headphones,
  wrench: Wrench,
};

/** Deterministic 0..buckets-1 index from a string — stable across server and
 * client renders (no Math.random), so the same product always gets the same
 * quiet tonal variant instead of flickering on hydration. */
function hashIndex(seed: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % buckets;
}

/** Very small steps — enough that a 12-tile grid of the same category does
 * not read as one stamp repeated, quiet enough that nobody notices the grid
 * is "patterned" rather than photographed. */
const WASH_OPACITY = ["opacity-[0.035]", "opacity-[0.055]", "opacity-[0.075]"] as const;

export interface ProductImagePlaceholderProps {
  /** `product.category.icon` — a lucide-react icon name. Falls back to a
   * generic phone glyph when missing or unrecognized. */
  categoryIcon?: string | null;
  /** Any stable per-product value (SKU works well). Only used to pick a
   * quiet tonal variant — never rendered, never a source of randomness. */
  seed: string;
}

/**
 * The "no photography yet" state for a product tile. A warm card surface, a
 * faint diagonal hairline field, a soft brand ring-gradient wash, and a
 * category-appropriate glyph in low-opacity teal-deep — never a grey box,
 * never a "broken image" look, and never a redraw of the ROZE mark (no
 * circles or rings echoing the logo).
 *
 * Purely decorative: the enclosing card link already carries the accessible
 * name (sr-only product title), so this is `aria-hidden`.
 */
export function ProductImagePlaceholder({ categoryIcon, seed }: ProductImagePlaceholderProps) {
  const Icon = (categoryIcon && CATEGORY_ICONS[categoryIcon]) || Smartphone;
  const washOpacity = WASH_OPACITY[hashIndex(seed, WASH_OPACITY.length)];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface" aria-hidden="true">
      <div className={`absolute inset-0 bg-[image:var(--roze-ring)] ${washOpacity}`} />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--color-line)_0px,var(--color-line)_1px,transparent_1px,transparent_14px)] opacity-70" />
      <Icon className="relative size-14 text-teal-deep/25 sm:size-16" strokeWidth={1.25} />
    </div>
  );
}
