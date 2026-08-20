import { Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { reputation, address } from '@/lib/site';


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
    <section className="band-paper"><div className="wrap py-12 lg:py-16">
      {/*
        Evidence, not decoration. The previous version floated tiny stars in a
        large empty card, which read as an ornament. This states the number,
        the count and the source in one line a person can check, and links to
        the actual Google listing so the claim is verifiable.
      */}
      <div className="flex flex-col items-start gap-5 rounded-md border border-line bg-surface p-6 shadow-roze sm:flex-row sm:items-center sm:gap-8 sm:p-8">
        <div className="flex shrink-0 items-center gap-4">
          <p className="text-display leading-none text-ink" data-numeric dir="ltr" aria-hidden="true">
            {reputation.ratingValue}
          </p>
          <div className="flex flex-col gap-1">
            <div aria-hidden="true" className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={
                    i < rounded
                      ? 'size-4 fill-gold text-gold'
                      : 'size-4 fill-transparent text-line'
                  }
                />
              ))}
            </div>
            <span className="text-small text-muted" data-numeric>
              {t('footer.googleReviews', { count: reputation.reviewCount })}
            </span>
          </div>
        </div>

        <p className="sr-only">{ratingLabel}</p>

        <p className="text-body text-muted sm:border-s sm:border-line sm:ps-8">
          {t('home.ratingBody')}
        </p>

        <a
          href={address.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-small font-medium text-teal-deep underline-offset-4 hover:underline sm:ms-auto"
        >
          {t('home.ourRating')}
        </a>
      </div>
    </div></section>
  );
}
