import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, isLocale, Link, type Locale } from '@/i18n/routing';
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
  getAllCategoryPaths,
  resolveCategoryPath,
  pick,
} from '@/lib/catalog';
import { productImageUrl } from '@/lib/product-image';
import { productEnquiryMessage, whatsappUrl } from '@/lib/whatsapp';
import { whatsapp } from '@/lib/site';
import {
  absoluteUrl,
  alternatesFor,
  breadcrumbJsonLd,
  jsonLdScript,
  productJsonLd,
} from '@/lib/seo';
import { ProductGallery, PriceDisplay, StockBadge, ProductCard } from '@/components/commerce';
import { AddToCartPanel } from './AddToCartPanel';

/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}

type ProductPageParams = { locale: string; slug: string };

async function loadProduct(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductPageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;

  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = pick(l, product.titleAr, product.titleEn);
  const description = pick(
    l,
    product.shortDescAr ?? product.descriptionAr,
    product.shortDescEn ?? product.descriptionEn
  );
  const primaryImage = product.images[0];
  const path = `product/${slug}`;

  return {
    title,
    description,
    alternates: alternatesFor(path),
    openGraph: {
      type: 'website',
      title,
      description,
      url: absoluteUrl(l, path),
      images: primaryImage
        ? [{ url: productImageUrl(primaryImage), alt: pick(l, primaryImage.altAr, primaryImage.altEn) }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [productImageUrl(primaryImage)] : undefined,
    },
  };
}

/** Text that reads as numbers/Latin — safe to force LTR so bidi never scrambles it. */
function isArabicText(value: string): boolean {
  return /[؀-ۿ]/.test(value);
}

type Attribute = { id: string; nameAr: string; nameEn: string; valueAr: string; valueEn: string; group: string | null };

function groupAttributes(attributes: Attribute[]) {
  const groups: { key: string; group: string | null; items: Attribute[] }[] = [];
  for (const attr of attributes) {
    const key = attr.group ?? '__ungrouped__';
    let bucket = groups.find((g) => g.key === key);
    if (!bucket) {
      bucket = { key, group: attr.group, items: [] };
      groups.push(bucket);
    }
    bucket.items.push(attr);
  }
  return groups;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<ProductPageParams>;
}) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;
  setRequestLocale(l);

  const product = await loadProduct(slug);

  const [related, allCategoryPaths, t, tNav, tA11y] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, product.brandId),
    getAllCategoryPaths(),
    getTranslations({ locale: l, namespace: 'product' }),
    getTranslations({ locale: l, namespace: 'nav' }),
    getTranslations({ locale: l, namespace: 'a11y' }),
  ]);

  const title = pick(l, product.titleAr, product.titleEn);
  const description = pick(l, product.descriptionAr, product.descriptionEn);
  const primaryImage = product.images[0];

  // Walk the real ancestor chain for the breadcrumb, rather than assuming
  // the product's category is top-level.
  const ancestrySlugs =
    allCategoryPaths.find((path) => path[path.length - 1] === product.category.slug) ??
    [product.category.slug];
  const resolvedTrail = await resolveCategoryPath(ancestrySlugs);
  const categoryTrail = resolvedTrail?.trail ?? [product.category];

  const productUrl = absoluteUrl(l, `product/${slug}`);
  const enquiryMessage = productEnquiryMessage(product, productUrl, l);
  const whatsappHref = whatsappUrl(whatsapp.sales, enquiryMessage);

  const breadcrumbItems = [
    { name: tNav('home'), path: '' },
    ...categoryTrail.map((cat, index) => ({
      name: pick(l, cat.nameAr, cat.nameEn),
      path: `category/${ancestrySlugs.slice(0, index + 1).join('/')}`,
    })),
    { name: title, path: `product/${slug}` },
  ];

  const attributeGroups = groupAttributes(product.attributes);
  const hasLowStock =
    product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div className="wrap flex flex-col gap-10 py-8">
      <script {...jsonLdScript(productJsonLd(product, l))} />
      <script {...jsonLdScript(breadcrumbJsonLd(breadcrumbItems, l))} />

      <nav aria-label={tA11y('breadcrumb')}>
        <ol className="flex flex-wrap items-center gap-2 text-small text-muted">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={item.path || 'home'} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {isLast ? (
                  <span className="text-ink" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path ? `/${item.path}` : '/'} className="hover:text-teal-deep">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url, altAr: img.altAr, altEn: img.altEn }))}
          productTitle={title}
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {product.brand ? (
              <span lang="en" className="font-latin text-small font-medium text-muted">
                {product.brand.name}
              </span>
            ) : null}
            <h1 className="text-h1 text-ink">{title}</h1>
            <Link
              href={`/${ancestrySlugs.length ? `category/${ancestrySlugs.join('/')}` : ''}`}
              className="text-small text-teal-deep hover:underline"
            >
              {pick(l, product.category.nameAr, product.category.nameEn)}
            </Link>
            <span dir="ltr" className="font-mono text-small text-muted">
              {t('sku')}: {product.sku}
            </span>
          </div>

          <PriceDisplay priceFils={product.price} compareAtPriceFils={product.compareAtPrice} size="lg" />

          <div className="flex flex-col gap-1">
            <StockBadge inStock={product.inStock} stockQuantity={product.stockQuantity} className="self-start" />
            {hasLowStock ? (
              <p className="text-small text-teal-deep">{t('onlyLeftCount', { count: product.stockQuantity })}</p>
            ) : null}
          </div>

          <AddToCartPanel
            product={{
              id: product.id,
              slug: product.slug,
              sku: product.sku,
              titleAr: product.titleAr,
              titleEn: product.titleEn,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              stockQuantity: product.stockQuantity,
              inStock: product.inStock,
            }}
            image={productImageUrl(primaryImage)}
            whatsappHref={whatsappHref}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <section aria-labelledby="product-description-heading" className="flex flex-col gap-3">
          <h2 id="product-description-heading" className="text-h3 text-ink">
            {t('description')}
          </h2>
          <p className="text-body text-muted" style={{ maxInlineSize: 'var(--roze-measure)' }}>
            {description}
          </p>
        </section>

        {attributeGroups.length > 0 ? (
          <section aria-labelledby="product-specs-heading" className="flex flex-col gap-3">
            <h2 id="product-specs-heading" className="text-h3 text-ink">
              {t('specifications')}
            </h2>
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-full border-collapse font-mono text-small">
                <tbody>
                  {attributeGroups.map((bucket) => (
                    <React.Fragment key={bucket.key}>
                      {bucket.group ? (
                        <tr>
                          <th
                            colSpan={2}
                            scope="colgroup"
                            className="border-b border-line bg-mist/40 px-4 py-2 text-start font-medium text-ink"
                          >
                            {bucket.group}
                          </th>
                        </tr>
                      ) : null}
                      {bucket.items.map((attr) => {
                        const name = pick(l, attr.nameAr, attr.nameEn);
                        const value = pick(l, attr.valueAr, attr.valueEn);
                        return (
                          <tr key={attr.id} className="border-b border-line last:border-b-0 odd:bg-paper even:bg-mist/10">
                            <th scope="row" className="w-2/5 px-4 py-2 text-start font-normal text-muted">
                              {name}
                            </th>
                            <td dir={isArabicText(value) ? undefined : 'ltr'} className="px-4 py-2 text-ink">
                              {value}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-products-heading" className="flex flex-col gap-4">
          <h2 id="related-products-heading" className="text-h3 text-ink">
            {t('relatedProducts')}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
