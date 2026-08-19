'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';

import type { Locale } from '@/i18n/routing';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/money';
import { trackSchema, type TrackInput } from '@/lib/validation';
import { lookupOrder, type TrackState } from '@/app/actions/track';

/** Order status -> i18n key. Keys live in the `track` namespace. */
const STATUS_KEY: Record<string, string> = {
  pending: 'orderStatusPending',
  confirmed: 'orderStatusConfirmed',
  preparing: 'orderStatusPreparing',
  ready: 'orderStatusReady',
  delivered: 'orderStatusDelivered',
  cancelled: 'orderStatusCancelled',
};

export function TrackForm() {
  const t = useTranslations('track');
  const tf = useTranslations('forms');
  const tc = useTranslations('cart');
  const locale = useLocale() as Locale;

  const [state, setState] = useState<TrackState>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackInput>({ resolver: zodResolver(trackSchema) });

  const msg = (key?: string) => (key ? tf(key) : undefined);

  async function onSubmit(values: TrackInput) {
    setSubmitting(true);
    setState(await lookupOrder(values));
    setSubmitting(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label={t('orderReferenceField')}
          required
          dir="ltr"
          placeholder="ROZE-XXXXXX"
          {...register('reference')}
          error={msg(errors.reference?.message)}
        />
        <Input
          label={t('phoneNumberField')}
          required
          type="tel"
          inputMode="tel"
          dir="ltr"
          {...register('phone')}
          error={msg(errors.phone?.message)}
        />
        <Button type="submit" variant="primary" size="lg" loading={submitting}>
          {t('lookUpOrder')}
        </Button>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-danger">
            {/* Wrong phone and unknown reference deliberately produce the same
                message — the form must not reveal which references exist. */}
            {state.errorKey === 'orderNotFound'
              ? t('notFoundMessage')
              : tf.has(state.errorKey)
                ? tf(state.errorKey)
                : t('notFoundMessage')}
          </p>
        ) : null}
      </form>

      {state.status === 'found' ? (
        <div className="h-fit rounded-md border border-line bg-mist/40 p-5">
          <p dir="ltr" data-numeric className="font-mono text-h3">
            {state.order.reference}
          </p>
          <p className="mt-1 mb-4 inline-block rounded-sm bg-teal px-3 py-1 text-sm font-bold text-ink">
            {t(STATUS_KEY[state.order.status] ?? 'orderStatusPending')}
          </p>

          <ul className="divide-y divide-line border-t border-line">
            {state.order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block font-bold">
                    {locale === 'ar' ? item.titleAr : item.titleEn}
                  </span>
                  <span dir="ltr" data-numeric className="font-mono text-sm text-muted">
                    × {item.quantity}
                  </span>
                </span>
                <span dir="ltr" data-numeric className="shrink-0 font-mono">
                  {formatPrice(item.lineTotalFils, locale)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-line pt-3 text-h3">
            <span>{tc('total')}</span>
            <span dir="ltr" data-numeric className="font-mono">
              {formatPrice(state.order.totalFils, locale)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
