import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { Link } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return {
    title: t('pageTitle'),
    description: t('introBody'),
    alternates: alternatesFor('about'),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.about' });

  return (
    <div className="wrap py-10 md:py-16">
      <h1 className="text-h1 mb-4">{t('headline')}</h1>
      <p className="lede mb-8 max-w-2xl">{t('introBody')}</p>

      <div className="space-y-12 md:space-y-16">
        {/* One place, two services */}
        <section>
          <h2 className="text-h2 mb-4">{t('storyHeadline')}</h2>
          <p className="text-body text-ink mb-6">{t('storyBody')}</p>
        </section>

        {/* Trust */}
        <section>
          <h2 className="text-h2 mb-4">{t('trustHeadline')}</h2>
          <p className="text-body text-ink mb-6">{t('trustBody')}</p>
        </section>

        {/* Hours */}
        <section>
          <h2 className="text-h2 mb-4">{t('hoursHeadline')}</h2>
          <p className="text-body text-ink mb-6">{t('hoursBody')}</p>
          <Link href="/contact" className="text-teal-deep font-medium hover:underline">
            View our hours
          </Link>
        </section>

        {/* Visit */}
        <section>
          <h2 className="text-h2 mb-4">{t('visitHeadline')}</h2>
          <p className="text-body text-ink mb-6">{t('visitBody')}</p>
          <Link href="/contact" className="text-teal-deep font-medium hover:underline">
            Get directions
          </Link>
        </section>
      </div>
    </div>
  );
}
