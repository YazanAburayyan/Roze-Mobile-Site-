import { Wrench, Clock, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getServiceTypes } from '@/lib/catalog';
import { formatFils } from '@/lib/money';
import { buttonClasses } from '@/components/ui';

/**
 * Maintenance is a top-level peer of the sales categories, not an
 * afterthought — the brief asks for a section "visually equal to any sales
 * section", so this gets a full-bleed ink section (the same treatment the
 * footer's brand block gets) with real service cards, not a thin banner.
 *
 * Copy stays concrete: real JOD ranges and turnaround times pulled from
 * getServiceTypes(), never a vague "integrated technical solutions" line.
 * Only services with an actual price range are shown, so the numbers on
 * screen are always ones a customer can act on.
 */
export async function MaintenanceCta() {
  const t = await getTranslations();
  const services = (await getServiceTypes())
    .filter((s) => s.priceMinFils != null && s.priceMaxFils != null)
    .slice(0, 4);

  return (
    <section className="band-ink py-14 lg:py-24">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-md bg-teal text-ink">
              <Wrench aria-hidden="true" className="size-6" />
            </span>
            <h2 className="text-h2 text-paper">{t('home.maintenanceCtaHeading')}</h2>
            <p className="lede">{t('home.maintenanceCtaBody')}</p>
            <div>
              <Link href="/maintenance" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                {t('hero.bookRepair')}
              </Link>
            </div>
          </div>

          {services.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="ring-gradient-border rounded-md bg-ink p-5"
                >
                  <h3 className="text-h3 text-paper" lang="ar">
                    {service.nameAr}
                  </h3>
                  <p className="mt-2 font-mono text-body font-medium text-mist" dir="ltr" data-numeric>
                    {t('maintenance.priceRange', {
                      min: formatFils(service.priceMinFils as number),
                      max: formatFils(service.priceMaxFils as number),
                    })}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-muted-invert">
                    {service.estimatedHours != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="size-4" />
                        {t('maintenance.hoursValue', { count: service.estimatedHours })}
                      </span>
                    ) : null}
                    {service.warrantyDays != null ? (
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-gold px-2 py-0.5 text-muted-invert">
                        <ShieldCheck aria-hidden="true" className="size-3.5" />
                        {t('maintenance.warranty', { days: service.warrantyDays })}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
