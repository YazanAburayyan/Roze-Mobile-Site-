import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, isLocale, type Locale } from '@/i18n/routing';
import { getDiscountedProducts, PRODUCTS_PER_PAGE, type SortKey } from '@/lib/catalog';
import { discountPercent } from '@/lib/money';
import { whatsapp } from '@/lib/site';
import { whatsappUrl, offersEnquiryMessage } from '@/lib/whatsapp';
import { alternatesFor, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { Breadcrumb } from '@/components/layout';
import type { BreadcrumbItem } from '@/components/layout';
import { CatalogView } from '@/components/commerce';

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_KEYS: SortKey[] = ['newest', 'price-asc', 'price-desc', 'name'];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('offers'), alternates: alternatesFor('offers') };
}

/**
 * Every genuinely discounted SKU.
 *
 * `getDiscountedProducts()` already excludes anything whose `compareAtPrice`
 * is not actually higher than its price — a "discount" that isn't one must
 * never appear here. Sorting and pagination are applied in memory because the
 * genuine-discount test cannot be expressed as a Prisma column comparison on
 * SQLite; at this catalogue size that is free.
 */
export default async function OffersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;

  const sp = await searchParams;
  const sortRaw = first(sp.sort);
  const sort: SortKey = SORT_KEYS.includes(sortRaw as SortKey)
    ? (sortRaw as SortKey)
    : 'newest';
  const pageRaw = Number(first(sp.page));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const t = await getTranslations({ locale, namespace: 'category' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const all = await getDiscountedProducts();

  const sorted = [...all].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return l === 'ar'
          ? a.titleAr.localeCompare(b.titleAr, 'ar')
          : a.titleEn.localeCompare(b.titleEn, 'en');
      default:
        // Biggest genuine saving first is the most useful "newest" for a deals page.
        return (
          (discountPercent(b.price, b.compareAtPrice) ?? 0) -
          (discountPercent(a.price, a.compareAtPrice) ?? 0)
        );
    }
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const slice = sorted.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tNav('home'), href: '/' },
    { label: tNav('offers'), href: '/offers' },
  ];

  return (
    <>
      <script
        {...jsonLdScript(
          breadcrumbJsonLd(
            [
              { name: tNav('home'), path: '' },
              { name: tNav('offers'), path: 'offers' },
            ],
            l,
          ),
        )}
      />

      <Breadcrumb items={breadcrumbItems} />

      <div className="wrap flex flex-col gap-8 pb-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-h1">{tNav('offers')}</h1>
        </header>

        <CatalogView
          brands={[]}
          products={slice}
          total={total}
          page={safePage}
          pageCount={pageCount}
          emptyState={{
            title: t('emptyStateTitle'),
            body: t('emptyStateBody'),
            browseHref: '/',
            browseLabel: t('emptyStateBrowseAction'),
            contactHref: whatsappUrl(whatsapp.sales, offersEnquiryMessage(l)),
            contactLabel: t('emptyStateContactAction'),
          }}
        />
      </div>
    </>
  );
}
