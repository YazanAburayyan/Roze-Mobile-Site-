import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { alternatesFor, localBusinessJsonLd, jsonLdScript } from '@/lib/seo';
import { address, phones, social, reputation } from '@/lib/site';
import { groupedHours } from '@/lib/hours';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: t('pageTitle'),
    description: t('lede'),
    alternates: alternatesFor('contact'),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  const l = locale as Locale;

  const hours = groupedHours();

  // Day names for the hours table
  const dayNames: Record<number, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  };

  const formatTime = (hour: number): string => {
    if (hour === 24) return '00:00';
    return `${String(hour).padStart(2, '0')}:00`;
  };

  return (
    <>
      <script {...jsonLdScript(localBusinessJsonLd(l))} />

      <div className="wrap py-10 md:py-16">
        <h1 className="text-h1 mb-4">{t('pageTitle')}</h1>
        <p className="lede mb-8 max-w-2xl">{t('lede')}</p>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mb-12">
          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">{t('visitTheShop')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted mb-1">Address</p>
                <p className="text-body text-ink">{address.street[l]}</p>
                <p className="text-body text-ink">
                  {address.locality[l]}, {address.country[l]}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted mb-1">Plus Code</p>
                <p className="text-body text-ink font-mono">{address.plusCode}</p>
              </div>
              <a
                href={address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-deep font-medium hover:underline inline-block mt-2"
              >
                {t('getDirections')}
              </a>
            </CardContent>
          </Card>

          {/* Hours Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">{t('openingHours')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 overflow-x-auto">
                <table className="text-sm w-full">
                  <tbody>
                    {hours.map((group) => (
                      <tr key={group.days.join('-')}>
                        <td className="font-medium text-ink pe-4 py-1">
                          {group.days.map((d) => dayNames[d]).join('–')}
                        </td>
                        <td className="text-muted py-1">
                          {formatTime(group.open)} – {formatTime(group.close)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted mt-3 italic">
                Open until midnight, seven days a week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Phone Numbers */}
        <section className="mb-12 max-w-2xl">
          <h2 className="text-h2 mb-6">{t('howToReachUs')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Showroom */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h3 text-base">
                  {phones.showroom.purpose[l]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${phones.showroom.e164}`}
                  className="font-mono text-teal-deep font-medium hover:underline ltr"
                >
                  {phones.showroom.display}
                </a>
              </CardContent>
            </Card>

            {/* Service 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h3 text-base">{phones.service1.purpose[l]}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${phones.service1.e164}`}
                  className="font-mono text-teal-deep font-medium hover:underline ltr"
                >
                  {phones.service1.display}
                </a>
              </CardContent>
            </Card>

            {/* Service 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h3 text-base">{phones.service2.purpose[l]}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${phones.service2.e164}`}
                  className="font-mono text-teal-deep font-medium hover:underline ltr"
                >
                  {phones.service2.display}
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Social Proof & Links */}
        <section className="mb-12 max-w-2xl">
          <h2 className="text-h2 mb-6">What our customers say</h2>
          <Card className="bg-gradient-to-r from-mist to-paper">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-2xl font-bold text-ink">
                  {reputation.ratingValue}★ · {reputation.reviewCount} reviews
                </p>
                <p className="text-body text-ink">
                  {reputation.reviewCount} customers have rated us on Google. We listen and
                  improve.
                </p>
                <a
                  href={address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-deep font-medium hover:underline inline-block mt-2"
                >
                  Read reviews on Google
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Facebook */}
        <section className="max-w-2xl">
          <a
            href={social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-deep font-medium hover:underline"
          >
            Follow us on Facebook
          </a>
        </section>
      </div>
    </>
  );
}
