import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { buttonClasses } from '@/components/ui/Button';

/**
 * Branded 404.
 *
 * Voice rule: explain the next step, do not apologise. A dead end that offers
 * the catalogue, the repair desk and the phone number is more useful to a
 * customer than a sad face.
 */
export default async function NotFound() {
  const t = await getTranslations('errors');
  const tn = await getTranslations('nav');

  return (
    <div className="wrap flex flex-col items-start gap-4 py-20">
      <span className="eyebrow">404</span>
      <h1 className="text-h1">{t('notFoundTitle')}</h1>
      <p className="lede">{t('notFoundBody')}</p>

      <div className="mt-2 flex flex-wrap gap-3">
        <Link href="/" className={buttonClasses({ variant: 'primary' })}>
          {t('notFoundAction')}
        </Link>
        <Link href="/maintenance" className={buttonClasses({ variant: 'outline' })}>
          {tn('maintenance')}
        </Link>
        <Link href="/contact" className={buttonClasses({ variant: 'ghost' })}>
          {tn('contact')}
        </Link>
      </div>
    </div>
  );
}
