import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import {
  getFeaturedProducts,
  getNewArrivals,
  getDiscountedProducts,
  getProductsForCategorySlug,
} from '@/lib/catalog';
import { alternatesFor, localBusinessJsonLd, organizationJsonLd, jsonLdScript } from '@/lib/seo';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { ProductRail } from '@/components/home/ProductRail';
import { MaintenanceCta } from '@/components/home/MaintenanceCta';
import { RatingSection } from '@/components/home/RatingSection';
import { LocationSection } from '@/components/home/LocationSection';
import { WhyUsSection } from '@/components/home/WhyUsSection';

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: alternatesFor(''),
  };
}

/**
 * ROZE homepage.
 *
 * Every section reads from lib/catalog (never Prisma directly), lib/site.ts
 * (never a typed-in phone/address/hours literal) and next-intl (never a
 * hardcoded UI string). Each rail hides itself when its query is empty
 * rather than rendering a bare heading — see ProductRail — though with 48
 * seeded products, 28 discounted and 8 new arrivals, nothing here should
 * actually be empty.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [featured, newArrivals, discounted, phoneProducts, laptopProducts, entertainmentProducts] =
    await Promise.all([
      getFeaturedProducts(8),
      getNewArrivals(8),
      getDiscountedProducts(8),
      getProductsForCategorySlug('phones', 8),
      getProductsForCategorySlug('laptops', 8),
      getProductsForCategorySlug('entertainment', 8),
    ]);

  return (
    <>
      <script {...jsonLdScript(localBusinessJsonLd(locale as Locale))} />
      <script {...jsonLdScript(organizationJsonLd(locale as Locale))} />

      <HeroSection />
      <CategoryStrip />

      <ProductRail heading={t('home.featuredProducts')} products={featured} />

      <ProductRail heading={t('home.newArrivals')} products={newArrivals} />

      <ProductRail heading={t('home.offers')} products={discounted} viewAllHref="/offers" />

      <ProductRail
        eyebrow={t('home.categories')}
        heading={t('nav.phones')}
        products={phoneProducts}
        viewAllHref="/category/phones"
      />
      <ProductRail
        eyebrow={t('home.categories')}
        heading={t('nav.laptops')}
        products={laptopProducts}
        viewAllHref="/category/laptops"
      />
      <ProductRail
        eyebrow={t('home.categories')}
        heading={t('nav.entertainment')}
        products={entertainmentProducts}
        viewAllHref="/category/entertainment"
      />

      <MaintenanceCta />
      <RatingSection />
      <LocationSection />
      <WhyUsSection />
    </>
  );
}
