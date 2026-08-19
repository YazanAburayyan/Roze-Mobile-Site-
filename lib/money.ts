import { currency } from './site';
import type { Locale } from '@/i18n/routing';

/**
 * Money in this codebase is ALWAYS an integer number of fils.
 *
 * 1 JOD = 1000 fils. Prices, subtotals, shipping and order lines are all stored
 * and computed as integers so no float rounding error can ever reach a customer
 * or an order record. Convert to a decimal string only at the point of display,
 * which is what this module is for.
 *
 * Jordanian convention prints three decimals: 249.500, not 249.50.
 */

export const FILS_PER_DINAR = 1000;

/** 249500 -> "249.500" */
export function formatFils(fils: number): string {
  const negative = fils < 0;
  const abs = Math.abs(Math.round(fils));
  const dinars = Math.floor(abs / FILS_PER_DINAR);
  const remainder = abs % FILS_PER_DINAR;

  const grouped = dinars.toLocaleString('en-US');
  const decimals = String(remainder).padStart(currency.decimals, '0');

  return `${negative ? '-' : ''}${grouped}.${decimals}`;
}

/**
 * Full price with its symbol, e.g. "د.أ 249.500" / "JOD 249.500".
 *
 * The numeral itself always renders LTR in IBM Plex Mono — Arabic RTL context
 * must never reorder the digits or push the symbol to the wrong side of the
 * number. Components render this inside a `[data-numeric]` element with
 * `dir="ltr"`; see PriceDisplay.
 */
export function formatPrice(fils: number, locale: Locale): string {
  return `${currency.symbol[locale]} ${formatFils(fils)}`;
}

/** Whole-dinar shorthand for ranges, e.g. repair prices: "15 – 40". */
export function formatDinarRange(
  minFils: number | null | undefined,
  maxFils: number | null | undefined,
): string | null {
  if (minFils == null && maxFils == null) return null;
  if (minFils != null && maxFils != null) {
    return `${formatFils(minFils)} – ${formatFils(maxFils)}`;
  }
  return formatFils((minFils ?? maxFils) as number);
}

/**
 * Discount percentage, floored — never round a 24.7% saving up to 25%.
 * Returns null when there is no genuine discount to advertise.
 */
export function discountPercent(
  price: number,
  compareAtPrice: number | null | undefined,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const pct = Math.floor(((compareAtPrice - price) / compareAtPrice) * 100);
  return pct > 0 ? pct : null;
}
