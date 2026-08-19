import {
  SITE_URL,
  site,
  address,
  phones,
  social,
  reputation,
  currency,
} from './site';
import { schemaOpeningHours } from './hours';
import type { Locale } from '@/i18n/routing';

/**
 * Structured data.
 *
 * Every value here is read from `lib/site.ts` rather than typed inline, so the
 * LocalBusiness block cannot drift from the address, coordinates, phone and
 * opening hours shown on the contact page. That drift is the usual way a
 * LocalBusiness block ends up quietly wrong.
 */

/** `/` for Arabic, `/en/...` for English. */
export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\//, '');
  if (locale === 'ar') return clean ? `/${clean}` : '/';
  return clean ? `/en/${clean}` : '/en';
}

export function absoluteUrl(locale: Locale, path = ''): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** hreflang pair + canonical, for every page's metadata. */
export function alternatesFor(path = '') {
  return {
    canonical: localePath('ar', path),
    languages: {
      ar: localePath('ar', path),
      en: localePath('en', path),
      'x-default': localePath('ar', path),
    },
  };
}

export function localBusinessJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'LocalBusiness'],
    '@id': `${SITE_URL}/#business`,
    name: site.name[locale],
    alternateName: locale === 'ar' ? site.name.en : site.name.ar,
    description: site.category[locale],
    url: SITE_URL,
    telephone: phones.showroom.e164,
    image: `${SITE_URL}/og-image.png`,
    logo: `${SITE_URL}/logo/roze-logo.png`,
    priceRange: '$$',
    currenciesAccepted: currency.code,
    paymentAccepted: locale === 'ar' ? 'نقداً عند الاستلام' : 'Cash on delivery',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street[locale],
      addressLocality: address.locality[locale],
      addressCountry: address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: address.coordinates.lat,
      longitude: address.coordinates.lng,
    },
    hasMap: address.mapsUrl,
    openingHoursSpecification: schemaOpeningHours().map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: reputation.ratingValue,
      reviewCount: reputation.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: [social.facebook, address.mapsUrl],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: phones.showroom.e164,
        contactType: 'sales',
        areaServed: 'JO',
        availableLanguage: ['ar', 'en'],
      },
      {
        '@type': 'ContactPoint',
        telephone: phones.service1.e164,
        contactType: 'technical support',
        areaServed: 'JO',
        availableLanguage: ['ar', 'en'],
      },
    ],
  };
}

export function organizationJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: site.name[locale],
    legalName: site.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo/roze-logo.png`,
    sameAs: [social.facebook],
  };
}

export function productJsonLd(
  product: {
    slug: string;
    sku: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    price: number;
    inStock: boolean;
    images: { url: string }[];
    brand?: { name: string } | null;
  },
  locale: Locale,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: locale === 'ar' ? product.titleAr : product.titleEn,
    description: locale === 'ar' ? product.descriptionAr : product.descriptionEn,
    sku: product.sku,
    image: product.images.map((i) =>
      i.url.startsWith('http') ? i.url : `${SITE_URL}${i.url}`,
    ),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(locale, `product/${product.slug}`),
      priceCurrency: currency.code,
      // schema.org wants a decimal string, and money is stored in fils.
      price: (product.price / 1000).toFixed(currency.decimals),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@id': `${SITE_URL}/#business` },
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  locale: Locale,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

/** Renders a JSON-LD block. Server components only. */
export function jsonLdScript(data: unknown) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      // `<` is escaped so a product title can never break out of the script tag.
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    },
  };
}
