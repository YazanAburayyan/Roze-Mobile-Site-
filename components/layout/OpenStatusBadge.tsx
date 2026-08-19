'use client';

import * as React from 'react';
import { Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getShopStatus, type ShopStatus } from '@/lib/hours';
import { cn } from '@/components/ui';

/**
 * "Open now" / "Closed" indicator, computed in Asia/Amman regardless of the
 * visitor's device timezone (see lib/hours.ts). Late-night hours are a real
 * selling point, so this renders prominently in the header, not tucked away.
 *
 * Hydration trap: the server computes `initialStatus` once at request time.
 * We seed useState with that exact value so the first client render matches
 * the server markup byte-for-byte, then recompute inside useEffect (which
 * only runs after hydration) and refresh on a timer so the badge stays
 * accurate across a long-lived tab (e.g. sitting open past 00:00 or 10:00).
 */
export function OpenStatusBadge({
  initialStatus,
  className,
}: {
  initialStatus: ShopStatus;
  className?: string;
}) {
  const t = useTranslations('header');
  const [status, setStatus] = React.useState<ShopStatus>(initialStatus);

  React.useEffect(() => {
    // Re-sync immediately after mount (server clock vs. client clock can
    // legitimately differ by the request's in-flight time) and then refresh
    // every minute so a customer browsing near opening/closing sees it flip.
    setStatus(getShopStatus());
    const id = window.setInterval(() => setStatus(getShopStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const label = status.isOpen ? t('openNow') : t('closedNow');
  const time = status.isOpen ? status.closesAt : status.opensAt;
  const timeLabel = status.isOpen
    ? t('closesAt', { time: time ?? '' })
    : t('opensAt', { time: time ?? '' });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-small font-medium',
        status.isOpen
          ? 'border-teal-deep/30 bg-mist/50 text-teal-deep'
          : 'border-line bg-transparent text-muted',
        className
      )}
      data-state={status.isOpen ? 'open' : 'closed'}
      title={timeLabel}
    >
      <Circle
        aria-hidden="true"
        className={cn(
          'size-2',
          status.isOpen ? 'fill-teal-deep text-teal-deep' : 'fill-muted text-muted'
        )}
      />
      <span>{label}</span>
      <span className="hidden text-muted sm:inline" data-numeric dir="ltr">
        · {timeLabel}
      </span>
    </span>
  );
}
