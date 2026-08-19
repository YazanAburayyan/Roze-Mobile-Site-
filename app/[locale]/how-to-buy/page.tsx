import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.howToBuy' });
  return {
    title: t('pageTitle'),
    description: t('headline'),
    alternates: alternatesFor('how-to-buy'),
  };
}

export default async function HowToBuyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.howToBuy' });

  const steps = [
    {
      title: t('step1_title'),
      body: t('step1_body'),
    },
    {
      title: t('step2_title'),
      body: t('step2_body'),
    },
    {
      title: t('step3_title'),
      body: t('step3_body'),
    },
    {
      title: t('step4_title'),
      body: t('step4_body'),
    },
    {
      title: t('step5_title'),
      body: t('step5_body'),
    },
    {
      title: t('step6_title'),
      body: t('step6_body'),
    },
    {
      title: t('step7_title'),
      body: t('step7_body'),
    },
  ];

  return (
    <div className="wrap py-10 md:py-16">
      <h1 className="text-h1 mb-4">{t('headline')}</h1>
      <p className="lede mb-8 max-w-2xl">
        {t('pageTitle')} — a clear walkthrough from browsing to receiving your order.
      </p>

      <div className="grid gap-6 max-w-3xl">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle className="text-h3">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-ink">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-mist rounded-lg max-w-3xl">
        <p className="text-body text-ink">{t('whatsappNote')}</p>
      </div>

      <div className="mt-8 max-w-3xl">
        <Link href="/track" className="text-teal-deep font-medium hover:underline">
          Track your order now
        </Link>
      </div>
    </div>
  );
}
