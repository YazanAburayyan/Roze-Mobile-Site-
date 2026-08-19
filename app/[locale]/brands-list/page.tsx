import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, isLocale, type Locale } from '@/i18n/routing';
import { getBrands } from '@/lib/catalog';
import { alternatesFor, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { Breadcrumb } from '@/components/layout';
import type { BreadcrumbItem } from '@/components/layout';
import { BrandTile } from '@/components/commerce';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('brands'), alternates: alternatesFor('brands-list') };
}

/** The brand index. Brand names are Latin and never translated. */
export default async function BrandsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;

  const brands = await getBrands();
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tNav('home'), href: '/' },
    { label: tNav('brands'), href: '/brands-list' },
  ];

  return (
    <>
      <script
        {...jsonLdScript(
          breadcrumbJsonLd(
            [
              { name: tNav('home'), path: '' },
              { name: tNav('brands'), path: 'brands-list' },
            ],
            l,
          ),
        )}
      />

      <Breadcrumb items={breadcrumbItems} />

      <div className="wrap flex flex-col gap-8 pb-16">
        <h1 className="text-h1">{tNav('brands')}</h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <BrandTile
              key={brand.id}
              href={`/brands/${brand.slug}`}
              name={brand.name}
              logo={brand.logo}
            />
          ))}
        </div>
      </div>
    </>
  );
}
