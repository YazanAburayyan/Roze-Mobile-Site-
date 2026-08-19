import 'server-only';
import { prisma } from './db';
import type { Category as CategoryRow } from '@prisma/client';
import type { Locale } from '@/i18n/routing';
import { buildSearchIndexText } from './arabic';

/**
 * The catalogue data layer.
 *
 * Every page reads the catalogue through this module and never touches Prisma
 * directly. That keeps the query surface in one file, so swapping SQLite for
 * Postgres — or putting a cache or a headless commerce API behind it — is a
 * change here and nowhere else. See EXTENDING.md.
 */

/** Pick the field for the active locale. Every model is bilingual. */
export function pick<T>(locale: Locale, ar: T, en: T): T {
  return locale === 'ar' ? ar : en;
}

export const PRODUCTS_PER_PAGE = 12;

const productInclude = {
  images: { orderBy: { sortOrder: 'asc' } },
  brand: true,
  category: true,
} as const;

export type ProductWithRelations = Awaited<
  ReturnType<typeof getProductBySlug>
> extends infer T
  ? T extends null | undefined
    ? never
    : T
  : never;

/* ------------------------------------------------------------------ categories */

export async function getCategoryTree() {
  const all = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  type Node = (typeof all)[number] & { children: Node[] };
  const byId = new Map<string, Node>();
  for (const c of all) byId.set(c.id, { ...c, children: [] });

  const roots: Node[] = [];
  for (const node of byId.values()) {
    if (node.parentId) byId.get(node.parentId)?.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function getTopLevelCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  });
}

/**
 * Resolve a nested URL path like `/category/phones/phone-accessories/chargers-cables`.
 *
 * The slugs must form a real ancestor chain — otherwise `/category/laptops/chargers-cables`
 * would silently resolve to the chargers category and produce a page with a lying
 * breadcrumb. Depth is unbounded; the walk is what enforces correctness.
 */
export async function resolveCategoryPath(slugs: string[]) {
  if (slugs.length === 0) return null;

  let parentId: string | null = null;
  const trail: CategoryRow[] = [];

  for (const slug of slugs) {
    const found: CategoryRow | null = await prisma.category.findFirst({
      where: { slug, parentId, isActive: true },
    });
    if (!found) return null;
    trail.push(found);
    parentId = found.id;
  }

  return { category: trail[trail.length - 1]!, trail };
}

/** A category page shows its own products AND everything nested beneath it. */
export async function getCategoryDescendantIds(rootId: string): Promise<string[]> {
  const ids = [rootId];
  let frontier = [rootId];

  while (frontier.length) {
    const children = await prisma.category.findMany({
      where: { parentId: { in: frontier }, isActive: true },
      select: { id: true },
    });
    frontier = children.map((c) => c.id);
    ids.push(...frontier);
  }
  return ids;
}

/* -------------------------------------------------------------------- brands */

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findFirst({ where: { slug, isActive: true } });
}

/** Brands that actually have products in a given set of categories. */
export async function getBrandsForCategories(categoryIds: string[]) {
  const rows = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: categoryIds }, brandId: { not: null } },
    select: { brand: true },
    distinct: ['brandId'],
  });
  return rows
    .map((r) => r.brand)
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* ------------------------------------------------------------------ products */

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';

export type ProductQuery = {
  categoryIds?: string[];
  brandSlugs?: string[];
  minFils?: number;
  maxFils?: number;
  inStockOnly?: boolean;
  discountedOnly?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
  locale?: Locale;
};

function orderByFor(sort: SortKey, locale: Locale) {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' } as const;
    case 'price-desc':
      return { price: 'desc' } as const;
    case 'name':
      return locale === 'ar' ? ({ titleAr: 'asc' } as const) : ({ titleEn: 'asc' } as const);
    case 'newest':
    default:
      return { createdAt: 'desc' } as const;
  }
}

export async function listProducts(query: ProductQuery = {}) {
  const {
    categoryIds,
    brandSlugs,
    minFils,
    maxFils,
    inStockOnly,
    discountedOnly,
    sort = 'newest',
    page = 1,
    perPage = PRODUCTS_PER_PAGE,
    locale = 'ar',
  } = query;

  const where = {
    isActive: true,
    ...(categoryIds?.length ? { categoryId: { in: categoryIds } } : {}),
    ...(brandSlugs?.length ? { brand: { slug: { in: brandSlugs } } } : {}),
    ...(inStockOnly ? { inStock: true } : {}),
    ...(minFils != null || maxFils != null
      ? { price: { ...(minFils != null ? { gte: minFils } : {}), ...(maxFils != null ? { lte: maxFils } : {}) } }
      : {}),
    // "Discounted" means a compareAtPrice exists AND is genuinely higher.
    ...(discountedOnly ? { compareAtPrice: { not: null } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: orderByFor(sort, locale),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  const products = discountedOnly
    ? rows.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price)
    : rows;

  return {
    products,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      ...productInclude,
      attributes: { orderBy: { sortOrder: 'asc' } },
    },
  });
}

