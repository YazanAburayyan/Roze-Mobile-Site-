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
import { ProductBody } from './ProductBody';
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
  const shortDescription = pick(l, product.shortDescAr, product.shortDescEn);
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

  return (
    <>
      <script {...jsonLdScript(productJsonLd(product, l))} />
      <script {...jsonLdScript(breadcrumbJsonLd(breadcrumbItems, l))} />

      {/* Breadcrumb + the buy block share one paper band. */}
      <div className="band-paper">
        <div className="wrap py-6">
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
                      <Link
                        href={item.path ? `/${item.path}` : '/'}
                        className="hover:text-teal-deep"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery sits on its own surface card, as in the reference. */}
            <div className="rounded-lg border border-line bg-surface p-4 sm:p-6">
              <ProductGallery
                images={product.images.map((img) => ({
                  url: img.url,
                  altAr: img.altAr,
                  altEn: img.altEn,
                }))}
                productTitle={title}
              />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                {product.brand ? (
                  <span lang="en" className="font-latin text-small font-medium text-muted">
                    {product.brand.name}
                  </span>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-h1 text-ink">{title}</h1>
                  <StockBadge
                    inStock={product.inStock}
                    stockQuantity={product.stockQuantity}
                  />
                </div>

                <Link
                  href={`/${ancestrySlugs.length ? `category/${ancestrySlugs.join('/')}` : ''}`}
                  className="text-small text-teal-deep hover:underline"
                >
                  {pick(l, product.category.nameAr, product.category.nameEn)}
                </Link>
              </div>

              <PriceDisplay
                priceFils={product.price}
                compareAtPriceFils={product.compareAtPrice}
                size="lg"
              />

              {shortDescription ? (
                <p
                  className="text-body text-muted"
                  style={{ maxInlineSize: 'var(--roze-measure)' }}
                >
                  {shortDescription}
                </p>
              ) : null}

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

              {/* SKU and category sit under the buy controls, as metadata —
                  the reference put SKU/tags here too. No tag list: there is
                  no tag data, and inventing one would be decoration. */}
              <dl className="flex flex-col gap-1.5 border-t border-line pt-5 text-small">
                <div className="flex gap-2">
                  <dt className="text-muted">{t('sku')}</dt>
                  <dd dir="ltr" data-numeric className="font-mono text-ink">
                    {product.sku}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">{t('category')}</dt>
                  <dd className="text-ink">
                    {pick(l, product.category.nameAr, product.category.nameEn)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Description / specifications tabs on the sand band. */}
      <div className="band-sand">
        <div className="wrap py-12 lg:py-16">
          <ProductBody
            locale={l}
            description={description}
            specGroups={attributeGroups}
            productUrl={productUrl}
            whatsappHref={whatsappHref}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <div className="band-paper">
          <section
            aria-labelledby="related-products-heading"
            className="wrap flex flex-col gap-6 py-12 lg:py-16"
          >
            <h2 id="related-products-heading" className="text-h2 text-ink">
              {t('relatedProducts')}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        </div>
      ) : null}

    </>
  );
}
