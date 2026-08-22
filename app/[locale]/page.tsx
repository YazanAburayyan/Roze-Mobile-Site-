import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import {
  alternatesFor,
  localBusinessJsonLd,
  organizationJsonLd,
  jsonLdScript,
} from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternatesFor('') };
}

/**
 * Homepage — PLACEHOLDER.
 *
 * The visual layer was reset deliberately: every section component under
 * components/home/ was deleted so the homepage can be rebuilt page by page
 * from incoming designs. Nothing below the presentation layer was touched —
 * the catalogue, cart, checkout, order notifications, /track and the whole
 * i18n key set are intact, and the site chrome (header, footer) still wraps
 * this page.
 *
 * WHAT STAYS HERE AND WHY: the metadata and the LocalBusiness / Organization
 * JSON-LD are SEO plumbing, not visual layer. Dropping them would silently
 * regress the structured data that scripts/verify-seo.mts asserts against the
 * confirmed business facts, and it would have to be rebuilt identically
 * later. The single <h1> keeps the page audit meaningful.
 *
 * Rebuild by composing new section components here.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <script {...jsonLdScript(localBusinessJsonLd(locale as Locale))} />
      <script {...jsonLdScript(organizationJsonLd(locale as Locale))} />

      <div className="wrap py-20">
        <h1 className="text-h1 text-ink">{t('nav.home')}</h1>
      </div>
    </>
  );
}
