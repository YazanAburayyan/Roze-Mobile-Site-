'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/components/ui';

/**
 * Switches between `/` (Arabic) and `/en` while preserving the current path
 * AND query string. A customer three filters deep into a category page must
 * land on the same filtered page in the other language, not get thrown back
 * to the homepage.
 *
 * `usePathname` here is next-intl's — it already strips the locale prefix,
 * so the same `pathname` value works as the target `href` for both links.
 */
export function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-sm border border-line text-small font-medium',
        className
      )}
      role="group"
      aria-label={t('localeSwitch')}
    >
      <Link
        href={{ pathname, query }}
        locale="ar"
        aria-current={locale === 'ar' ? 'true' : undefined}
        className={cn(
          'rounded-s-sm px-2.5 py-1.5 transition-colors motion-reduce:transition-none',
          locale === 'ar' ? 'bg-teal-deep text-paper' : 'text-muted hover:bg-mist'
        )}
      >
        عربي
      </Link>
      <Link
        href={{ pathname, query }}
        locale="en"
        aria-current={locale === 'en' ? 'true' : undefined}
        className={cn(
          'rounded-e-sm px-2.5 py-1.5 transition-colors motion-reduce:transition-none',
          locale === 'en' ? 'bg-teal-deep text-paper' : 'text-muted hover:bg-mist'
        )}
      >
        EN
      </Link>
    </div>
  );
}
