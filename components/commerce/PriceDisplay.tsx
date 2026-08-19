import { useTranslations, useLocale } from "next-intl";
import { formatPrice, discountPercent } from "@/lib/money";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/components/ui";

export type PriceDisplaySize = "sm" | "md" | "lg";

export interface PriceDisplayProps {
  /** Current price in integer fils. */
  priceFils: number;
  /** "Was" price in integer fils, when the product is discounted. */
  compareAtPriceFils?: number | null;
  size?: PriceDisplaySize;
  className?: string;
}

const currentSizeClasses: Record<PriceDisplaySize, string> = {
  sm: "text-body",
  md: "text-h3",
  lg: "text-h2",
};

const compareSizeClasses: Record<PriceDisplaySize, string> = {
  sm: "text-small",
  md: "text-small",
  lg: "text-body",
};

/**
 * Jordanian-convention price: symbol + three decimals, e.g. "د.أ 249.500".
 * The numeral always renders LTR in IBM Plex Mono, even inside Arabic RTL
 * text — otherwise bidi reordering breaks the digits and misplaces the
 * currency symbol. When there's a genuine discount, the old price is struck
 * through and muted next to a prominent new price and a discount badge.
 */
export function PriceDisplay({
  priceFils,
  compareAtPriceFils,
  size = "md",
  className,
}: PriceDisplayProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");

  const percent = discountPercent(priceFils, compareAtPriceFils);
  const hasDiscount = percent != null;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        dir="ltr"
        data-numeric
        className={cn(
          "font-mono font-medium tabular-nums text-ink",
          currentSizeClasses[size]
        )}
      >
        {formatPrice(priceFils, locale)}
      </span>

      {hasDiscount ? (
        <>
          <span
            dir="ltr"
            data-numeric
            className={cn(
              "font-mono tabular-nums text-muted line-through",
              compareSizeClasses[size]
            )}
          >
            {formatPrice(compareAtPriceFils as number, locale)}
          </span>
          <span
            dir="ltr"
            data-numeric
            className="inline-flex items-center rounded-sm bg-danger/10 px-1.5 py-0.5 font-mono text-small font-medium text-danger"
          >
            {t("discount", { percent })}
          </span>
        </>
      ) : null}
    </div>
  );
}
