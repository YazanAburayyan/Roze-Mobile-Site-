'use client';

import * as React from 'react';
import { Menu, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { Drawer, cn } from '@/components/ui';
import { phones, whatsapp } from '@/lib/site';
import { whatsappUrl } from '@/lib/whatsapp';
import type { ShopStatus } from '@/lib/hours';
import { OpenStatusBadge } from './OpenStatusBadge';
import type { MegaMenuCategory } from './MegaMenu';

function categoryName(category: { nameAr: string; nameEn: string }, locale: Locale): string {
  return locale === 'ar' ? category.nameAr : category.nameEn;
}

/**
 * The mobile navigation trigger + drawer.
 *
 * Reuses the `Drawer` primitive with `side="inline-start"` — a logical edge,
 * so it slides in from the right in Arabic and the left in English with no
 * locale branching here.
 *
 * Every top-level category renders as an equally-weighted row, maintenance
 * included: same icon size, same row height, same font weight. It is only
 * expandable (an accordion row) when it actually has children — maintenance
 * currently has none, so it is a plain link, not a demoted one.
 */
export function MobileNav({
  categories,
  initialStatus,
  className,
}: {
  categories: MegaMenuCategory[];
  initialStatus: ShopStatus;
  className?: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [open, setOpen] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('a11y.openMenu')}
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-ink transition-colors hover:bg-mist motion-reduce:transition-none lg:hidden',
          className
        )}
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={t('a11y.mainNavigation')}
        side="inline-start"
        closeLabel={t('a11y.closeMenu')}
      >
        <div className="flex flex-col gap-6">
          <div>
            <OpenStatusBadge initialStatus={initialStatus} />
          </div>

          <nav aria-label={t('a11y.mainNavigation')}>
            <ul className="flex flex-col divide-y divide-line">
              {categories.map((category) => {
                const hasChildren = category.children.length > 0;
                const isExpanded = expandedId === category.id;
                const label = categoryName(category, locale);

                if (!hasChildren) {
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center py-3 text-h3 font-medium text-ink"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedId(isExpanded ? null : category.id)}
                      className="flex w-full items-center justify-between py-3 text-h3 font-medium text-ink"
                    >
                      {label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'size-4 text-muted transition-transform motion-reduce:transition-none',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                    {isExpanded ? (
                      <ul className="flex flex-col gap-1 pb-3 ps-2">
                        <li>
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-sm px-2 py-2 text-small font-semibold text-teal-deep"
                          >
                            {t('nav.allCategories')}
                          </Link>
                        </li>
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/category/${category.slug}/${child.slug}`}
                              onClick={() => setOpen(false)}
                              className="block rounded-sm px-2 py-2 text-small text-ink"
                            >
                              {categoryName(child, locale)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <span className="eyebrow">{t('header.callUs')}</span>
            <a
              href={`tel:${phones.showroom.e164}`}
              className="flex items-center gap-2 text-body text-ink"
            >
              <Phone aria-hidden="true" className="size-4 text-teal-deep" />
              <span>{phones.showroom.purpose[locale]}</span>
              <span dir="ltr" data-numeric className="text-muted">
                {phones.showroom.display}
              </span>
            </a>
            <a
              href={`tel:${phones.service1.e164}`}
              className="flex items-center gap-2 text-body text-ink"
            >
              <Phone aria-hidden="true" className="size-4 text-teal-deep" />
              <span>{phones.service1.purpose[locale]}</span>
              <span dir="ltr" data-numeric className="text-muted">
                {phones.service1.display}
              </span>
            </a>
            <a
              href={whatsappUrl(whatsapp.sales, t('header.whatsapp'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-body text-ink"
            >
              <MessageCircle aria-hidden="true" className="size-4 text-teal-deep" />
              <span>{t('header.whatsapp')}</span>
            </a>
          </div>
        </div>
      </Drawer>
    </>
  );
}
