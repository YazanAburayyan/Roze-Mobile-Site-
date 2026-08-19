import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, isLocale, type Locale } from '@/i18n/routing';
import {
  getBrands,
  getBrandBySlug,
  listProducts,
  pick,
  type SortKey,
} from '@/lib/catalog';
import { FILS_PER_DINAR } from '@/lib/money';
import { whatsapp } from '@/lib/site';
import { whatsappUrl, brandEnquiryMessage } from '@/lib/whatsapp';
import { alternatesFor, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { Breadcrumb } from '@/components/layout';
import type { BreadcrumbItem } from '@/components/layout';
import { CatalogView } from '@/components/commerce';

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_KEYS: SortKey[] = ['newest', 'price-asc', 'price-desc', 'name'];

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parseDinar(v: string | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * FILS_PER_DINAR);
}

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};

  const description = pick(l, brand.descriptionAr, brand.descriptionEn) ?? brand.name;
  return {
    title: brand.name,
    description,
    alternates: alternatesFor(`brands/${slug}`),
    openGraph: { title: brand.name, description },
  };
}

/**
 * One brand's products.
 *
 * Reuses CatalogView — the single grid implementation shared with the
 * category and offers pages. Brand names are Latin and never translated.
 */
export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const sp = await searchParams;
  const sortRaw = first(sp.sort);
  const sort: SortKey = SORT_KEYS.includes(sortRaw as SortKey)
    ? (sortRaw as SortKey)
    : 'newest';
  const pageRaw = Number(first(sp.page));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const result = await listProducts({
    brandSlugs: [slug],
    minFils: parseDinar(first(sp.minPrice)),
    maxFils: parseDinar(first(sp.maxPrice)),
    inStockOnly: first(sp.inStock) === '1',
    sort,
    page,
    locale: l,
  });

  const t = await getTranslations({ locale, namespace: 'category' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tNav('home'), href: '/' },
    { label: tNav('brands'), href: '/brands-list' },
    { label: brand.name, href: `/brands/${slug}` },
  ];

  return (
    <>
      <script
        {...jsonLdScript(
          breadcrumbJsonLd(
            [
              { name: tNav('home'), path: '' },
              { name: tNav('brands'), path: 'brands-list' },
              { name: brand.name, path: `brands/${slug}` },
            ],
            l,
          ),
        )}
      />

      <Breadcrumb items={breadcrumbItems} />

      <div className="wrap flex flex-col gap-8 pb-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-h1 font-latin">{brand.name}</h1>
          {pick(l, brand.descriptionAr, brand.descriptionEn) ? (
            <p className="lede">{pick(l, brand.descriptionAr, brand.descriptionEn)}</p>
          ) : null}
        </header>

        <CatalogView
          brands={[]}
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          emptyState={{
            title: t('emptyStateTitle'),
            body: t('emptyStateBody'),
            browseHref: '/brands-list',
            browseLabel: t('emptyStateBrowseAction'),
            contactHref: whatsappUrl(whatsapp.sales, brandEnquiryMessage(brand.name, l)),
            contactLabel: t('emptyStateContactAction'),
          }}
        />
      </div>
    </>
  );
}
