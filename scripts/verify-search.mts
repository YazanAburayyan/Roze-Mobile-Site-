import { PrismaClient } from '@prisma/client';
import { buildSearchIndexText } from '../lib/arabic';
import { createSearchProvider } from '../lib/search';

// Rebuilds the same index shape as lib/catalog.getSearchDocuments(), without
// importing it (that module is server-only and cannot load under plain tsx).
const prisma = new PrismaClient();
const rows = await prisma.product.findMany({
  where: { isActive: true },
  include: { images: true, brand: true, category: true },
});

const docs = rows.map((p) => ({
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
    p.titleAr, p.titleEn, p.brand?.name ?? '',
    p.category.nameAr, p.category.nameEn, p.sku,
  ]),
}));

const provider = createSearchProvider(docs);

for (const q of ['ايفون', 'آيفون', 'iPhone', 'سامسونج', 'Samsung', 'لابتوب', 'شاحن']) {
  const hits = provider.search(q, 10);
  const titles = hits.slice(0, 3).map((h) => h.doc.titleEn);
  console.log(`${q.padEnd(9)} -> ${String(hits.length).padStart(2)} hits | ${titles.join(' | ')}`);
}
await prisma.$disconnect();
