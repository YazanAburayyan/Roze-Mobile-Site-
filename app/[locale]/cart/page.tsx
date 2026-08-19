import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { CartView } from './CartView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });
  return {
    title: t('title'),
    alternates: alternatesFor('cart'),
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'cart' });

  return (
    <div className="wrap pt-10">
      {/* The heading is rendered on the server, outside CartView's hydration
          guard — the cart contents live in localStorage and cannot be known
          until the client rehydrates, but the page must still have exactly one
          h1 in its initial HTML. */}
      <h1 className="text-h1">{t('title')}</h1>
      <CartView />
    </div>
  );
}
