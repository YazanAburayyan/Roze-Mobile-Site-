import { Clock, Wrench, Star, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/**
 * Four reassurances, directly under the hero.
 *
 * This replaces the old "why us" section rather than sitting alongside it —
 * two sections making the same four claims is exactly the duplication that
 * made the previous homepage read as filler. The copy is the existing
 * `home.whyUsItem_*` keys, so nothing was invented for it.
 *
 * Sits on the sand band so it separates from the ink hero above and the paper
 * band below without needing a border.
 */
const ITEMS = [
  { icon: Clock, key: 1 },
  { icon: Wrench, key: 2 },
  { icon: Star, key: 3 },
  { icon: MapPin, key: 4 },
] as const;

export async function TrustStrip() {
  const t = await getTranslations('home');

  return (
    <section className="band-sand">
      <div className="wrap grid grid-cols-1 gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
        {ITEMS.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-start gap-3">
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-teal-deep"
              strokeWidth={1.75}
            />
            <div className="min-w-0">
              <p className="text-small font-bold text-ink">
                {t(`whyUsItem_${key}_title`)}
              </p>
              <p className="mt-0.5 text-small leading-relaxed text-muted">
                {t(`whyUsItem_${key}_body`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
