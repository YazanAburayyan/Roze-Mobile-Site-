import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { buttonClasses } from '@/components/ui';

/**
 * The "About us" anchor for the simplified header menu.
 *
 * Reuses the copy already written for /about rather than inventing a second
 * version of the shop's story — two differently-worded descriptions of the
 * same business is how a site starts contradicting itself. This is the short
 * form; the full page is one click away.
 */
export async function AboutSection() {
  const t = await getTranslations('pages.about');
  const tNav = await getTranslations('nav');

  return (
    <section id="about" className="band-paper scroll-mt-24">
      <div className="wrap grid gap-8 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <h2 className="text-h2 text-ink">{t('headline')}</h2>
          <p className="lede mt-4">{t('introBody')}</p>

          <Link
            href="/about"
            className={buttonClasses({ variant: 'outline', size: 'md', className: 'mt-6' })}
          >
            {tNav('about')}
          </Link>
        </div>

        <div className="flex flex-col justify-center gap-5 rounded-md border border-line bg-surface p-6 shadow-roze lg:p-8">
          <p className="text-body text-muted">{t('storyBody')}</p>
          <hr className="border-0 border-t border-line" />
          <p className="text-body text-muted">{t('trustBody')}</p>
        </div>
      </div>
    </section>
  );
}
