"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { localeDirection } from "@/i18n/routing";
import { productImageUrl } from "@/lib/product-image";
import { cn } from "@/components/ui";

export interface ProductGalleryImage {
  url: string;
  altAr: string;
  altEn: string;
}

export interface ProductGalleryProps {
  images: ProductGalleryImage[];
  /** Used as the alt fallback and the gallery's accessible name. */
  productTitle: string;
  className?: string;
}

/**
 * Main image + thumbnail strip. Arrow-key navigation respects reading
 * direction: in RTL, ArrowLeft moves to the NEXT image (visually forward),
 * matching how the thumbnails are laid out on screen.
 */
export function ProductGallery({ images, productTitle, className }: ProductGalleryProps) {
  const locale = useLocale() as Locale;
  const direction = localeDirection[locale];
  const t = useTranslations("a11y");

  const [activeIndex, setActiveIndex] = React.useState(0);
  const hasMultiple = images.length > 1;
  const active = images[activeIndex];

  function goTo(index: number) {
    setActiveIndex(((index % images.length) + images.length) % images.length);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!hasMultiple) return;

    const isRtl = direction === "rtl";
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex + (isRtl ? 1 : -1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + (isRtl ? -1 : 1));
    }
  }

  const activeAlt = active
    ? locale === "ar"
      ? active.altAr
      : active.altEn
    : productTitle;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="group"
        aria-label={t("productImageGallery")}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative aspect-square w-full overflow-hidden rounded-md border border-line bg-mist/40 outline-none focus-visible:ring-0"
      >
        <Image
          src={productImageUrl(active)}
          alt={activeAlt || productTitle}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      {hasMultiple ? (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            const thumbAlt = locale === "ar" ? image.altAr : image.altEn;
            return (
              <button
                key={image.url + index}
                type="button"
                aria-label={t("selectImageNumber", { number: index + 1 })}
                aria-current={isActive}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-sm border bg-mist/40 transition-colors motion-reduce:transition-none",
                  isActive ? "border-teal-deep" : "border-line hover:border-teal-deep/50"
                )}
              >
                <Image
                  src={productImageUrl(image)}
                  alt={thumbAlt || productTitle}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
