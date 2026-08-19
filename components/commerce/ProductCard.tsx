"use client";

import type * as React from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import type { listProducts } from "@/lib/catalog";
import { productImageUrl } from "@/lib/product-image";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/components/ui";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";

export type ProductCardProduct = Awaited<ReturnType<typeof listProducts>>["products"][number];

export interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
}

/**
 * The whole card is one link to the product page — a customer must be able
 * to open an out-of-stock product and send a WhatsApp enquiry from there.
 * Only the add-to-cart button is disabled when out of stock. The link is
 * layered as a full-bleed overlay (block-link pattern) so the cart button
 * can sit above it without nesting a <button> inside an <a>.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const add = useCart((state) => state.add);

  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const image = product.images[0];
  const imageAlt = image ? (locale === "ar" ? image.altAr : image.altEn) : title;

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!product.inStock) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        titleAr: product.titleAr,
        titleEn: product.titleEn,
        unitPriceFils: product.price,
        compareAtPriceFils: product.compareAtPrice,
        image: productImageUrl(image),
        maxQuantity: product.stockQuantity,
      },
      1
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-line bg-paper shadow-roze",
        className
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-10 rounded-md focus-visible:outline-none"
      >
        <span className="sr-only">{title}</span>
      </Link>

      <div className="relative aspect-square w-full overflow-hidden bg-mist/40">
        <Image
          src={productImageUrl(image)}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {!product.inStock ? (
          <div className="absolute inset-0 bg-paper/50" aria-hidden="true" />
        ) : null}
        <div className="absolute start-2 top-2 flex flex-col items-start gap-1">
          <StockBadge inStock={product.inStock} stockQuantity={product.stockQuantity} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand ? (
          <span lang="en" className="font-latin text-small font-medium text-muted">
            {product.brand.name}
          </span>
        ) : null}

        <h3 className="line-clamp-2 text-body font-medium text-ink">{title}</h3>

        <div className="mt-auto flex flex-col gap-3">
          <PriceDisplay
            priceFils={product.price}
            compareAtPriceFils={product.compareAtPrice}
            size="sm"
          />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={t("addToCart")}
            className={cn(
              "relative z-20 inline-flex h-10 items-center justify-center gap-2 rounded-sm font-latin text-small font-medium transition-colors motion-reduce:transition-none",
              product.inStock
                ? "bg-teal text-ink hover:bg-teal-deep hover:text-paper"
                : "cursor-not-allowed bg-mist/60 text-muted"
            )}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            {product.inStock ? tCommon("addToCart") : t("outOfStock")}
          </button>
        </div>
      </div>
    </div>
  );
}
