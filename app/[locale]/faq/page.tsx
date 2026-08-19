import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor } from '@/lib/seo';
import { Accordion } from '@/components/ui';
import type { AccordionItemData } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.faq' });
  return {
    title: t('pageTitle'),
    description: t('headline'),
    alternates: alternatesFor('faq'),
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.faq' });

  const items: AccordionItemData[] = [
    {
      value: 'q1',
      title: t('q1_title'),
      content: t('q1_answer'),
    },
    {
      value: 'q2',
      title: t('q2_title'),
      content: t('q2_answer'),
    },
    {
      value: 'q3',
      title: t('q3_title'),
      content: t('q3_answer'),
    },
    {
      value: 'q4',
      title: t('q4_title'),
      content: t('q4_answer'),
    },
    {
      value: 'q5',
      title: t('q5_title'),
      content: t('q5_answer'),
    },
    {
      value: 'q6',
      title: t('q6_title'),
      content: t('q6_answer'),
    },
    {
      value: 'q7',
      title: t('q7_title'),
      content: t('q7_answer'),
    },
    {
      value: 'q8',
      title: t('q8_title'),
      content: t('q8_answer'),
    },
  ];

  return (
    <div className="wrap py-10 md:py-16">
      <h1 className="text-h1 mb-4">{t('headline')}</h1>
      <p className="lede mb-8 max-w-2xl">
        {t('pageTitle')} — real answers to questions you might actually have.
      </p>

      <div className="max-w-3xl">
        <Accordion items={items} />
      </div>
    </div>
  );
}
