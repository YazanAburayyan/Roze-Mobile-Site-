/**
 * Single source of truth for every confirmed business fact about ROZE.
 *
 * Nothing in this file is a placeholder. Every value here is confirmed from the
 * business card, the Google Business profile, or the client directly.
 *
 * RULE: no phone number, address, coordinate, or opening hour is typed anywhere
 * else in this codebase. The footer, the contact page, the JSON-LD blocks, the
 * WhatsApp links and the open/closed badge all read from here.
 */

export const TIMEZONE = 'Asia/Amman';

/** Absolute origin. Domain-agnostic: the client is still registering one. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export const site = {
  name: {
    ar: 'روز موبايل',
    en: 'Roze Mobiles & Computers',
  },
  legalName: 'Roze Mobiles & Computers',
  tagline: {
    ar: 'بيع وصيانة — دائرتين متقاطعتين',
    en: 'Sales and service, two intersecting circles',
  },
  category: {
    ar: 'متجر كمبيوتر وموبايلات وصيانة',
    en: 'Computer store · electronics retail and repair',
  },
} as const;

export const address = {
  street: {
    ar: 'الجبيهة — شارع أبو نصير — مبنى ١٥٧',
    en: 'Jubaiha — Abu Nsair Street — Building 157',
  },
  locality: { ar: 'عمّان', en: 'Amman' },
  country: { ar: 'الأردن', en: 'Jordan' },
  countryCode: 'JO',
  plusCode: '2VXG+X7 Amman, Jordan',
  coordinates: { lat: 32.049966, lng: 35.87574 },
  mapsUrl: 'https://maps.google.com/?cid=8128987237016048278',
} as const;

/**
 * Phone numbers.
 *
 * `e164` is for tel: and WhatsApp links. `display` is what a human reads —
 * always rendered LTR in IBM Plex Mono, never mirrored by RTL.
 *
 * OPEN QUESTION for the client: which of these three is the WhatsApp line? The
 * brand guide flags this too. Until confirmed, sales routes to the showroom
 * (the Google-verified number) and service routes to the first card number.
 * Both are overridable by env without touching code.
 */
export const phones = {
  showroom: {
    e164: '+962799000301',
    display: '+962 79 900 0301',
    purpose: { ar: 'المعرض والمبيعات', en: 'Showroom & sales' },
    verified: true,
  },
  service1: {
    e164: '+962796003040',
    display: '+962 79 600 3040',
    purpose: { ar: 'الصيانة', en: 'Maintenance' },
    verified: false,
  },
  service2: {
    e164: '+962789998992',
    display: '+962 78 999 8992',
    purpose: { ar: 'الصيانة — خط ثانٍ', en: 'Maintenance — second line' },
    verified: false,
  },
} as const;

export const whatsapp = {
  /** Sales enquiries, cart handoff, product questions. */
  sales: process.env.NEXT_PUBLIC_WHATSAPP_SALES ?? phones.showroom.e164,
  /** Repair bookings. Deliberately NOT the showroom line. */
  service: process.env.NEXT_PUBLIC_WHATSAPP_SERVICE ?? phones.service1.e164,
} as const;

export const social = {
  facebook: 'https://www.facebook.com/RozeMobile',
} as const;

export const reputation = {
  ratingValue: 4.5,
  reviewCount: 159,
  source: 'Google',
} as const;

/**
 * Opening hours in Asia/Amman.
 *
 * Open until midnight, seven days a week — unusual for the area and a genuine
 * selling point, so it is surfaced above the fold rather than buried in a
 * footer. `close: 24` means midnight at the end of that same day.
 *
 * Index matches JS `Date.getDay()`: 0 = Sunday .. 6 = Saturday.
 */
export type DayHours = { open: number; close: number };

export const hours: readonly DayHours[] = [
  { open: 10, close: 24 }, // Sunday
  { open: 10, close: 24 }, // Monday
  { open: 10, close: 24 }, // Tuesday
  { open: 10, close: 24 }, // Wednesday
  { open: 10, close: 24 }, // Thursday
  { open: 13, close: 24 }, // Friday — opens at 13:00
  { open: 10, close: 24 }, // Saturday
] as const;

/** Schema.org day names, aligned to the `hours` index above. */
export const schemaDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const currency = {
  code: 'JOD',
  symbol: { ar: 'د.أ', en: 'JOD' },
  /** Jordanian convention: the dinar divides into 1000 fils. */
  decimals: 3,
} as const;

/** Governorates, for the checkout address form. */
export const governorates = [
  { value: 'amman', ar: 'عمّان', en: 'Amman' },
  { value: 'zarqa', ar: 'الزرقاء', en: 'Zarqa' },
  { value: 'irbid', ar: 'إربد', en: 'Irbid' },
  { value: 'balqa', ar: 'البلقاء', en: 'Balqa' },
  { value: 'madaba', ar: 'مادبا', en: 'Madaba' },
  { value: 'mafraq', ar: 'المفرق', en: 'Mafraq' },
  { value: 'jerash', ar: 'جرش', en: 'Jerash' },
  { value: 'ajloun', ar: 'عجلون', en: 'Ajloun' },
  { value: 'karak', ar: 'الكرك', en: 'Karak' },
  { value: 'tafilah', ar: 'الطفيلة', en: 'Tafilah' },
  { value: 'maan', ar: 'معان', en: "Ma'an" },
  { value: 'aqaba', ar: 'العقبة', en: 'Aqaba' },
] as const;

export type Governorate = (typeof governorates)[number]['value'];
