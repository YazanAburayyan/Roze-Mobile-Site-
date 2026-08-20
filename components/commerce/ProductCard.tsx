"use client";

import type * as React from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import type { listProducts } from "@/lib/catalog";
import { PLACEHOLDER_IMAGE, productImageUrl } from "@/lib/product-image";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/components/ui";
import { PriceDisplay } from "./PriceDisplay";
import { StockBadge } from "./StockBadge";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

export type ProductCardProduct = Awaited<ReturnType<typeof listProducts>>["products"][number];

export interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
}

/**
 * The whole card is one link to the product page — a customer must be able
 * to open an out-of-stock product and send a WhatsApp enquiry from there.
 * Only the buy controls are disabled when out of stock. The link is layered
 * as a full-bleed overlay (block-link pattern) so the buttons can sit above
 * it without nesting a <button> inside an <a>.
 *
 * TWO ACTIONS, as in the reference layout: add to cart, and buy now. "Buy
 * now" is genuine here — it adds the item and goes straight to checkout,
 * rather than being a second label for the same thing.
 *
 * NOT SHOWN, deliberately: a star rating. There are no per-product reviews;
 * the 4.5 on the homepage is a shop-level Google rating and printing stars
 * per product would be a fabricated claim.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const add = useCart((state) => state.add);

  const title = locale === "ar" ? product.titleAr : product.titleEn;
  const image = product.images[0];
  const imageAlt = image ? (locale === "ar" ? image.altAr : image.altEn) : title;
  const imageSrc = productImageUrl(image);
  const hasPhoto = imageSrc !== PLACEHOLDER_IMAGE;

  const router = useRouter();
  const shortDescription =
    locale === "ar" ? product.shortDescAr : product.shortDescEn;
  const categoryName =
    locale === "ar" ? product.category.nameAr : product.category.nameEn;

  function addToCart() {
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

  function handleBuyNow(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!product.inStock) return;
    addToCart();
    router.push("/checkout");
  }

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
        "group relative flex flex-col overflow-hidden rounded-md border border-line bg-surface shadow-roze",
        "transition-transform duration-300 ease-out hover:-translate-y-1",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
    >
      {/* Deepens on hover via opacity only, layered under the shadow-roze
          base above, so the "lift" reads as transform + opacity, never a
          transitioned box-shadow. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-md opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      />

      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-10 rounded-md focus-visible:outline-none"
      >
        <span className="sr-only">{title}</span>
      </Link>

      <div className="relative aspect-square w-full overflow-hidden border-b border-line bg-surface p-3">
        {hasPhoto ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <ProductImagePlaceholder categoryIcon={product.category.icon} seed={product.sku} />
        )}
        {!product.inStock ? (
          <div className="absolute inset-0 bg-paper/50" aria-hidden="true" />
        ) : null}
        {/* Category chip, as in the reference. Real data, not a decorative
            label — it names the category the product actually sits in. */}
        <span className="absolute end-2 top-2 max-w-[70%] truncate rounded-full bg-sand/90 px-2.5 py-1 text-small text-muted backdrop-blur-sm">
          {categoryName}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5 p-4 text-center">
        {product.brand ? (
          <span lang="en" className="font-latin text-small font-medium text-muted">
            {product.brand.name}
          </span>
        ) : null}

        <h3 className="line-clamp-2 text-body font-medium text-ink">{title}</h3>

        {/* The reference put a short spec line under the title. shortDesc is
            real per-product copy from the catalogue; the SKU is the fallback
            so the slot is never empty and the cards stay the same height. */}
        {shortDescription ? (
          <p className="line-clamp-2 text-small leading-snug text-muted">
            {shortDescription}
          </p>
        ) : (
          <span dir="ltr" className="font-mono text-small text-muted">
            {product.sku}
          </span>
        )}

        {/* Bottom row mirrors the reference's rating-left / price-right rhythm.
            The left slot is STOCK, not stars: there are no per-product reviews
            and the 4.5 on the homepage is a shop-level Google rating, so a star
            row here would be a fabricated claim. Stock is the fact a shopper
            actually needs at a glance. */}
        <div className="mt-auto flex w-full items-center justify-between gap-2 pt-3">
          <StockBadge inStock={product.inStock} stockQuantity={product.stockQuantity} />
          <PriceDisplay
            priceFils={product.price}
            compareAtPriceFils={product.compareAtPrice}
            size="sm"
            className="justify-end text-end"
          />
        </div>

        {/* Actions stay out of the way on pointer devices, as in the reference,
            but reveal on hover AND on focus-within so they remain keyboard
            reachable. Below lg (touch, where there is no hover) they are
            always visible — a hover-only buy button is unusable on a phone. */}
        <div
          className={cn(
            "flex w-full flex-col gap-2 pt-3",
            "lg:opacity-0 lg:transition-opacity lg:duration-200",
            "lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
            "motion-reduce:lg:transition-none"
          )}
        >
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              "relative z-20 inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full border px-3 text-small font-medium transition-colors motion-reduce:transition-none",
              product.inStock
                ? "border-line bg-surface text-ink hover:bg-mist"
                : "cursor-not-allowed border-line bg-sand text-muted"
            )}
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {product.inStock ? tCommon("addToCart") : t("outOfStock")}
            </span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className={cn(
              "relative z-20 inline-flex h-9 min-w-0 items-center justify-center rounded-full px-3 text-small font-medium transition-colors motion-reduce:transition-none",
              product.inStock
                ? "bg-ink text-paper hover:bg-teal-deep"
                : "cursor-not-allowed bg-sand text-muted"
            )}
          >
            <span className="truncate">{tCommon("buyNow")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
