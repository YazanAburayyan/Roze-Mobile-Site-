'use client';

import * as React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { createSearchProvider } from '@/lib/search';
import type { SearchDoc } from '@/lib/catalog';
import { whatsapp } from '@/lib/site';
import { whatsappUrl, searchEnquiryMessage } from '@/lib/whatsapp';
import { buttonClasses, cn } from '@/components/ui';
import { SearchResultCard } from './SearchResultCard';

export interface SearchResultsProps {
  docs: SearchDoc[];
  initialQuery: string;
}

/** How long to wait after the last keystroke before re-running search / touching the URL. */
const DEBOUNCE_MS = 120;
const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 24;

/**
 * Instant, as-you-type search over the catalogue.
 *
 * The Fuse provider is built once (`useMemo`) from the docs the server
 * fetched — never rebuilt on keystroke. The input value updates the DOM
 * immediately for a responsive feel; the actual search + URL sync run off a
 * debounced copy of the query so a fast typist doesn't thrash re-renders or
 * fill the browser history with every keystroke (`router.replace`, not
 * `push`).
 */
export function SearchResults({ docs, initialQuery }: SearchResultsProps) {
  const t = useTranslations('search');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const provider = React.useMemo(() => createSearchProvider(docs), [docs]);

  const [query, setQuery] = React.useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);

  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  React.useEffect(() => {
    const trimmed = debouncedQuery.trim();
    const nextUrl = trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname;
    router.replace(nextUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, pathname]);

  const trimmedQuery = debouncedQuery.trim();
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const results = React.useMemo(() => {
    if (!hasQuery) return [];
    return provider.search(debouncedQuery, RESULT_LIMIT);
  }, [provider, debouncedQuery, hasQuery]);

  const waHref = whatsappUrl(whatsapp.sales, searchEnquiryMessage(trimmedQuery, locale));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-h1">{t('pageTitle')}</h1>

        <div className="relative max-w-md">
          <label htmlFor="roze-search-page-input" className="sr-only">
            {t('placeholder')}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
          />
          <input
            id="roze-search-page-input"
            name="q"
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('placeholder')}
            className={cn(
              'h-11 w-full rounded-sm border border-line bg-mist/40 ps-9 pe-3 text-body text-ink',
              'placeholder:text-muted outline-none transition-colors focus:border-teal-deep',
              'motion-reduce:transition-none'
            )}
          />
        </div>

        {hasQuery ? (
          <p aria-live="polite" className="text-small text-muted">
            {t('resultsCount', { count: results.length })}
          </p>
        ) : null}
      </header>

      {!hasQuery ? (
        <p className="text-body text-muted">{t('typeToSearch')}</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((hit) => (
            <SearchResultCard key={hit.doc.id} doc={hit.doc} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border border-line bg-paper p-10 text-center shadow-roze">
          <p className="text-h3">{t('noResults', { query: trimmedQuery })}</p>
          <p className="text-body text-muted">{t('noResultsAction')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={buttonClasses({ variant: 'outline' })}>
              {t('browseCategoriesAction')}
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: 'primary' })}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t('contactAction')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
