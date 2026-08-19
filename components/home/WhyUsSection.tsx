import { Clock, Layers, Star, MapPin, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ITEMS: { key: 1 | 2 | 3 | 4; icon: LucideIcon }[] = [
  { key: 1, icon: Clock },
  { key: 2, icon: Layers },
  { key: 3, icon: Star },
  { key: 4, icon: MapPin },
];

/**
 * The four "why us" reasons, verbatim from the `home` message namespace —
 * real, specific reasons (hours, the sales+service combination, the actual
 * rating, the actual address), not generic filler copy.
 */
export async function WhyUsSection() {
  const t = await getTranslations('home');

  return (
    <section className="wrap py-10 lg:py-16">
      <h2 className="text-h2 text-ink">{t('whyUs')}</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ key, icon: Icon }) => (
          <div key={key} className="flex flex-col gap-3 rounded-md border border-line bg-paper p-5 shadow-roze">
            <span className="flex size-10 items-center justify-center rounded-md bg-mist text-teal-deep">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="text-h3 text-ink">{t(`whyUsItem_${key}_title`)}</h3>
            <p className="text-small text-muted">{t(`whyUsItem_${key}_body`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