/** Same category first, then same brand. Never returns the product itself. */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  brandId: string | null,
  take = 4,
) {
  const sameCategory = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: productId } },
    include: productInclude,
    take,
  });
  if (sameCategory.length >= take || !brandId) return sameCategory;

  const seen = new Set(sameCategory.map((p) => p.id));
  const sameBrand = await prisma.product.findMany({
    where: {
      isActive: true,
      brandId,
      id: { not: productId, notIn: [...seen] },
    },
    include: productInclude,
    take: take - sameCategory.length,
  });
  return [...sameCategory, ...sameBrand];
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export async function getNewArrivals(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
    take,
  });
}

/** Products with a real discount — drives /offers and the homepage offers rail. */
export async function getDiscountedProducts(take?: number) {
  const rows = await prisma.product.findMany({
    where: { isActive: true, compareAtPrice: { not: null } },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });
  const real = rows.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price);
  return take ? real.slice(0, take) : real;
}

/** A few products from one category, for the homepage per-category rails. */
export async function getProductsForCategorySlug(slug: string, take = 8) {
  const root = await prisma.category.findFirst({ where: { slug, isActive: true } });
  if (!root) return [];
  const ids = await getCategoryDescendantIds(root.id);
  return prisma.product.findMany({
    where: { isActive: true, categoryId: { in: ids } },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
    take,
  });
}

/* -------------------------------------------------------------------- search */

export type SearchDoc = {
  id: string;
  slug: string;
  sku: string;
  titleAr: string;
  titleEn: string;
  brand: string | null;
  categoryAr: string;
  categoryEn: string;
  categorySlug: string;
  priceFils: number;
  compareAtPriceFils: number | null;
  inStock: boolean;
  image: string;
  /** Pre-normalised, script-agnostic blob. This is what Fuse indexes. */
  haystack: string;
};

/**
 * The search index, built server-side and handed to the client once.
 *
 * `haystack` is normalised through lib/arabic so that `ايفون`, `آيفون` and
 * `iPhone` all hit the same SKU. Fuse then does fuzzy matching over already-
 * normalised text, which is the only way Arabic search behaves acceptably.
 *
 * NOTE: this ships the whole catalogue to the browser. Correct at ~48 SKUs,
 * wrong at ~1500 — at which point this function becomes a server route or a
 * Meilisearch query and nothing else changes. See EXTENDING.md.
 */
export async function getSearchDocuments(): Promise<SearchDoc[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
  });

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    brand: p.brand?.name ?? null,
    categoryAr: p.category.nameAr,
    categoryEn: p.category.nameEn,
    categorySlug: p.category.slug,
    priceFils: p.price,
    compareAtPriceFils: p.compareAtPrice,
    inStock: p.inStock,
    image: p.images[0]?.url ?? '/products/placeholder.svg',
    haystack: buildSearchIndexText([
      p.titleAr,
      p.titleEn,
      p.brand?.name ?? '',
      p.category.nameAr,
      p.category.nameEn,
      p.sku,
    ]),
  }));
}

/* ------------------------------------------------------------------ services */

export async function getServiceTypes() {
  return prisma.serviceType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getServiceTypeBySlug(slug: string) {
  return prisma.serviceType.findFirst({ where: { slug, isActive: true } });
}

/** Every product slug — for the sitemap and for static generation. */
export async function getAllProductSlugs() {
  return prisma.product.findMany({ where: { isActive: true }, select: { slug: true } });
}

export async function getAllCategoryPaths(): Promise<string[][]> {
  const all = await prisma.category.findMany({ where: { isActive: true } });
  const byId = new Map(all.map((c) => [c.id, c]));

  return all.map((c) => {
    const path: string[] = [];
    let node: (typeof all)[number] | undefined = c;
    while (node) {
      path.unshift(node.slug);
      node = node.parentId ? byId.get(node.parentId) : undefined;
    }
    return path;
  });
}
