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
};

/** Wall-clock day + minute-of-day in Amman, independent of the host clock. */
function ammanNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
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

  return { day, minutes: hour * 60 + minute };
}

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (hour: number) => `${pad(hour % 24)}:00`;

function dayHours(index: number): DayHours {
  // `hours` is a 7-element table; the modulo keeps callers safe.
  return hours[((index % 7) + 7) % 7]!;
}

export function getShopStatus(now: Date = new Date()): ShopStatus {
  const { day, minutes } = ammanNow(now);
  const today = dayHours(day);

  const openMin = today.open * 60;
  const closeMin = today.close * 60; // 24:00 -> 1440, i.e. end of this day

  const isOpen = minutes >= openMin && minutes < closeMin;

  if (isOpen) {
    return {
      isOpen: true,
      day,
      minutes,
      opensAt: null,
      closesAt: hhmm(today.close),
    };
  }

  // Closed. Find the next opening: later today, else the next day that opens.
  if (minutes < openMin) {
    return { isOpen: false, day, minutes, opensAt: hhmm(today.open), closesAt: null };
  }

  const tomorrow = dayHours(day + 1);
  return { isOpen: false, day, minutes, opensAt: hhmm(tomorrow.open), closesAt: null };
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
