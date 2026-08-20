import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getTranslations, getMessages } from 'next-intl/server';
import { Tajawal, Poppins, IBM_Plex_Mono } from 'next/font/google';

import { routing, localeDirection, isLocale, type Locale } from '@/i18n/routing';
import { SITE_URL, site } from '@/lib/site';
import { Header, Footer } from '@/components/layout';
import { TopBar } from '@/components/layout/TopBar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import '../globals.css';

/* The three families from the brand guide. `display: swap` is required —
   Arabic text must never be invisible while Tajawal loads. */
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: l, namespace: 'meta' }).catch(() => null);

  const title = site.name[l];
  const description = t?.('description') ?? site.tagline[l];

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${title}` },
    description,
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
    },
    openGraph: {
      type: 'website',
      siteName: title,
      title,
      description,
      locale: l === 'ar' ? 'ar_JO' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
    alternates: {
      canonical: l === 'ar' ? '/' : '/en',
      languages: { ar: '/', en: '/en' },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Required for static rendering of a locale-segmented app.
  setRequestLocale(locale);
  const l: Locale = locale;
  const messages = await getMessages();
  const t = await getTranslations({ locale: l, namespace: 'a11y' });

  return (
    <html
      lang={l}
      dir={localeDirection[l]}
      className={`${tajawal.variable} ${poppins.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          {/* Padding lives ONLY in the focus state. `sr-only` sets padding to
              zero, but Tailwind v4 emits the padding utilities later in the
              cascade, so an unconditional px-4 wins and gives the "hidden" link
              a real 32px box — which pushed 52px of horizontal overflow onto
              every page at 320px in RTL. */}
          <a
            href="#main-content"
            className="sr-only rounded-sm bg-teal-deep text-paper focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2"
          >
            {t('skipToMain')}
          </a>
          <TopBar />
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
