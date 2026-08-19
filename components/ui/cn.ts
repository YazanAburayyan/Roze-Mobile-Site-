/**
 * Tiny className joiner. clsx/cva are intentionally not installed for this
 * project — this is a minimal local replacement that filters falsy values.
 */
export type ClassValue = string | number | null | undefined | false;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
