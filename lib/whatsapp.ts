import { whatsapp, governorates, currency } from './site';
import { formatFils } from './money';
import type { Locale } from '@/i18n/routing';
import type { OrderDraft } from './payments/types';

/**
 * WhatsApp deep links.
 *
 * Encoding is the whole job here. `wa.me` takes the message as a `text` query
 * parameter, and Arabic must survive the trip intact — so the message is built
 * as a plain JS string (already UTF-16) and passed through `encodeURIComponent`
 * exactly once. Double-encoding is the classic mojibake bug: it turns Arabic
 * into `%D8%A7` literals visible in the chat. Never pre-escape, never
 * `escape()`, never hand-roll a percent encoder.
 *
 * Newlines: `%0A` is what `encodeURIComponent` produces from `\n`, and WhatsApp
 * renders it as a line break. That is the only formatting available — there is
 * no bold or table, so the message has to be legible as plain text.
 */

const WA_BASE = 'https://wa.me';

/** `+962 79 900 0301` -> `962799000301`. wa.me wants digits only. */
function waNumber(e164: string): string {
  return e164.replace(/[^\d]/g, '');
}

export function whatsappUrl(numberE164: string, message: string): string {
  return `${WA_BASE}/${waNumber(numberE164)}?text=${encodeURIComponent(message)}`;
}

function governorateLabel(value: string, locale: Locale): string {
  return governorates.find((g) => g.value === value)?.[locale] ?? value;
}

/** A single product enquiry from a product page. */
export function productEnquiryMessage(
  product: { titleAr: string; titleEn: string; sku: string },
  url: string,
  locale: Locale,
): string {
  const title = locale === 'ar' ? product.titleAr : product.titleEn;

  if (locale === 'ar') {
    return [
      'مرحبا 👋',
      `بستفسر عن: ${title}`,
      `رمز المنتج: ${product.sku}`,
      url,
    ].join('\n');
  }

  return [
    'Hello 👋',
    `I'd like to ask about: ${title}`,
    `SKU: ${product.sku}`,
    url,
  ].join('\n');
}

/**
 * The full order handoff.
 *
 * A shop worker reads this on a phone screen, so it is ordered the way they
 * work: who and where first, then what, then the total. Prices are the same
 * three-decimal JOD the customer saw on the site — a different-looking number
 * in the message would cost a phone call.
 */
export function orderMessage(draft: OrderDraft, locale: Locale): string {
  const sym = currency.symbol[locale];
  const lines: string[] = [];

  if (locale === 'ar') {
    lines.push('طلب جديد من الموقع 🛒');
    lines.push(`رقم الطلب: ${draft.reference}`);
    lines.push('');
    lines.push(`الاسم: ${draft.customerName}`);
    lines.push(`الموبايل: ${draft.customerPhone}`);
    lines.push(
      `العنوان: ${governorateLabel(draft.governorate, locale)} — ${draft.area} — ${draft.street}`,
    );
    if (draft.notes) lines.push(`ملاحظات: ${draft.notes}`);
    lines.push('');
    lines.push('الطلبات:');
    for (const item of draft.items) {
      lines.push(
        `• ${item.titleAr} × ${item.quantity} — ${sym} ${formatFils(item.lineTotalFils)}`,
      );
    }
    lines.push('');
    lines.push(`المجموع: ${sym} ${formatFils(draft.subtotalFils)}`);
    lines.push(`التوصيل: ${sym} ${formatFils(draft.shippingFils)}`);
    lines.push(`الإجمالي: ${sym} ${formatFils(draft.totalFils)}`);
    return lines.join('\n');
  }

  lines.push('New order from the website 🛒');
  lines.push(`Order reference: ${draft.reference}`);
  lines.push('');
  lines.push(`Name: ${draft.customerName}`);
  lines.push(`Mobile: ${draft.customerPhone}`);
  lines.push(
    `Address: ${governorateLabel(draft.governorate, locale)} — ${draft.area} — ${draft.street}`,
  );
  if (draft.notes) lines.push(`Notes: ${draft.notes}`);
  lines.push('');
  lines.push('Items:');
  for (const item of draft.items) {
    lines.push(
      `• ${item.titleEn} × ${item.quantity} — ${sym} ${formatFils(item.lineTotalFils)}`,
    );
  }
  lines.push('');
  lines.push(`Subtotal: ${sym} ${formatFils(draft.subtotalFils)}`);
  lines.push(`Delivery: ${sym} ${formatFils(draft.shippingFils)}`);
  lines.push(`Total: ${sym} ${formatFils(draft.totalFils)}`);
  return lines.join('\n');
}

