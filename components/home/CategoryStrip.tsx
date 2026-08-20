import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { getTopLevelCategories } from '@/lib/catalog';
import { resolveCategoryIcon } from '@/components/commerce/CategoryTile';

/**
 * The four top-level categories as substantial tiles — doors into the
 * catalogue, not the small weak chips they used to be.
 *
 * Maintenance is one of the four and is styled identically to the three sales
 * categories. That equal treatment is a brand requirement, and the surest way
 * to guarantee it is to never special-case it. It routes to /maintenance
 * because it has no sellable products of its own.
 *
 * The glyph sits in a small mist chip; the tile itself stays on the warm card
 * surface. Teal is an accent here, never the tile ground — a page of teal
 * panels is what made the previous design swim in one hue.
 */
export async function CategoryStrip() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const categories = await getTopLevelCategories();

  if (categories.length === 0) return null;

  // "Next" points toward reading direction: left in Arabic, right in English.
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="shop" className="band-paper scroll-mt-24">
      <div className="wrap py-12 lg:py-16">
        <h2 className="text-h2 text-ink">{t('nav.allCategories')}</h2>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const label = locale === 'ar' ? category.nameAr : category.nameEn;
            const href =
              category.slug === 'maintenance' ? '/maintenance' : `/category/${category.slug}`;
            const Icon = resolveCategoryIcon(category.icon);

            // Child names double as a plain description of what is inside,
            // so nothing has to be written or translated per category.
            const children = category.children
              .slice(0, 3)
              .map((c) => (locale === 'ar' ? c.nameAr : c.nameEn))
              .join(' · ');

            return (
              <Link
                key={category.id}
                href={href}
                className="group flex min-h-44 flex-col justify-between rounded-md border border-line bg-surface p-5 shadow-roze transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-sm bg-mist">
                  <Icon aria-hidden="true" className="size-5 text-teal-deep" strokeWidth={1.75} />
                </span>

                <span className="mt-6 block">
                  <span className="block text-h3 text-ink">{label}</span>
                  {children ? (
                    <span className="mt-1 block text-small leading-snug text-muted">
                      {children}
                    </span>
                  ) : null}
                </span>

                <span className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-teal-deep">
                  {t('common.viewAll')}
                  <Arrow
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0 motion-reduce:transition-none"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
