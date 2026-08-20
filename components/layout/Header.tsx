import { Suspense } from 'react';
import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { site } from '@/lib/site';
import { getShopStatus } from '@/lib/hours';
import { getTopLevelCategories } from '@/lib/catalog';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { LocaleSwitch } from './LocaleSwitch';
import { OpenStatusBadge } from './OpenStatusBadge';
import { HOME_SECTIONS } from './home-sections';

/**
 * The site header — a dark bar.
 *
 * LOGO: because this bar is ink, the real mark can sit here directly with no
 * container. That is the whole point of the dark header — it removes the
 * constraint rather than working around it. `.logo-plate` is gone and must
 * not come back. The footer therefore uses the wordmark instead, so the mark
 * never appears twice in one viewport.
 *
 * Served through next/image at the size actually rendered: the source PNG is
 * 2400px wide and shipping that into a ~132px slot was part of why the old
 * page felt slow.
 *
 * NAVIGATION: five in-page anchors rather than a category mega-menu. The
 * homepage now carries About / Shop / Services / Contact as real sections, so
 * the top-level menu stays short and a first-time visitor can see the whole
 * shop by scrolling. The full category tree is still one click away inside
 * the Shop section and in the mobile drawer, so nothing became unreachable.
 */
export async function Header() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const [categories, status] = await Promise.all([
    getTopLevelCategories(),
    Promise.resolve(getShopStatus()),
  ]);

  return (
    <header className="band-ink sticky top-0 z-40 border-b border-line-invert">
      {/* NOT .wrap: at 1080px the nav, badge, search, locale and cart do not fit,
          and because the nav was flex-1/min-w-0 its no-shrink children spilled
          out of their box and overlapped the logo and the status badge. */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        <MobileNav categories={categories} initialStatus={status} />

        <Link
          href="/"
          aria-label={site.name[locale]}
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo/roze-logo.png"
            alt={site.name[locale]}
            width={132}
            height={74}
            sizes="132px"
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav
          aria-label={t('header.sectionsLabel')}
          className="hidden shrink-0 items-center gap-5 lg:flex xl:gap-7"
        >
          {HOME_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="shrink-0 whitespace-nowrap text-small font-medium text-mist transition-colors hover:text-paper"
            >
              {t(section.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden xl:block">
            <OpenStatusBadge initialStatus={status} />
          </div>

          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>

          <div className="hidden sm:block">
            <Suspense fallback={null}>
              <LocaleSwitch />
            </Suspense>
          </div>

          <CartButton />
        </div>
      </div>
    </header>
  );
}
