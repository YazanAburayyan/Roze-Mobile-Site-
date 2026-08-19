'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import type { SearchDoc } from '@/lib/catalog';
import { PriceDisplay } from '@/components/commerce/PriceDisplay';
import { StockBadge } from '@/components/commerce/StockBadge';

export interface SearchResultCardProps {
  doc: SearchDoc;
}

/**
 * A search hit isn't a full `ProductWithRelations` — `SearchDoc` carries only
 * what the index needs (see lib/catalog.ts), not stock quantity or every
 * image. So this is a small purpose-built card rather than a reuse of
 * `ProductCard`, but it borrows `PriceDisplay` and `StockBadge` rather than
 * re-implementing price formatting or stock wording.
 */
export function SearchResultCard({ doc }: SearchResultCardProps) {
  const locale = useLocale() as Locale;
  const title = locale === 'ar' ? doc.titleAr : doc.titleEn;

  return (
    <Link
      href={`/product/${doc.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-paper shadow-roze transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-deep"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-mist/40">
        <Image
          src={doc.image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {!doc.inStock ? <div className="absolute inset-0 bg-paper/50" aria-hidden="true" /> : null}
        <div className="absolute start-2 top-2 flex flex-col items-start gap-1">
          <StockBadge inStock={doc.inStock} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {doc.brand ? (
          <span lang="en" className="font-latin text-small font-medium text-muted">
            {doc.brand}
          </span>
        ) : null}

        <h3 className="line-clamp-2 text-body font-medium text-ink">{title}</h3>

        <div className="mt-auto">
          <PriceDisplay priceFils={doc.priceFils} compareAtPriceFils={doc.compareAtPriceFils} size="sm" />
        </div>
      </div>
    </Link>
  );
}
