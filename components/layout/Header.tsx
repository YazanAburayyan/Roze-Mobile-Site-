import { Suspense } from 'react';
import Image from 'next/image';
import { Phone, MessageCircle } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { site, phones, whatsapp } from '@/lib/site';
import { whatsappUrl } from '@/lib/whatsapp';
import { getShopStatus } from '@/lib/hours';
import { getTopLevelCategories } from '@/lib/catalog';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { LocaleSwitch } from './LocaleSwitch';
import { OpenStatusBadge } from './OpenStatusBadge';

/**
 * The site header. A Server Component: it fetches the category tree once
 * (`getTopLevelCategories`, which touches Prisma and is guarded by
 * `server-only`) and computes the initial open/closed status
 * (`getShopStatus`, always in Asia/Amman — see lib/hours.ts), then hands
 * both down to the interactive Client Components that render them.
 *
 * Usable at 320px: the four elements that must always stay reachable —
 * mobile menu trigger, the logo plate, a search affordance, and the cart —
 * sit on a single row that fits a 320px viewport with the plate's mandatory
 * 152px floor accounted for. Locale switch, the open/closed badge, and the
 * call/WhatsApp affordance step in at the `sm` breakpoint and are also
 * reachable from inside the mobile drawer regardless (open status + phone
 * numbers are both in `MobileNav`), so nothing is lost, only reflowed.
 */
export async function Header() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const [categories, status] = await Promise.all([
    getTopLevelCategories(),
    Promise.resolve(getShopStatus()),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="flex items-center gap-1 px-2 py-2 sm:gap-3 sm:px-4 lg:px-6">
        <MobileNav categories={categories} initialStatus={status} />

        <Link href="/" aria-label={site.name[locale]} className="shrink-0">
          {/* At the 320px floor the plate sits at its mandatory 120px logo +
              32px clear-space minimum (152px total, matching `.logo-plate`'s
              own `min-inline-size`). It grows on wider screens where there's
              room, via width alone — `h-auto` keeps the 2400:1338 ratio. */}
          <span className="logo-plate">
            <Image
              src="/logo/roze-logo.png"
              alt={site.name[locale]}
              width={160}
              height={89}
              priority
              className="h-auto w-[120px] sm:w-[140px] lg:w-40"
            />
          </span>
        </Link>

        <MegaMenu categories={categories} className="ms-1" />

        <SearchBar className="mx-auto" />

        <div className="ms-auto flex items-center gap-1.5 sm:gap-3">
          {/* Visibility lives on this wrapper alone, not mixed onto elements
              that already carry their own unconditional `inline-flex` —
              two competing unconditional display utilities on one element
              have undefined win order in the generated stylesheet. */}
          <div className="hidden items-center gap-1.5 sm:flex sm:gap-3">
            <a
              href={whatsappUrl(whatsapp.sales, t('header.whatsapp'))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('header.whatsapp')}
              className="inline-flex items-center justify-center rounded-sm p-2 text-teal-deep transition-colors hover:bg-mist motion-reduce:transition-none"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
            </a>
            <a
              href={`tel:${phones.showroom.e164}`}
              aria-label={`${t('header.callUs')} ${phones.showroom.display}`}
              className="inline-flex items-center justify-center rounded-sm p-2 text-teal-deep transition-colors hover:bg-mist motion-reduce:transition-none"
            >
              <Phone aria-hidden="true" className="size-5" />
            </a>

            <OpenStatusBadge initialStatus={status} />
            <Suspense fallback={<span className="inline-block h-9 w-20" />}>
              <LocaleSwitch />
            </Suspense>
          </div>

          <CartButton />
        </div>
      </div>
    </header>
  );
}
