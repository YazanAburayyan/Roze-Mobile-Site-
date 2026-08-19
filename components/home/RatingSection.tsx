import { Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { reputation, social } from '@/lib/site';


/**
 * Google rating social proof. Stars are decorative (aria-hidden) — the real
 * accessible content is the sr-only sentence built from the same numbers, so
 * a screen reader doesn't have to infer a rating from five glyphs.
 */
export async function RatingSection() {
  const t = await getTranslations();
  const rounded = Math.round(reputation.ratingValue);

  const ratingLabel = t('home.ratingLabel', {
    rating: reputation.ratingValue,
    count: reputation.reviewCount,
  });

  return (
    <section className="wrap py-10 lg:py-16">
      <div className="ring-gradient-border flex flex-col items-center gap-3 rounded-lg border border-line bg-paper px-6 py-10 text-center shadow-roze">
        <span className="eyebrow">{t('home.ourRating')}</span>

        <div aria-hidden="true" className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={
                i < rounded
                  ? 'size-7 fill-teal-deep text-teal-deep'
                  : 'size-7 fill-transparent text-muted'
              }
            />
          ))}
        </div>

        <p className="sr-only">{ratingLabel}</p>

        <p aria-hidden="true" className="text-h3 text-ink" data-numeric dir="ltr">
          {reputation.ratingValue} / 5
        </p>

        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-small font-medium text-teal-deep hover:underline"
        >
          {t('footer.googleReviews', {
            count: reputation.reviewCount,
          })}
        </a>
      </div>
    </section>
  );
}
