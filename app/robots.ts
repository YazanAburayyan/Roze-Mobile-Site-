import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Robots.
 *
 * Cart, checkout and search results have nothing to offer a crawler and
 * would waste crawl budget on near-duplicate pages, so they are disallowed.
 * Order tracking and confirmation pages contain customer data and must never
 * be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cart', '/checkout', '/search', '/en/cart', '/en/checkout', '/en/search'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
