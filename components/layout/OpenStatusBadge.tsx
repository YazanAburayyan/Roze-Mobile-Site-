'use client';

import * as React from 'react';
import { Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getShopStatus, type ShopStatus } from '@/lib/hours';
import { cn } from '@/components/ui';

/**
 * "Open now · Closes in 3:24:10" — live, computed in Asia/Amman regardless of
 * the visitor's device timezone (see lib/hours.ts).
 *
 * Late-night hours are ROZE's strongest differentiator, so this is prominent
 * rather than tucked away, and the countdown makes "until midnight" concrete:
 * a customer at 21:40 can see they still have time to come in.
 *
 * HYDRATION: the server computes `initialStatus` at request time and we seed
 * state with that exact value, so the first client render matches the server
 * markup byte for byte. Only after mount does the effect re-sync and start
 * ticking — the countdown digits are suppressed until then, because a
 * second-precision value computed on the server is guaranteed to be stale by
 * the time it reaches the browser and would mismatch.
 */
function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function OpenStatusBadge({
  initialStatus,
  className,
  showCountdown = true,
}: {
  initialStatus: ShopStatus;
  className?: string;
  /** Set false where space is tight (mobile drawer). */
  showCountdown?: boolean;
}) {
  const t = useTranslations('header');
  const [status, setStatus] = React.useState<ShopStatus>(initialStatus);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    setStatus(getShopStatus());
    setLive(true);
    // One second, because the countdown shows seconds. The work is a single
    // Intl format plus arithmetic — cheap enough at 1Hz.
    const id = window.setInterval(() => setStatus(getShopStatus()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const label = status.isOpen ? t('openNow') : t('closedNow');
  const countdown = formatCountdown(status.secondsUntilChange);
  const detail = status.isOpen
    ? t('closesIn', { time: countdown })
    : t('opensIn', { time: countdown });

  return (
    <span
      className={cn(
        // `status-badge` is a styling hook used by globals.css to re-tone the
        // badge inside a `.band-ink` section.
        'status-badge inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-small font-medium',
        status.isOpen
          ? 'border-teal-deep/30 bg-mist/50 text-teal-deep'
          : 'border-line bg-transparent text-muted',
        className
      )}
      data-state={status.isOpen ? 'open' : 'closed'}
    >
      <Circle
        aria-hidden="true"
        className={cn(
          'size-2 shrink-0',
          status.isOpen ? 'fill-teal-deep text-teal-deep' : 'fill-muted text-muted'
        )}
      />
      <span>{label}</span>

      {showCountdown ? (
        <>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          {/* `suppressHydrationWarning` is belt-and-braces: the value is only
              rendered once `live` is true, i.e. after mount. */}
          <span
            className="tabular-nums"
            data-numeric
            dir="ltr"
            suppressHydrationWarning
          >
            {live ? detail : ' '}
          </span>
        </>
      ) : null}
    </span>
  );
}
