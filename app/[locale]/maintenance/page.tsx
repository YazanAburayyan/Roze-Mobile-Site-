import type { Metadata } from 'next';
import { Wrench, Clock, ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getServiceTypes } from '@/lib/catalog';
import { formatDinarRange } from '@/lib/money';
import { currency } from '@/lib/site';
import { alternatesFor, jsonLdScript, breadcrumbJsonLd } from '@/lib/seo';
import { Badge } from '@/components/ui';
import { BookingForm } from './BookingForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'maintenance' });
  return {
    title: t('pageTitle'),
    description: t('lede'),
    alternates: alternatesFor('maintenance'),
  };
}

/** Canonical device-type order. Groups with no services simply don't render. */
const DEVICE_TYPES = ['phone', 'laptop', 'console', 'other'] as const;

const GROUP_HEADING_KEY: Record<(typeof DEVICE_TYPES)[number], string> = {
  phone: 'groupPhoneHeading',
  laptop: 'groupLaptopHeading',
  console: 'groupConsoleHeading',
  other: 'groupOtherHeading',
};

/**
 * ROZE's logo is two intersecting circles — sales and service meeting in one
 * shop — and the brand guide is explicit that maintenance is a top-level peer
 * of the sales pages, not a footnote. This page gets the same visual weight
 * as a category page: a full-bleed ink header (matching the homepage's
 * MaintenanceCta treatment), a real catalogue with concrete JOD ranges and
 * turnaround times, and a booking form that hands off to the SERVICE
 * WhatsApp line — never the showroom line.
 */
export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;

  const t = await getTranslations({ locale, namespace: 'maintenance' });
  const services = await getServiceTypes();

  const groups = DEVICE_TYPES.map((deviceType) => ({
    deviceType,
    services: services.filter((s) => s.deviceType === deviceType),
  })).filter((group) => group.services.length > 0);

  const bookingServices = services.map((s) => ({
    id: s.id,
    nameAr: s.nameAr,
    nameEn: s.nameEn,
  }));

  return (
    <>
      <script
        {...jsonLdScript(
          breadcrumbJsonLd(
            [{ name: t('pageTitle'), path: 'maintenance' }],
            locale,
          ),
        )}
      />

      <section className="on-ink border-b border-line-invert bg-ink py-12 lg:py-20">
        <div className="wrap flex flex-col gap-5">
          <span className="inline-flex size-12 items-center justify-center rounded-md bg-teal text-ink">
            <Wrench aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-h1 text-paper">{t('pageTitle')}</h1>
          <p className="lede">{t('lede')}</p>
          {services.length > 0 ? (
            <div>
              <Badge variant="teal">
                {t('servicesAvailable', { count: services.length })}
              </Badge>
            </div>
          ) : null}
        </div>
      </section>

      <section className="wrap py-10 lg:py-16">
        <h2 className="text-h2 mb-6">{t('ourServices')}</h2>

        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <div key={group.deviceType}>
              <h3 className="text-h3 mb-4">{t(GROUP_HEADING_KEY[group.deviceType])}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => {
                  const range = formatDinarRange(service.priceMinFils, service.priceMaxFils);
                  return (
                    <div
                      key={service.id}
                      className="flex flex-col gap-3 rounded-md border border-line bg-paper p-5 shadow-roze"
                    >
                      <h4 className="text-h3 text-ink">
                        {locale === 'ar' ? service.nameAr : service.nameEn}
                      </h4>
                      <p className="text-small text-muted">
                        {locale === 'ar' ? service.descriptionAr : service.descriptionEn}
                      </p>

                      <p
                        dir="ltr"
                        data-numeric
                        className="font-mono text-body font-medium text-teal-deep"
                      >
                        {range ? `${currency.symbol[locale]} ${range}` : t('quoteOnInspection')}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-small text-muted">
                        {service.estimatedHours != null ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock aria-hidden="true" className="size-4" />
                            {t('hoursValue', { count: service.estimatedHours })}
                          </span>
                        ) : null}
                        {service.warrantyDays != null ? (
                          <Badge variant="gold">
                            <ShieldCheck aria-hidden="true" className="size-3.5" />
                            {t('warranty', { days: service.warrantyDays })}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-mist/30 py-10 lg:py-16">
        <div className="wrap">
          <h2 className="text-h2 mb-6">{t('bookingFormTitle')}</h2>
          <BookingForm services={bookingServices} />
        </div>
      </section>
    </>
  );
}
