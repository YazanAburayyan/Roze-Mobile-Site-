import Image from 'next/image';
import { Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { hours } from '@/lib/site';
import { getShopStatus } from '@/lib/hours';
import { buttonClasses } from '@/components/ui';
import { OpenStatusBadge } from '@/components/layout';

/**
 * Homepage hero — full-bleed ink band, typographic.
 *
 * NO LOGO HERE, by policy (REDESIGN_PLAN §3). The header carries the
 * wordmark and the footer carries the real mark; this section carries
 * neither, and nothing in it approximates the mark — no circle, ring, arc or
 * "echo" shape. The previous version drew two large overlapping circles AND
 * put the PNG on top of them in a black plate, so the logo appeared twice in
 * one viewport at two sizes. Both are gone, along with `.logo-plate`.
 *
 * There is also no eyebrow. The old one printed «بيع وصيانة — دائرتين
 * متقاطعتين» — the brand guide's internal note on what the mark *means* —
 * as customer-facing marketing. An eyebrow here would have to be a concrete
 * customer benefit, and every candidate (turnaround time, warranty length)
 * is a business fact nobody has confirmed. So it is omitted rather than
 * invented.
 *
 * The hours line is the real differentiator and is the third element on the
 * page, above the fold at 390px. Its numbers are derived from lib/site.ts —
 * "midnight, seven days" is never typed as copy.
 */
export async function HeroSection() {
  const t = await getTranslations('hero');
  const status = getShopStatus();

  // Derived from the hours table, never asserted in a translation string:
  // seven entries, all closing at the same hour (24 === midnight).
  const daysOpen = String(hours.length);
  const closingHour = Math.max(...hours.map((h) => h.close));
  const closingLabel = `${String(closingHour % 24).padStart(2, '0')}:00`;

  return (
    <section className="band-ink relative isolate overflow-hidden">
      {/*
        The photograph. This is the swap point the previous typographic hero
        documented, now filled: a scrim sits over the image so the headline
        keeps its contrast regardless of what the photo does underneath, and
        the ring gradient still tints the whole thing so the section reads as
        ROZE rather than as stock imagery.

        To change the picture, replace public/photos/shop-interior.webp and
        nothing else — the type layer below is independent.
      */}
      <div aria-hidden="true" className="hero-ambient absolute inset-0 -z-10">
        <Image
          src="/photos/shop-interior.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/*
          A vertical gradient rather than a flat wash: a uniform scrim plus the
          teal screen-blend turned the whole frame one murky green and the photo
          stopped reading as a photo. Dark where the type sits, clearing toward
          the top so the shop is actually visible. Vertical works in both
          reading directions, so no RTL flip is needed.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
        <div className="hero-field absolute inset-0 opacity-15" />
      </div>

      <div className="wrap hero-enter flex flex-col items-start gap-5 py-14 sm:py-20 lg:py-28">
        <h1 className="text-display max-w-[16ch] text-paper">{t('headline')}</h1>

        <p className="lede">{t('subheadline')}</p>

        {/* `hero-status` scopes one rule in globals.css: the badge's own
            inline closing time is suppressed here, because the line beside
            it already states the closing hour. */}
        <div className="hero-status flex flex-wrap items-center gap-3">
          <OpenStatusBadge initialStatus={status} />
          <span
            className="inline-flex items-center gap-2 text-small text-mist"
            data-numeric
          >
            <Clock aria-hidden="true" className="size-4 shrink-0" />
            {t('hoursLine', { days: daysOpen, closing: closingLabel })}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/category/phones"
            // `.band-ink a` (globals.css) is an element+class selector and so
            // outranks a plain colour utility — the important modifier keeps
            // the button's own text colour on the ink band.
            className={buttonClasses({
              variant: 'primary',
              size: 'lg',
              className: '!text-ink hover:!text-paper',
            })}
          >
            {t('browseDevices')}
          </Link>
          <Link
            href="/maintenance"
            className={buttonClasses({
              variant: 'outline',
              size: 'lg',
              className: '!text-paper hover:!bg-paper/10',
            })}
          >
            {t('bookRepair')}
          </Link>
        </div>
      </div>
    </section>
  );
}