/** An enquiry from an empty category page — customer wants a device we don't list yet. */
export function categoryEnquiryMessage(categoryName: string, locale: Locale): string {
  if (locale === 'ar') {
    return ['مرحبا 👋', `بدور على جهاز من فئة: ${categoryName}`, 'ممكن تساعدوني ألقاه؟'].join('\n');
  }

  return [
    'Hello 👋',
    `I'm looking for a device in: ${categoryName}`,
    'Can you help me find one?',
  ].join('\n');
}

/** An enquiry from an empty search result — customer searched for something we don't list. */
export function searchEnquiryMessage(query: string, locale: Locale): string {
  if (locale === 'ar') {
    return ['مرحبا 👋', `بدور على: ${query}`, 'ممكن تساعدوني ألقاه؟'].join('\n');
  }

  return ['Hello 👋', `I'm looking for: ${query}`, 'Can you help me find it?'].join('\n');
}

/** An enquiry from an empty brand page — customer wants a device we don't list yet. */
export function brandEnquiryMessage(brandName: string, locale: Locale): string {
  if (locale === 'ar') {
    return ['مرحبا 👋', `بدور على جهاز من ماركة: ${brandName}`, 'ممكن تساعدوني ألقاه؟'].join('\n');
  }

  return [
    'Hello 👋',
    `I'm looking for a device from: ${brandName}`,
    'Can you help me find one?',
  ].join('\n');
}

/** An enquiry from the offers page — customer wants to know about current deals. */
export function offersEnquiryMessage(locale: Locale): string {
  if (locale === 'ar') {
    return ['مرحبا 👋', 'بدور على عروض وخصومات على الأجهزة', 'شو عندكم هلأ؟'].join('\n');
  }

  return ['Hello 👋', "I'm looking for offers and discounts on devices", "What do you have right now?"].join(
    '\n',
  );
}

/** A maintenance booking. Routes to the SERVICE line, never the showroom. */
export function serviceRequestMessage(
  req: {
    reference: string;
    customerName: string;
    customerPhone: string;
    deviceType: string;
    deviceModel?: string | null;
    serviceName?: string | null;
    issueDescription: string;
    preferredTime?: string | null;
  },
  locale: Locale,
): string {
  const lines: string[] = [];

  if (locale === 'ar') {
    lines.push('حجز موعد صيانة 🔧');
    lines.push(`رقم الحجز: ${req.reference}`);
    lines.push('');
    lines.push(`الاسم: ${req.customerName}`);
    lines.push(`الموبايل: ${req.customerPhone}`);
    lines.push(`نوع الجهاز: ${req.deviceType}`);
    if (req.deviceModel) lines.push(`الموديل: ${req.deviceModel}`);
    if (req.serviceName) lines.push(`الخدمة: ${req.serviceName}`);
    lines.push(`المشكلة: ${req.issueDescription}`);
    if (req.preferredTime) lines.push(`الوقت المفضّل: ${req.preferredTime}`);
    return lines.join('\n');
  }

  lines.push('Repair booking 🔧');
  lines.push(`Booking reference: ${req.reference}`);
  lines.push('');
  lines.push(`Name: ${req.customerName}`);
  lines.push(`Mobile: ${req.customerPhone}`);
  lines.push(`Device type: ${req.deviceType}`);
  if (req.deviceModel) lines.push(`Model: ${req.deviceModel}`);
  if (req.serviceName) lines.push(`Service: ${req.serviceName}`);
  lines.push(`Issue: ${req.issueDescription}`);
  if (req.preferredTime) lines.push(`Preferred time: ${req.preferredTime}`);
  return lines.join('\n');
}

export const whatsappNumbers = whatsapp;
