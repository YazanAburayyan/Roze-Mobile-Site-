'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';

import { useRouter } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useCart,
  cartSubtotalFils,
  cartShippingFils,
} from '@/lib/cart/store';
import { formatPrice } from '@/lib/money';
import { checkoutSchema, type CheckoutInput } from '@/lib/validation';
import { governorates } from '@/lib/site';
import { submitCheckout } from '@/app/actions/checkout';

type ProviderOption = { id: string; labelKey: string; descriptionKey: string };

export function CheckoutForm({ providers }: { providers: ProviderOption[] }) {
  const t = useTranslations('checkout');
  const tf = useTranslations('forms');
  const tc = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();

  const { lines, hydrated, clear } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotalFils(lines);
  const shipping = cartShippingFils(subtotal);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: providers[0]?.id ?? 'cod' },
  });

  /** Zod messages are i18n KEYS, resolved here so validation speaks Arabic. */
  const msg = (key?: string) => (key ? tf(key) : undefined);

  async function onSubmit(values: CheckoutInput) {
    setServerError(null);
    setSubmitting(true);

    const result = await submitCheckout(
      values,
      lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      locale,
    );

    setSubmitting(false);

    if (result.status === 'error') {
      setServerError(result.errorKey);
      return;
    }

    if (result.status === 'success') {
      clear();
      // A WhatsApp provider hands back a deep link. Open it, then land the
      // customer on the confirmation page either way — so the order reference
      // is on screen whether or not they complete the chat.
      if (result.redirectUrl) window.open(result.redirectUrl, '_blank', 'noopener');
      router.push(`/checkout/confirmation/${result.reference}`);
    }
  }

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <p className="lede">{tc('emptyStateHeading')}</p>
        <Button variant="primary" onClick={() => router.push('/')}>
          {tc('emptyStateAction')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-h3 mb-2">{t('contactSection')}</legend>
          <Input
            label={t('fullName')}
            required
            {...register('customerName')}
            error={msg(errors.customerName?.message)}
          />
          <Input
            label={t('phoneNumber')}
            required
            type="tel"
            inputMode="tel"
            dir="ltr"
            {...register('customerPhone')}
            error={msg(errors.customerPhone?.message)}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-h3 mb-2">{t('deliverySection')}</legend>
          <Select
            label={t('governorate')}
            required
            options={governorates.map((g) => ({ value: g.value, label: g[locale] }))}
            {...register('governorate')}
            error={msg(errors.governorate?.message)}
          />
          <Input
            label={t('area')}
            required
            {...register('area')}
            error={msg(errors.area?.message)}
          />
          <Input
            label={t('streetAddress')}
            required
            {...register('street')}
            error={msg(errors.street?.message)}
          />
          <Input
            label={t('notes')}
            description={tCommon('optional')}
            {...register('notes')}
            error={msg(errors.notes?.message)}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-h3 mb-2">{t('paymentMethod')}</legend>
          {providers.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer gap-3 rounded-md border border-line bg-mist/40 p-4 has-[:checked]:border-teal"
            >
              <input
                type="radio"
                value={p.id}
                {...register('paymentMethod')}
                className="mt-1 size-4 accent-teal-deep"
              />
              <span>
                <span className="block font-bold">{t(p.labelKey)}</span>
                <span className="block text-sm text-muted">{t(p.descriptionKey)}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="h-fit rounded-md border border-line bg-mist/40 p-5">
        <h2 className="text-h3 mb-4">{t('orderSummary')}</h2>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{tc('subtotal')}</dt>
            <dd dir="ltr" data-numeric className="font-mono">
              {formatPrice(subtotal, locale)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{tc('shipping')}</dt>
            <dd dir="ltr" data-numeric className="font-mono">
              {formatPrice(shipping, locale)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-h3">
            <dt>{tc('total')}</dt>
            <dd dir="ltr" data-numeric className="font-mono">
              {formatPrice(subtotal + shipping, locale)}
            </dd>
          </div>
        </dl>

        {serverError ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {tf.has(serverError) ? tf(serverError) : serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          className="mt-5 w-full"
        >
          {t('placeOrder')}
        </Button>
      </aside>
    </form>
  );
}
