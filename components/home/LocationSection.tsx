import { MapPin, Navigation, Star } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { address, schemaDays, reputation } from '@/lib/site';
import { groupedHours } from '@/lib/hours';
import { buttonClasses } from '@/components/ui';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/** `24` -> "00:00" (end-of-day midnight), else "H:00". */
function fmtHour(hour: number): string {
  const hh = hour % 24;
  return `${String(hh).padStart(2, '0')}:00`;
}

/**
 * Store location, with the Google rating folded in.
 *
 * The rating used to be its own band directly above this one — a lone card in
 * an empty strip, which read as an ornament. It is evidence ABOUT this shop
 * and it links to the same Google place as "get directions", so it belongs
 * here beside the address rather than floating on its own.
 *
 * No Google Maps iframe: it needs an API key nobody has yet and would leak
 * visitor data to Google on every homepage load.
 */
export async function LocationSection() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const hourGroups = groupedHours();

  return (
    <section id="contact" className="band-sand scroll-mt-24"><div className="wrap py-12 lg:py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">{t('home.findUs')}</span>
          <h2 className="text-h2 text-ink">{t('contact.visitTheShop')}</h2>
        </div>

        {/* Google rating as a credential on the shop, not a separate band. */}
        <a
          href={address.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex shrink-0 items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 shadow-roze transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <span className="text-h2 leading-none text-ink" data-numeric dir="ltr" aria-hidden="true">
            {reputation.ratingValue}
          </span>
          <span className="flex flex-col gap-1">
            <span aria-hidden="true" className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(reputation.ratingValue)
                      ? 'size-3.5 fill-gold text-gold'
                      : 'size-3.5 fill-transparent text-line'
                  }
                />
              ))}
            </span>
            <span className="text-small text-muted group-hover:text-teal-deep" data-numeric>
              {t('footer.googleReviews', { count: reputation.reviewCount })}
            </span>
          </span>
          <span className="sr-only">
            {t('home.ratingLabel', { rating: reputation.ratingValue, count: reputation.reviewCount })}
          </span>
        </a>
      </div>

      <div className="mt-6 grid gap-6 overflow-hidden rounded-lg border border-line bg-paper shadow-roze lg:grid-cols-2">
        {/*
          Deliberately NOT a map image and NOT a Google Maps iframe: an iframe
          needs an API key nobody has and leaks visitor data, and a decorative
          gradient with a pin on it is a picture of a map that shows no streets
          and helps nobody find the shop. This panel carries the data a person
          actually navigates by — Plus Code and coordinates, both copyable —
          with the directions link doing the real work.
        */}
        <div className="band-ink flex min-h-56 flex-col justify-center gap-4 p-6 lg:p-8">
          <MapPin aria-hidden="true" className="size-6 text-teal" strokeWidth={1.75} />
          <div className="flex flex-col gap-1">
            <span className="eyebrow">{t('contact.ourLocationOnMap')}</span>
            <p className="font-mono text-body text-paper" dir="ltr" data-numeric>
              {address.plusCode}
            </p>
            <p className="font-mono text-small text-mist" dir="ltr" data-numeric>
              {address.coordinates.lat}, {address.coordinates.lng}
            </p>
          </div>
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
    </div></section>
  );
}
