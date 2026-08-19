import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { phones } from '@/lib/site';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.warranty' });
  return {
    title: t('pageTitle'),
    description: t('headline'),
    alternates: alternatesFor('warranty'),
  };
}

export default async function WarrantyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.warranty' });

  return (
    <div className="wrap py-10 md:py-16">
      <h1 className="text-h1 mb-4">{t('headline')}</h1>
      <p className="lede mb-8 max-w-2xl">
        {t('introBody')}
      </p>

      <div className="space-y-8 max-w-3xl">
        {/* Device Warranty */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">{t('devicesHeadline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-ink mb-4">{t('devicesBody')}</p>
          </CardContent>
        </Card>

        {/* Repair Warranty */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">{t('repairsHeadline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-ink mb-4">{t('repairsBody')}</p>
          </CardContent>
        </Card>

        {/* Client Policy Placeholder */}
        <Card className="border-2 border-gold border-dashed">
          <CardHeader>
            <CardTitle className="text-h3">Complete warranty policy</CardTitle>
          </CardHeader>
          <CardContent>
            {/* CLIENT: Insert your complete warranty policy here. Include specific warranty periods for each type of repair, conditions, and exceptions. */}
            <div className="bg-paper p-4 rounded border border-line">
              <p className="text-body text-muted italic">
                [Client warranty policy will be inserted here]
              </p>
            </div>
          </CardContent>
        </Card>

        {/* More Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">{t('moreInfoHeadline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-ink mb-4">{t('moreInfoBody')}</p>
            <a
              href={`tel:${phones.service1.e164}`}
              className="font-mono text-teal-deep font-medium hover:underline ltr"
            >
              {phones.service1.display}
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
