'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Trash2 } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { buttonClasses } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/commerce/QuantityStepper';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useCart,
  cartSubtotalFils,
  cartShippingFils,
  FREE_SHIPPING_THRESHOLD_FILS,
} from '@/lib/cart/store';
import { formatPrice } from '@/lib/money';

export function CartView() {
  const t = useTranslations('cart');
  const locale = useLocale() as Locale;
  const { lines, setQuantity, remove, hydrated } = useCart();

  const subtotal = cartSubtotalFils(lines);
  const shipping = cartShippingFils(subtotal);

  // The cart lives in localStorage, so the server cannot know it. Render a
  // skeleton until rehydration rather than flashing an empty cart at someone
  // who has items — that reads as data loss.
  if (!hydrated) {
    return (
      <div className="py-6">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <p className="lede">{t('emptyStateHeading')}</p>
        <Link href="/" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
          {t('emptyStateAction')}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 py-5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-sm bg-mist sm:size-28">
                <Image
                  src={line.image}
                  alt={locale === 'ar' ? line.titleAr : line.titleEn}
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Link
                  href={`/product/${line.slug}`}
                  className="line-clamp-2 font-bold"
                >
                  {locale === 'ar' ? line.titleAr : line.titleEn}
                </Link>
                <span dir="ltr" data-numeric className="font-mono text-sm text-muted">
                  {line.sku}
                </span>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={line.quantity}
                    max={line.maxQuantity}
                    onChange={(q) => setQuantity(line.productId, q)}
                  />
                  <span dir="ltr" data-numeric className="font-mono font-bold">
                    {formatPrice(line.unitPriceFils * line.quantity, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    aria-label={t('remove')}
                    className="rounded-sm p-2 text-muted hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-md border border-line bg-mist/40 p-5">
          <h2 className="text-h3 mb-4">{t('total')}</h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t('subtotal')}</dt>
              <dd dir="ltr" data-numeric className="font-mono">
                {formatPrice(subtotal, locale)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('shipping')}</dt>
              <dd dir="ltr" data-numeric className="font-mono">
                {formatPrice(shipping, locale)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-h3">
              <dt>{t('total')}</dt>
              <dd dir="ltr" data-numeric className="font-mono">
                {formatPrice(subtotal + shipping, locale)}
              </dd>
            </div>
          </dl>

          {shipping > 0 ? (
            <p className="mt-3 text-sm text-teal-deep">
              {formatPrice(FREE_SHIPPING_THRESHOLD_FILS - subtotal, locale)}
            </p>
          ) : null}

          <Link
            href="/checkout"
            className={
              buttonClasses({ variant: 'primary', size: 'lg' }) + ' mt-5 w-full'
            }
          >
            {t('proceedToCheckout')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
