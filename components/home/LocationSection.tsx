import { MapPin, Navigation } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { address, schemaDays } from '@/lib/site';
import { groupedHours } from '@/lib/hours';
import { buttonClasses } from '@/components/ui';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/** `24` -> "00:00" (end-of-day midnight), else "H:00". */
function fmtHour(hour: number): string {
  const hh = hour % 24;
  return `${String(hh).padStart(2, '0')}:00`;
}

/**
 * Store location. No Google Maps iframe — that needs an API key nobody has
 * yet and would leak visitor data to Google on every homepage load. Instead:
 * a plain styled card with a decorative pin motif in the brand's ring
 * gradient, the real address, and a "get directions" link straight to the
 * confirmed Google Maps place (address.mapsUrl from lib/site.ts).
 */
export async function LocationSection() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const hourGroups = groupedHours();

  return (
    <section className="wrap py-10 lg:py-16">
      <span className="eyebrow">{t('home.findUs')}</span>
      <h2 className="text-h2 text-ink">{t('contact.visitTheShop')}</h2>

      <div className="mt-6 grid gap-6 overflow-hidden rounded-lg border border-line bg-paper shadow-roze lg:grid-cols-2">
        <div className="ring-gradient relative flex min-h-56 items-center justify-center" aria-hidden="true">
          <span className="flex size-20 items-center justify-center rounded-full bg-ink/60 backdrop-blur-sm">
            <MapPin aria-hidden="true" className="size-10 text-paper" />
          </span>
        </div>

        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t('footer.addressLabel')}</span>
            <p className="text-body text-ink">
              {address.street[locale]}
              {', '}
              {address.locality[locale]}
              {', '}
              {address.country[locale]}
            </p>
            <a
              href={address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-1 self-start' })}
            >
              <Navigation aria-hidden="true" className="size-4" />
              {t('contact.getDirections')}
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t('footer.openingHours')}</span>
            <table className="w-full text-small text-ink">
              <caption className="sr-only">{t('footer.openingHours')}</caption>
              <tbody>
                {hourGroups.map((group) => {
                  const first = t(`footer.days.${DAY_KEYS[group.days[0] ?? 0]}`);
                  const last = t(
                    `footer.days.${DAY_KEYS[group.days[group.days.length - 1] ?? 0]}`
                  );
                  const dayLabel = group.days.length > 1 ? `${first}–${last}` : first;
                  return (
                    <tr key={schemaDays[group.days[0] ?? 0]} className="border-b border-line last:border-b-0">
                      <th scope="row" className="py-1.5 text-start font-normal text-muted">
                        {dayLabel}
                      </th>
                      <td className="py-1.5 text-end" dir="ltr" data-numeric>
                        {fmtHour(group.open)}–{fmtHour(group.close)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
