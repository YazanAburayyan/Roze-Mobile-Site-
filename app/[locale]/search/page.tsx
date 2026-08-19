import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isLocale, routing, type Locale } from '@/i18n/routing';
import { getSearchDocuments } from '@/lib/catalog';
import { alternatesFor } from '@/lib/seo';
import { SearchResults } from './SearchResults';

type PageParams = { locale: string };
type PageSearchParams = { q?: string | string[] };

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: l, namespace: 'search' });

  return {
    title: t('pageTitle'),
    alternates: alternatesFor('search'),
    // Query-driven results pages are near-duplicate content across every
    // possible `q` value — nothing here is worth indexing.
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;
  setRequestLocale(l);

  const sp = await searchParams;
  const initialQuery = firstParam(sp.q);

  const docs = await getSearchDocuments();

  return (
    <div className="wrap flex flex-col gap-6 pb-16 pt-8">
      <SearchResults docs={docs} initialQuery={initialQuery} />
    </div>
  );
}
