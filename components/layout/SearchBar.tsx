'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/components/ui';

/**
 * Header search. Submits to `/search?q=`.
 *
 * At the search-bar breakpoint (md) it renders inline. Below that — where the
 * header must still fit logo + cart + menu trigger at 320px — it collapses to
 * an icon button that opens a full-width overlay input instead of squeezing
 * an input box into the row.
 *
 * Not built on the `Input` primitive: that component always renders a
 * visible `<label>` block above the field, which doesn't fit a compact
 * icon-adorned header search. The field still uses the same tokens
 * (`border-line`, `bg-mist/40`, `focus:border-teal-deep`) as `Input` does.
 */
export function SearchBar({ className }: { className?: string }) {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);
  const [value, setValue] = React.useState('');
  const mobileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!expanded) return;
    mobileInputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setExpanded(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setExpanded(false);
  }

  const fieldClasses =
    'h-10 w-full rounded-sm border border-line bg-mist/40 ps-9 pe-3 text-body text-ink ' +
    'placeholder:text-muted outline-none transition-colors focus:border-teal-deep ' +
    'motion-reduce:transition-none';

  return (
    <>
      <form
        onSubmit={handleSubmit}
        role="search"
        className={cn('relative hidden min-w-0 max-w-md flex-1 md:block', className)}
      >
        <label htmlFor="roze-header-search" className="sr-only">
          {t('searchPlaceholder')}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
        />
        <input
          id="roze-header-search"
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className={fieldClasses}
        />
      </form>

      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-label={t('searchPlaceholder')}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-ink transition-colors hover:bg-mist motion-reduce:transition-none md:hidden"
      >
        <Search aria-hidden="true" className="size-5" />
      </button>

      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('searchPlaceholder')}
          className="fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b border-line bg-paper p-3 shadow-roze md:hidden"
        >
          <form onSubmit={handleSubmit} role="search" className="relative flex-1">
            <label htmlFor="roze-mobile-search" className="sr-only">
              {t('searchPlaceholder')}
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
            />
            <input
              ref={mobileInputRef}
              id="roze-mobile-search"
              name="q"
              type="search"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className={cn(fieldClasses, 'h-11')}
            />
          </form>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label={tCommon('close')}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-mist motion-reduce:transition-none"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      ) : null}
    </>
  );
}
