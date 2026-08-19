import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { paymentProviders } from '@/lib/payments/providers';
import { CheckoutForm } from './CheckoutForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return {
    title: t('title'),
    alternates: alternatesFor('checkout'),
    // Checkout has nothing to offer a search engine and shouldn't be indexed.
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'checkout' });

  // The registry decides which methods exist — the form never hardcodes them,
  // so a card gateway appears here the moment it is added to lib/payments.
  const providers = paymentProviders.map((p) => ({
    id: p.id,
    labelKey: p.labelKey,
    descriptionKey: p.descriptionKey,
  }));

  return (
    <div className="wrap py-10">
      <h1 className="text-h1 mb-6">{t('title')}</h1>
      <CheckoutForm providers={providers} />
    </div>
  );
}
