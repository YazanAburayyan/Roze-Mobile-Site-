'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Trash2 } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { Drawer } from '@/components/ui/Drawer';
import { Button, buttonClasses } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/commerce/QuantityStepper';
import { useCart, cartCount, cartSubtotalFils } from '@/lib/cart/store';
import { formatPrice } from '@/lib/money';

/**
 * The cart drawer.
 *
 * Opens from the inline-start edge via the Drawer primitive, so in Arabic it
 * slides in from the right with no locale branching here.
 */
export function CartDrawer() {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const locale = useLocale() as Locale;

  const { lines, isOpen, close, setQuantity, remove, hydrated } = useCart();
  const subtotal = cartSubtotalFils(lines);
  const count = cartCount(lines);

  return (
    <Drawer open={isOpen} onClose={close} side="inline-end" title={t('title')}>
      {!hydrated ? null : lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4 py-8">
          <p className="text-h3">{t('emptyStateHeading')}</p>
          <Link href="/" className={buttonClasses({ variant: 'primary' })} onClick={close}>
            {t('emptyStateAction')}
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 divide-y divide-line overflow-y-auto">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-3 py-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-mist">
                  <Image
                    src={line.image}
                    alt={locale === 'ar' ? line.titleAr : line.titleEn}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={close}
                    className="line-clamp-2 text-sm font-bold"
                  >
                    {locale === 'ar' ? line.titleAr : line.titleEn}
                  </Link>

                  <span
                    dir="ltr"
                    data-numeric
                    className="text-sm text-teal-deep font-mono"
                  >
                    {formatPrice(line.unitPriceFils, locale)}
                  </span>

                  <div className="flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={line.quantity}
                      max={line.maxQuantity}
                      onChange={(q) => setQuantity(line.productId, q)}
                    />
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

          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-muted">{t('subtotal')}</span>
              <span dir="ltr" data-numeric className="font-mono text-h3">
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <p className="pb-4 text-sm text-muted">{t('shippingCalculatedAtCheckout')}</p>

            <Link
              href="/checkout"
              onClick={close}
              className={buttonClasses({ variant: 'primary', size: 'lg' }) + ' w-full'}
            >
              {t('proceedToCheckout')}
            </Link>

            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={close} className="w-full">
                {t('continueShopping')}
              </Button>
            </div>

            <p className="sr-only" aria-live="polite">
              {count === 1 ? t('item_one') : t('item_other', { count })}
            </p>
            <span className="sr-only">{tc('close')}</span>
          </div>
        </div>
      )}
    </Drawer>
  );
}
