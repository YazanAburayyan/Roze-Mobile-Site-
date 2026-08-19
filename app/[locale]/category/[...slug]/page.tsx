import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, isLocale, type Locale } from '@/i18n/routing';
import {
  resolveCategoryPath,
  getCategoryDescendantIds,
  getCategoryTree,
  getBrandsForCategories,
  listProducts,
  getAllCategoryPaths,
  pick,
  type SortKey,
} from '@/lib/catalog';
import { FILS_PER_DINAR } from '@/lib/money';
import { whatsapp } from '@/lib/site';
import { whatsappUrl, categoryEnquiryMessage } from '@/lib/whatsapp';
import { alternatesFor, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { Breadcrumb } from '@/components/layout';
import type { BreadcrumbItem } from '@/components/layout';
import { CatalogView, CategoryTile } from '@/components/commerce';

type CategoryTree = Awaited<ReturnType<typeof getCategoryTree>>;
type CategoryNode = CategoryTree[number];

const SORT_KEYS: SortKey[] = ['newest', 'price-asc', 'price-desc', 'name'];

function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children as CategoryNode[], id);
    if (found) return found;
  }
  return null;
}

/**
 * Prices arrive in the URL as human-facing dinars (`minPrice=50`), but the
 * catalogue layer works in integer fils. Anything that isn't a finite,
 * non-negative number is silently dropped rather than thrown on — a
 * malformed query string must never 500 this page.
 */
function parseDinarParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * FILS_PER_DINAR);
}

function parseSort(value: string | undefined): SortKey {
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : 'newest';
}

function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function arrayParam(value: string | string[] | undefined): string[] | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value : [value];
}

type PageParams = { locale: string; slug: string[] };
type PageSearchParams = Record<string, string | string[] | undefined>;

export async function generateStaticParams() {
  const paths = await getAllCategoryPaths();
  return paths.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;

  const resolved = await resolveCategoryPath(slug);
  if (!resolved) return {};

  const { category } = resolved;
  const name = pick(l, category.nameAr, category.nameEn);
  const title = pick(l, category.metaTitleAr, category.metaTitleEn) || name;
  const description =
    pick(l, category.metaDescriptionAr, category.metaDescriptionEn) ||
    pick(l, category.descriptionAr, category.descriptionEn) ||
    name;
  const path = `category/${slug.join('/')}`;

  return {
    title,
    description,
    alternates: alternatesFor(path),
    openGraph: { title, description },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;
  setRequestLocale(l);

  const resolved = await resolveCategoryPath(slug);
  if (!resolved) notFound();
  const { category, trail } = resolved;

  const sp = await searchParams;
  const brandSlugs = arrayParam(sp.brand);
  const inStockOnly = firstParam(sp.inStock) === '1';
  const sort = parseSort(firstParam(sp.sort));
  const page = parsePage(firstParam(sp.page));

  let minFils = parseDinarParam(firstParam(sp.minPrice));
  let maxFils = parseDinarParam(firstParam(sp.maxPrice));
  if (minFils != null && maxFils != null && minFils > maxFils) {
    // Nonsense range (min > max) — drop both rather than return an
    // intentionally-empty result set for a malformed query string.
    minFils = undefined;
    maxFils = undefined;
  }

  const [descendantIds, tree, t, tNav] = await Promise.all([
    getCategoryDescendantIds(category.id),
    getCategoryTree(),
    getTranslations({ locale: l, namespace: 'category' }),
    getTranslations({ locale: l, namespace: 'nav' }),
  ]);

  const [brands, result] = await Promise.all([
    getBrandsForCategories(descendantIds),
    listProducts({
      categoryIds: descendantIds,
      brandSlugs,
      minFils,
      maxFils,
      inStockOnly,
      sort,
      page,
      locale: l,
    }),
  ]);

  const node = findNode(tree, category.id);
  const children = node?.children ?? [];

  const basePath = `/category/${slug.join('/')}`;
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tNav('home'), href: '/' },
    ...trail.map((c, index) => ({
      label: pick(l, c.nameAr, c.nameEn),
      href: `/category/${trail
        .slice(0, index + 1)
        .map((entry) => entry.slug)
        .join('/')}`,
    })),
  ];

  const jsonLdItems = [
    { name: tNav('home'), path: '' },
    ...trail.map((c, index) => ({
      name: pick(l, c.nameAr, c.nameEn),
      path: `category/${trail
        .slice(0, index + 1)
        .map((entry) => entry.slug)
        .join('/')}`,
    })),
  ];

  const categoryName = pick(l, category.nameAr, category.nameEn);
  const waHref = whatsappUrl(whatsapp.sales, categoryEnquiryMessage(categoryName, l));

  return (
    <>
      <script {...jsonLdScript(breadcrumbJsonLd(jsonLdItems, l))} />

      <Breadcrumb items={breadcrumbItems} />

      <div className="wrap flex flex-col gap-8 pb-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-h1">{categoryName}</h1>
          {pick(l, category.descriptionAr, category.descriptionEn) ? (
            <p className="lede">{pick(l, category.descriptionAr, category.descriptionEn)}</p>
          ) : null}
        </header>

        {children.length > 0 ? (
          <section aria-labelledby="subcategories-heading" className="flex flex-col gap-4">
            <h2 id="subcategories-heading" className="text-h3">
              {t('subcategories')}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {children.map((child) => (
                <CategoryTile
                  key={child.id}
                  href={`${basePath}/${child.slug}`}
                  label={pick(l, child.nameAr, child.nameEn)}
                  icon={child.icon}
                />
              ))}
            </div>
          </section>
        ) : null}

        <CatalogView
          brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          emptyState={{
            title: t('emptyStateTitle'),
            body: t('emptyStateBody'),
            browseHref: '/',
            browseLabel: t('emptyStateBrowseAction'),
            contactHref: waHref,
            contactLabel: t('emptyStateContactAction'),
          }}
        />
      </div>
    </>
  );
}
