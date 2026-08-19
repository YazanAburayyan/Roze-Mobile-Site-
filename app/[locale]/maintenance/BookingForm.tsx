'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';

import type { Locale } from '@/i18n/routing';
import { Input, Select, Button } from '@/components/ui';
import { cn } from '@/components/ui';
import { serviceRequestSchema, type ServiceRequestInput } from '@/lib/validation';
import { submitServiceRequest, type ServiceState } from '@/app/actions/service';
import { phones } from '@/lib/site';

type BookingServiceOption = { id: string; nameAr: string; nameEn: string };

const DEVICE_TYPE_KEYS = {
  phone: 'deviceTypePhone',
  laptop: 'deviceTypeLaptop',
  console: 'deviceTypeConsole',
  other: 'deviceTypeOther',
} as const;

export function BookingForm({ services }: { services: BookingServiceOption[] }) {
  const t = useTranslations('maintenance');
  const tf = useTranslations('forms');
  const tErrors = useTranslations('errors');
  const locale = useLocale() as Locale;

  const [state, setState] = useState<ServiceState>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ServiceRequestInput>({ resolver: zodResolver(serviceRequestSchema) });

  /** Zod messages are i18n KEYS, resolved here so validation speaks Arabic. */
  const msg = (key?: string) => (key ? tf(key) : undefined);

  async function onSubmit(values: ServiceRequestInput) {
    setSubmitting(true);
    const result = await submitServiceRequest(values, locale);
    setSubmitting(false);
    setState(result);

    if (result.status === 'error') {
      if (result.fieldErrors) {
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          setError(field as keyof ServiceRequestInput, { type: 'server', message: key });
        }
      }
      return;
    }

    if (result.status === 'success') {
      reset();
      // A WhatsApp deep link comes back from the server action. Open it, but
      // the booking reference stays on screen either way — a customer who
      // closes or never completes the WhatsApp chat still has proof of the
      // booking.
      window.open(result.redirectUrl, '_blank', 'noopener');
    }
  }

  if (state.status === 'success') {
    return (
      <div className="max-w-xl rounded-md border border-line bg-paper p-6 shadow-roze">
        <p className="text-h3 text-ink">{t('bookingConfirmed')}</p>
        <p className="mt-2 text-small text-muted">{t('bookingReferenceLabel')}</p>
        <p dir="ltr" data-numeric className="mt-1 font-mono text-h2 text-teal-deep">
          {state.reference}
        </p>
        <p className="mt-4 text-body text-muted">
          {t('willContactYou', { phone: phones.service1.display })}
        </p>
        <p className="mt-1 text-small text-muted">{t('whatsappHandoffNote')}</p>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="mt-5"
          onClick={() => window.open(state.redirectUrl, '_blank', 'noopener')}
        >
          {t('openWhatsapp')}
        </Button>
      </div>
    );
  }

  const deviceTypeOptions = (Object.keys(DEVICE_TYPE_KEYS) as (keyof typeof DEVICE_TYPE_KEYS)[]).map(
    (value) => ({ value, label: t(DEVICE_TYPE_KEYS[value]) }),
  );

  const serviceTypeOptions = services.map((s) => ({
    value: s.id,
    label: locale === 'ar' ? s.nameAr : s.nameEn,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-4">
      <Select
        label={t('deviceType')}
        required
        placeholder={t('deviceTypeSelectPlaceholder')}
        options={deviceTypeOptions}
        {...register('deviceType')}
        error={msg(errors.deviceType?.message)}
      />

      <Input
        label={t('deviceModel')}
        dir="ltr"
        {...register('deviceModel')}
        error={msg(errors.deviceModel?.message)}
      />

      {serviceTypeOptions.length > 0 ? (
        <Select
          label={t('serviceTypeField')}
          placeholder={t('serviceTypeSelectPlaceholder')}
          options={serviceTypeOptions}
          {...register('serviceTypeId')}
          error={msg(errors.serviceTypeId?.message)}
        />
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="issueDescription" className="text-small font-medium text-ink">
          {t('describeIssue')}
          <span className="text-danger" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <textarea
          id="issueDescription"
          required
          rows={4}
          aria-invalid={errors.issueDescription ? true : undefined}
          className={cn(
            'rounded-sm border border-line bg-mist/40 px-3 py-2 text-body text-ink',
            'placeholder:text-muted outline-none transition-colors',
            'focus:border-teal-deep motion-reduce:transition-none',
            errors.issueDescription ? 'border-danger' : null,
          )}
          {...register('issueDescription')}
        />
        {errors.issueDescription?.message ? (
          <p className="text-small text-danger">{msg(errors.issueDescription.message)}</p>
        ) : null}
      </div>

      <Input
        label={t('customerNameField')}
        required
        {...register('customerName')}
        error={msg(errors.customerName?.message)}
      />

      <Input
        label={t('customerPhoneField')}
        required
        type="tel"
        inputMode="tel"
        dir="ltr"
        {...register('customerPhone')}
        error={msg(errors.customerPhone?.message)}
      />

      <Input
        label={t('preferredTime')}
        type="datetime-local"
        dir="ltr"
        {...register('preferredTime')}
        error={msg(errors.preferredTime?.message)}
      />

      {state.status === 'error' ? (
        <p role="alert" className="text-small text-danger">
          {tf.has(state.errorKey) ? tf(state.errorKey) : tErrors('genericError')}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" loading={submitting}>
        {t('bookAppointment')}
      </Button>
    </form>
  );
}
