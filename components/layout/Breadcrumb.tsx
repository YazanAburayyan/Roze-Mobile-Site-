import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { cn } from '@/components/ui';
import type { Locale } from '@/i18n/routing';

export type BreadcrumbItem = { label: string; href: string };

/**
 * Server component. `<nav>` + `<ol>` semantics, `aria-label` from the a11y
 * namespace, and the last item rendered as the current page (a `<span>`
 * with `aria-current="page"`, not a link to itself).
 *
 * The separator glyph is chosen by locale rather than CSS-mirrored: Arabic
 * gets `ChevronLeft`, English gets `ChevronRight`, so the arrow always points
 * toward the next crumb in reading order with no transform hacks.
 */
export async function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  /**
   * Callers that already sit inside a `.wrap` pass their own spacing. The
   * default keeps the standalone behaviour the other pages rely on.
   */
  className?: string;
}) {
  const t = await getTranslations('a11y');
  const locale = (await getLocale()) as Locale;
  const Separator = locale === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label={t('breadcrumb')} className={cn(className ?? 'wrap py-3')}>
      <ol className="flex flex-wrap items-center gap-1.5 text-small text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <Separator aria-hidden="true" className="size-3.5" /> : null}
              {isLast ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-teal-deep motion-reduce:transition-none">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
