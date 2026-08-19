import Image from 'next/image';
import { Clock } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { site } from '@/lib/site';
import { getShopStatus } from '@/lib/hours';
import { buttonClasses } from '@/components/ui';
import { OpenStatusBadge } from '@/components/layout';

/**
 * The hero has to make "sales and service, one shop" legible as a shape, not
 * just a sentence — the brand brief is explicit that the logo's two
 * intersecting circles ARE the idea. So the graphic here is two real
 * overlapping circles (an ink-filled one for "sales", a ring-gradient one for
 * "service") with the actual logo sitting in the lens where they cross.
 *
 * The late-night hours are a genuine differentiator for this neighbourhood,
 * so they get their own line with an icon, in addition to the header's
 * OpenStatusBadge — both above the fold on every breakpoint.
 */
export async function HeroSection() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const status = getShopStatus();

  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div className="wrap grid gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <div className="relative z-10 flex flex-col gap-5">
          <span className="eyebrow">{site.tagline[locale]}</span>

          <h1 className="text-display text-ink">{t('hero.headline')}</h1>

          <p className="lede">{t('hero.subheadline')}</p>

          <div className="flex flex-wrap items-center gap-3">
            <OpenStatusBadge initialStatus={status} className="text-body" />
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-teal-deep/30 bg-mist/50 px-2.5 py-1 text-small font-medium text-teal-deep">
              <Clock aria-hidden="true" className="size-4" />
              {t('hero.openUntilMidnight')}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/category/phones" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
              {t('hero.browseDevices')}
            </Link>
            <Link href="/maintenance" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              {t('hero.bookRepair')}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-sm">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 start-0 my-auto size-[68%] rounded-full bg-ink shadow-roze"
          />
          <div
            aria-hidden="true"
            className="ring-gradient absolute inset-y-0 end-0 my-auto size-[68%] rounded-full shadow-roze"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="logo-plate">
              <Image src="/logo/roze-logo.png" alt="" width={140} height={78} priority />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
