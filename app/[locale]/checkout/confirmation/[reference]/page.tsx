import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckCircle2 } from 'lucide-react';

import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { formatPrice } from '@/lib/money';
import { buttonClasses } from '@/components/ui/Button';
import { phones } from '@/lib/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });
  return {
    title: t('orderConfirmationHeading'),
    robots: { index: false, follow: false },
  };
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>;
}) {
  const { locale, reference } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const t = await getTranslations({ locale, namespace: 'checkout' });
  const tc = await getTranslations({ locale, namespace: 'cart' });
  const tn = await getTranslations({ locale, namespace: 'nav' });

  const order = await prisma.order.findUnique({
    where: { reference: decodeURIComponent(reference) },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="wrap py-14">
      <div className="mx-auto max-w-2xl">
        <CheckCircle2 className="mb-4 size-12 text-teal-deep" aria-hidden />
        <h1 className="text-h1 mb-3">{t('orderConfirmationHeading')}</h1>

        <p className="text-h3 mb-2">
          {t('orderReference', { reference: order.reference })}
        </p>
        <p className="lede mb-8">
          {t('willContactYou', { phone: phones.showroom.display })}
        </p>

        <div className="rounded-md border border-line bg-mist/40 p-5">
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block font-bold">
                    {l === 'ar' ? item.titleAr : item.titleEn}
                  </span>
                  <span dir="ltr" data-numeric className="font-mono text-sm text-muted">
                    {item.sku} × {item.quantity}
                  </span>
                </span>
                <span dir="ltr" data-numeric className="shrink-0 font-mono">
                  {formatPrice(item.lineTotalFils, l)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{tc('subtotal')}</dt>
              <dd dir="ltr" data-numeric className="font-mono">
                {formatPrice(order.subtotalFils, l)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{tc('shipping')}</dt>
              <dd dir="ltr" data-numeric className="font-mono">
                {formatPrice(order.shippingFils, l)}
              </dd>
            </div>
            <div className="flex justify-between text-h3">
              <dt>{tc('total')}</dt>
              <dd dir="ltr" data-numeric className="font-mono">
                {formatPrice(order.totalFils, l)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/track" className={buttonClasses({ variant: 'primary' })}>
            {tn('trackOrder')}
          </Link>
          <Link href="/" className={buttonClasses({ variant: 'outline' })}>
            {tc('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
