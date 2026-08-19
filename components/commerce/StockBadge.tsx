import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";

export interface StockBadgeProps {
  inStock: boolean;
  stockQuantity?: number;
  /** At or below this quantity, show the "only N left" state. */
  lowStockThreshold?: number;
  className?: string;
}

/**
 * Out-of-stock must be unmistakable — the `danger` badge variant, not a
 * subtle grey. Low stock is a nudge (still teal), in-stock is calm (neutral).
 */
export function StockBadge({
  inStock,
  stockQuantity,
  lowStockThreshold = 5,
  className,
}: StockBadgeProps) {
  const t = useTranslations("product");

  if (!inStock) {
    return (
      <Badge variant="danger" className={className}>
        {t("outOfStock")}
      </Badge>
    );
  }

  const isLowStock =
    stockQuantity != null && stockQuantity > 0 && stockQuantity <= lowStockThreshold;

  if (isLowStock) {
    return (
      <Badge variant="teal" className={className}>
        {t("onlyLeftCount", { count: stockQuantity })}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" className={className}>
      {t("inStock")}
    </Badge>
  );
}
