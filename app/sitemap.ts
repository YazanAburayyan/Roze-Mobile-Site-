import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getAllProductSlugs, getAllCategoryPaths, getBrands } from '@/lib/catalog';

/**
 * Sitemap.
 *
 * Every URL is built from SITE_URL, so the whole file follows the domain the
 * moment the client sets NEXT_PUBLIC_SITE_URL — nothing here is domain-bound.
 *
 * Each entry carries both locales via `alternates.languages`, which is how
 * Google reads hreflang from a sitemap. Arabic is the canonical (unprefixed)
 * URL; English mirrors under /en.
 */

type Entry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  changeFrequency: Entry['changeFrequency'],
  priority: number,
): Entry {
  const clean = path.replace(/^\//, '');
  const ar = clean ? `${SITE_URL}/${clean}` : `${SITE_URL}/`;
  const en = clean ? `${SITE_URL}/en/${clean}` : `${SITE_URL}/en`;

  return {
    url: ar,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages: { ar, en } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categoryPaths, brands] = await Promise.all([
    getAllProductSlugs(),
    getAllCategoryPaths(),
    getBrands(),
  ]);

  const staticPages = [
    entry('', 'daily', 1),
    entry('offers', 'daily', 0.9),
    entry('maintenance', 'weekly', 0.9),
    entry('brands-list', 'weekly', 0.6),
    entry('about', 'monthly', 0.5),
    entry('contact', 'monthly', 0.6),
    entry('faq', 'monthly', 0.5),
    entry('how-to-buy', 'monthly', 0.5),
    entry('warranty', 'monthly', 0.4),
    entry('privacy', 'yearly', 0.2),
    entry('track', 'monthly', 0.4),
  ];

  return [
    ...staticPages,
    ...categoryPaths.map((path) => entry(`category/${path.join('/')}`, 'weekly', 0.8)),
    ...brands.map((b) => entry(`brands/${b.slug}`, 'weekly', 0.6)),
    ...products.map((p) => entry(`product/${p.slug}`, 'weekly', 0.7)),
  ];
}
