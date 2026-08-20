'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/components/ui';

/**
 * Header search — an icon at every width.
 *
 * Clicking it drops a white panel across the full width of the header. The
 * field is deliberately light: the header is an ink bar, and an input tinted
 * to sit on that dark ground reads as a disabled ghost box rather than
 * somewhere you can type. White is the affordance.
 *
 * Icon-only at all sizes (it used to be inline from `md` up) keeps the bar
 * uncluttered and gives the five-item section menu the room it needs.
 *
 * Not built on the `Input` primitive: that always renders a visible `<label>`
 * block above the field, which does not fit a compact icon-adorned search.
 * The same tokens are used, so it stays consistent with the rest of the forms.
 */
export function SearchBar({ className }: { className?: string }) {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        // Return focus to the control that opened the panel, so keyboard
        // users are not dropped at the top of the document.
        triggerRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="roze-search-panel"
        aria-label={t('searchPlaceholder')}
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-sm',
          'text-mist transition-colors hover:bg-paper/10 hover:text-paper',
          'motion-reduce:transition-none',
          className
        )}
      >
        <Search aria-hidden="true" className="size-5" />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id="roze-search-panel"
          // Positioned against the <header>, which is sticky and therefore the
          // nearest positioned ancestor — so the panel hangs directly beneath
          // the bar at every width.
          className={cn(
            'absolute inset-x-0 top-full z-50 border-b border-line bg-surface p-3 shadow-roze',
            'motion-safe:animate-[search-drop_180ms_ease-out]'
          )}
        >
          <form
            onSubmit={handleSubmit}
            role="search"
            className="mx-auto flex w-full max-w-3xl items-center gap-2"
          >
            <div className="relative min-w-0 flex-1">
              <label htmlFor="roze-header-search" className="sr-only">
                {t('searchPlaceholder')}
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
              />
              <input
                ref={inputRef}
                id="roze-header-search"
                name="q"
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className={
                  'h-11 w-full rounded-sm border border-line bg-surface ps-9 pe-3 text-body ' +
                  'text-ink placeholder:text-muted outline-none transition-colors ' +
                  'focus:border-teal-deep motion-reduce:transition-none'
                }
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={tCommon('close')}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-mist motion-reduce:transition-none"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
