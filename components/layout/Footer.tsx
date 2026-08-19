import Image from 'next/image';
import { MapPin, Phone, MessageCircle, Facebook, Star } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { site, address, phones, whatsapp, social, reputation, schemaDays } from '@/lib/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { groupedHours } from '@/lib/hours';
import { getTopLevelCategories } from '@/lib/catalog';


const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

/** `24` -> "00:00" (schema-style end-of-day midnight), else "H:00". */
function fmtHour(hour: number): string {
  const hh = hour % 24;
  return `${String(hh).padStart(2, '0')}:00`;
}

function categoryName(category: { nameAr: string; nameEn: string }, locale: Locale): string {
  return locale === 'ar' ? category.nameAr : category.nameEn;
}

/**
 * Every fact here is read from `lib/site.ts` / `lib/hours.ts` — never typed
 * as a literal. The logo renders inside `.logo-plate` even though the footer
 * ground is already ink, because the plate is the only sanctioned container
 * for the mark; it is not optional just because the surrounding section is
 * already dark.
 */
export async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const [categories, hourGroups] = await Promise.all([
    getTopLevelCategories(),
    Promise.resolve(groupedHours()),
  ]);

  const reviewsLabel = t(
    'footer.googleReviews',
    { count: reputation.reviewCount }
  );

  return (
    <footer className="on-ink border-t border-line-invert bg-ink text-paper">
      <div className="wrap grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + social proof */}
        <div className="flex flex-col gap-4">
          <Link href="/" aria-label={site.name[locale]}>
            <span className="logo-plate">
              <Image
                src="/logo/roze-logo.png"
                alt={site.name[locale]}
                width={160}
                height={89}
              />
            </span>
          </Link>
          <p className="lede">{site.tagline[locale]}</p>
          <div className="flex items-center gap-2 text-small text-mist">
            <Star aria-hidden="true" className="size-4 fill-teal-deep text-teal-deep" />
            <span data-numeric dir="ltr">
              {reputation.ratingValue}
            </span>
            <span aria-hidden="true">·</span>
            <span>{reviewsLabel}</span>
          </div>
          <a
            href={social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-small text-mist transition-colors hover:text-paper motion-reduce:transition-none"
          >
            <Facebook aria-hidden="true" className="size-4" />
            {t('footer.facebook')}
          </a>
        </div>

        {/* Quick links */}
        <nav aria-label={t('footer.quickLinks')} className="flex flex-col gap-3">
          <span className="eyebrow">{t('footer.quickLinks')}</span>
          <ul className="flex flex-col gap-2 text-small text-mist">
            <li>
              <Link href="/" className="hover:text-paper">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link href="/offers" className="hover:text-paper">
                {t('nav.offers')}
              </Link>
            </li>
            <li>
              <Link href="/maintenance" className="hover:text-paper">
                {t('nav.maintenance')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-paper">
                {t('nav.contact')}
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-paper">
                {t('nav.trackOrder')}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Categories */}
        <nav aria-label={t('footer.categories')} className="flex flex-col gap-3">
          <span className="eyebrow">{t('footer.categories')}</span>
          <ul className="flex flex-col gap-2 text-small text-mist">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`} className="hover:text-paper">
                  {categoryName(category, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact: address, phones, hours */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t('footer.addressLabel')}</span>
            <a
              href={address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-small text-mist hover:text-paper"
            >
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                {address.street[locale]}
                {', '}
                {address.locality[locale]}
                {', '}
                {address.country[locale]}
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t('header.callUs')}</span>
            {(
              [
                [phones.showroom, `tel:${phones.showroom.e164}`],
                [phones.service1, `tel:${phones.service1.e164}`],
                [phones.service2, `tel:${phones.service2.e164}`],
              ] as const
            ).map(([phone, href]) => (
              <a
                key={phone.e164}
                href={href}
                className="flex items-center gap-2 text-small text-mist hover:text-paper"
              >
                <Phone aria-hidden="true" className="size-4 shrink-0" />
                <span className="flex flex-wrap items-baseline gap-x-1.5">
                  <span>{phone.purpose[locale]}</span>
                  <span dir="ltr" data-numeric className="text-muted-invert">
                    {phone.display}
                  </span>
                </span>
              </a>
            ))}
            <a
              href={whatsappUrl(whatsapp.sales, t('header.whatsapp'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-small text-mist hover:text-paper"
            >
              <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
              {t('header.whatsapp')}
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">{t('footer.openingHours')}</span>
            <ul className="flex flex-col gap-1 text-small text-mist">
              {hourGroups.map((group) => {
                const first = t(`footer.days.${DAY_KEYS[group.days[0] ?? 0]}`);
                const last = t(
                  `footer.days.${DAY_KEYS[group.days[group.days.length - 1] ?? 0]}`
                );
                const dayLabel = group.days.length > 1 ? `${first}–${last}` : first;
                return (
                  <li
                    key={schemaDays[group.days[0] ?? 0]}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span>{dayLabel}</span>
                    <span dir="ltr" data-numeric className="text-muted-invert">
                      {fmtHour(group.open)}–{fmtHour(group.close)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line-invert">
        <p className="wrap py-4 text-small text-muted-invert">{t('footer.rightsReserved')}</p>
      </div>
    </footer>
  );
}
