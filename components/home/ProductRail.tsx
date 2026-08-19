import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ProductCard, type ProductCardProduct } from '@/components/commerce';

export interface ProductRailProps {
  eyebrow?: string;
  heading: string;
  products: ProductCardProduct[];
  viewAllHref?: string;
}

/**
 * A horizontally-scrolling product rail. Renders nothing when the query
 * behind it came back empty — no section may show an empty heading, per the
 * brief, even though the seed data means this should never actually happen
 * (48 products, 28 discounted, 8 new arrivals).
 */
export async function ProductRail({ eyebrow, heading, products, viewAllHref }: ProductRailProps) {
  if (products.length === 0) return null;
  const t = await getTranslations('common');

  return (
    <section className="wrap py-10 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2 className="text-h2 text-ink">{heading}</h2>
        </div>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="hidden shrink-0 text-small font-medium text-teal-deep hover:underline sm:inline-block"
          >
            {t('viewAll')}
          </Link>
        ) : null}
      </div>

      <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="min-w-[65%] shrink-0 snap-start sm:min-w-0 sm:shrink"
          />
        ))}
      </div>

      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="mt-4 inline-block text-small font-medium text-teal-deep hover:underline sm:hidden"
        >
          {t('viewAll')}
        </Link>
      ) : null}
    </section>
  );
}
