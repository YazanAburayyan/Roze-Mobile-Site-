import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getFeaturedProducts } from '@/lib/catalog';
import {
  alternatesFor,
  localBusinessJsonLd,
  organizationJsonLd,
  jsonLdScript,
} from '@/lib/seo';
import { HeroSection } from '@/components/home/HeroSection';
import { AboutSection } from '@/components/home/AboutSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { ProductRail } from '@/components/home/ProductRail';
import { MaintenanceCta } from '@/components/home/MaintenanceCta';
import { RatingSection } from '@/components/home/RatingSection';
import { LocationSection } from '@/components/home/LocationSection';

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternatesFor('') };
}

/**
 * ROZE homepage.
 *
 * COMPOSITION NOTE — why there is only ONE product rail.
 *
 * This page used to stack six near-identical rails: featured, new arrivals,
 * offers, phones, laptops, entertainment. On desktop that was ~10,000px of the
 * same component, and it was the main reason the page read as filler rather
 * than as a shop. The three per-category rails duplicated the category grid
 * directly above them, and "new arrivals" and "offers" are both reachable from
 * the nav and from /offers.
 *
 * So: one curated rail, and the category grid does the browsing work it was
 * always meant to do. If a merchandising rail is wanted back later, add it
 * here — but not three of them.
 *
 * Band rhythm: ink hero -> sand trust -> paper categories -> paper rail ->
 * INK maintenance -> paper rating -> sand location -> ink footer. The two dark
 * bands give the page a spine.
 *
 * Everything reads from lib/catalog (never Prisma), lib/site.ts (never a typed
 * phone/address/hour) and next-intl (never a hardcoded string).
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const featured = await getFeaturedProducts(8);

  return (
    <>
      <script {...jsonLdScript(localBusinessJsonLd(locale as Locale))} />
      <script {...jsonLdScript(organizationJsonLd(locale as Locale))} />

      <div id="top" />
      <HeroSection />
      <TrustStrip />
      <AboutSection />
      <CategoryStrip />

      <ProductRail
        heading={t('home.featuredProducts')}
        products={featured}
        viewAllHref="/offers"
      />

      <MaintenanceCta />
      <RatingSection />
      <LocationSection />
    </>
  );
}
