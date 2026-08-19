import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });
  return {
    title: t('pageTitle'),
    description: t('headline'),
    alternates: alternatesFor('privacy'),
  };
}

/**
 * Privacy policy.
 *
 * Deliberately describes only what this site actually does today: it stores
 * the name, phone and address you type in order to fulfil an order, keeps the
 * cart in your own browser, and runs no advertising trackers. No GDPR claims,
 * no cookie-banner theatre for cookies we do not set.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.privacy' });

  const sections = [
    { h: 'orderDataHeadline', b: 'orderDataBody' },
    { h: 'cartHeadline', b: 'cartBody' },
    { h: 'trackingHeadline', b: 'trackingBody' },
    { h: 'whatsappHeadline', b: 'whatsappBody' },
    { h: 'advertisingHeadline', b: 'advertisingBody' },
    { h: 'cookiesHeadline', b: 'cookiesBody' },
    { h: 'contactHeadline', b: 'contactBody' },
  ] as const;

  return (
    <div className="wrap py-10 md:py-16">
      <h1 className="text-h1 mb-4">{t('headline')}</h1>
      <p className="lede mb-10">{t('introBody')}</p>

      <div className="max-w-3xl space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-h3 mb-2">{t(s.h)}</h2>
            <p className="text-body text-muted">{t(s.b)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
