import { TIMEZONE, hours, schemaDays, type DayHours } from './site';

/**
 * Open-now logic, computed in Asia/Amman regardless of the visitor's device
 * timezone. A customer in Amman and a customer browsing from abroad must both
 * see the same answer, because the answer is about the shop, not the visitor.
 *
 * ROZE is open until midnight seven days a week. That is unusual for the area
 * and it is a selling point, so the badge is prominent rather than decorative.
 */

export type ShopStatus = {
  isOpen: boolean;
  /** Local Amman day index, 0 = Sunday .. 6 = Saturday. */
  day: number;
  /** Minutes since local midnight in Amman. */
  minutes: number;
  /** "HH:MM" when the shop next opens, if currently closed. */
  opensAt: string | null;
  /** "HH:MM" when the shop closes, if currently open. */
  closesAt: string | null;
  /**
   * Seconds until the shop next opens or closes.
   *
   * Drives the header countdown. Computed from the same Amman wall clock as
   * everything else here, so it never disagrees with the open/closed state
   * beside it.
   */
  secondsUntilChange: number;
};

/** Wall-clock day + minute-of-day in Amman, independent of the host clock. */
function ammanNow(now: Date): { day: number; minutes: number; seconds: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  const weekdayIndex: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const day = weekdayIndex[get('weekday')] ?? 0;
  // Intl can emit "24" for midnight with hour12:false; normalise it to 0.
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));

  const second = Number(get('second')) || 0;

  return { day, minutes: hour * 60 + minute, seconds: second };
}

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (hour: number) => `${pad(hour % 24)}:00`;

function dayHours(index: number): DayHours {
  // `hours` is a 7-element table; the modulo keeps callers safe.
  return hours[((index % 7) + 7) % 7]!;
}

export function getShopStatus(now: Date = new Date()): ShopStatus {
  const { day, minutes, seconds } = ammanNow(now);
  const today = dayHours(day);

  const openMin = today.open * 60;
  const closeMin = today.close * 60; // 24:00 -> 1440, i.e. end of this day

  const isOpen = minutes >= openMin && minutes < closeMin;

  /**
   * Whole seconds from now until a given minute-of-day boundary.
   * The `seconds` component is subtracted so the countdown ticks down smoothly
   * jumping a whole minute at a time.
   */
  const until = (targetMinute: number) =>
    Math.max(0, (targetMinute - minutes) * 60 - seconds);

  if (isOpen) {
    return {
      isOpen: true,
      day,
      minutes,
      opensAt: null,
      closesAt: hhmm(today.close),
      secondsUntilChange: until(closeMin),
    };
  }

  // Closed, but opening later the same day.
  if (minutes < openMin) {
    return {
      isOpen: false,
      day,
      minutes,
      opensAt: hhmm(today.open),
      closesAt: null,
      secondsUntilChange: until(openMin),
    };
  }

  // Closed for the night: the next opening is tomorrow's, so the wait spans
  // midnight and the remaining minutes of today are added on.
  const tomorrow = dayHours(day + 1);
  return {
    isOpen: false,
    day,
    minutes,
    opensAt: hhmm(tomorrow.open),
    closesAt: null,
    secondsUntilChange: until(24 * 60 + tomorrow.open * 60),
  };
}

/**
 * Opening hours grouped into the ranges a human would actually read:
 * "Saturday–Thursday 10:00–00:00" and "Friday 13:00–00:00", rather than
 * seven near-identical rows.
 */
export type HoursGroup = { days: number[]; open: number; close: number };

export function groupedHours(): HoursGroup[] {
  const groups: HoursGroup[] = [];
  // Walk Saturday-first, which is how the Jordanian week reads.
  const order = [6, 0, 1, 2, 3, 4, 5];

  for (const day of order) {
    const h = dayHours(day);
    const last = groups[groups.length - 1];
    if (last && last.open === h.open && last.close === h.close) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], open: h.open, close: h.close });
    }
  }
  return groups;
}

/**
 * schema.org `openingHours` strings for the LocalBusiness JSON-LD block.
 * e.g. "Sa-Th 10:00-24:00".
 */
export function schemaOpeningHours(): { dayOfWeek: string[]; opens: string; closes: string }[] {
  return groupedHours().map((g) => ({
    dayOfWeek: g.days.map((d) => schemaDays[d]!),
    opens: hhmm(g.open),
    // schema.org expects 23:59 rather than 24:00 for an end-of-day close.
    closes: g.close >= 24 ? '23:59' : hhmm(g.close),
  }));
}
