'use client';

import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart, cartCount } from '@/lib/cart/store';
import { cn } from '@/components/ui';


/**
 * The header cart trigger. Reads its count from the Zustand store.
 *
 * `hydrated` guards the badge: zustand/persist rehydrates from localStorage
 * asynchronously on the client, so the very first client render must match
 * the server (which always renders zero lines). We render no badge at all
 * until `hydrated` flips true, rather than guessing.
 */
export function CartButton({ className }: { className?: string }) {
  const t = useTranslations('header');
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const count = hydrated ? cartCount(lines) : 0;

  const countLabel =
    hydrated && count > 0 ? t('cartItemCount', { count }) : undefined;

  return (
    <Link
      href="/cart"
      aria-label={countLabel ? `${t('cartLabel')} — ${countLabel}` : t('cartLabel')}
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-ink transition-colors hover:bg-mist motion-reduce:transition-none',
        className
      )}
    >
      <ShoppingBag aria-hidden="true" className="size-5" />
      {hydrated && count > 0 ? (
        <span
          className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-deep px-1 text-[11px] font-semibold text-paper"
          data-numeric
          aria-hidden="true"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
