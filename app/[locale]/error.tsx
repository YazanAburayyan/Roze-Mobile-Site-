'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

/**
 * Branded 500. Client component, as Next requires for an error boundary.
 * Offers a retry rather than apologising — see the voice rules.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    // Surface the digest so a real error can be traced in server logs.
    console.error(error);
  }, [error]);

  return (
    <div className="wrap flex flex-col items-start gap-4 py-20">
      <span className="eyebrow">500</span>
      <h1 className="text-h1">{t('serverErrorTitle')}</h1>
      <p className="lede">{t('serverErrorBody')}</p>
      <Button variant="primary" onClick={reset}>
        {t('serverErrorAction')}
      </Button>
    </div>
  );
}
