import { getTranslations, getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getTopLevelCategories } from '@/lib/catalog';
import { CategoryTile } from '@/components/commerce';

/**
 * The four top-level categories, all rendered through the same CategoryTile
 * at the same size. Maintenance is one of the four rows in the catalogue
 * (see lib/catalog getTopLevelCategories) and gets no special styling here —
 * that equal treatment is the point: the brand brief calls out maintenance
 * as a top-level peer, not a footnote, and the surest way to guarantee equal
 * weight is to never special-case it visually.
 *
 * Maintenance has no sellable products of its own, so its tile routes to the
 * dedicated /maintenance booking page rather than an empty product listing.
 */
export async function CategoryStrip() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const categories = await getTopLevelCategories();

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="wrap py-10 lg:py-16">
      <span className="eyebrow">{t('home.categories')}</span>
      <h2 className="text-h2 text-ink">{t('nav.allCategories')}</h2>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((category) => {
          const label = locale === 'ar' ? category.nameAr : category.nameEn;
          const href = category.slug === 'maintenance' ? '/maintenance' : `/category/${category.slug}`;
          return <CategoryTile key={category.id} href={href} label={label} icon={category.icon} />;
        })}
      </div>
    </section>
  );
}
