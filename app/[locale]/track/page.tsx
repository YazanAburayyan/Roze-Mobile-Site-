import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { TrackForm } from './TrackForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'track' });
  return {
    title: t('pageTitle'),
    description: t('lede'),
    alternates: alternatesFor('track'),
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'track' });

  return (
    <div className="wrap py-10">
      <h1 className="text-h1 mb-2">{t('pageTitle')}</h1>
      <p className="lede mb-8">{t('lede')}</p>
      <TrackForm />
    </div>
  );
}
