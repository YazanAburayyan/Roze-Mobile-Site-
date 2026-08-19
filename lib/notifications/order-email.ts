import 'server-only';
import { Resend } from 'resend';
import { prisma } from '../db';
import { formatFils } from '../money';
import { governorates, currency, site } from '../site';

/**
 * Order notifications.
 *
 * THE PROBLEM THIS SOLVES: a WhatsApp order lands on the owner's phone. A cash-
 * on-delivery order used to land nowhere — written to the database with no
 * human told, while the customer waited for a call that never came. Durable
 * storage did not fix that; it only made the silence persistent.
 *
 * TWO RULES, both deliberate:
 *
 * 1. Dispatch happens AFTER the order transaction commits, never inside it.
 *    A Postgres trigger would fire inside the transaction, making rollback
 *    behaviour subtle and failures invisible to application logs. For a shop
 *    doing a handful of orders a day that opacity costs more than it buys.
 *
 * 2. A notification failure must NEVER roll back or block an order. Every
 *    error here is caught and logged with the order reference. A saved order
 *    with no notification is recoverable — `scripts/resend-unnotified.ts`
 *    exists precisely for that. A lost order is not recoverable.
 *
 * This module needs no Supabase key and no Supabase client: it runs in the
 * Next.js process over the existing Prisma connection.
 */

/**
 * Config is read at CALL time, not module-load time.
 *
 * Reading it into module constants would freeze whatever the environment
 * happened to be when this file was first imported — which makes the module
 * untestable (ESM hoists imports above any test's env setup) and silently
 * order-dependent. A per-call read costs nothing and always reflects reality.
 *
 * Sender: Resend requires a verified domain; until ROZE has one, their shared
 * onboarding sender works for testing.
 */
function config() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.ORDER_NOTIFICATION_EMAIL,
    from: process.env.ORDER_NOTIFICATION_FROM ?? 'ROZE Orders <onboarding@resend.dev>',
  };
}

export type NotifiableOrder = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  area: string;
  street: string;
  notes: string | null;
  subtotalFils: number;
  shippingFils: number;
  totalFils: number;
  paymentMethod: string;
  items: { titleAr: string; titleEn: string; sku: string; quantity: number; lineTotalFils: number }[];
};

/** Missing config is a warning, never a crash. Checked before every send. */
export function notificationConfigStatus(): { configured: boolean; missing: string[] } {
  const { apiKey, to } = config();
  const missing: string[] = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!to) missing.push('ORDER_NOTIFICATION_EMAIL');
  return { configured: missing.length === 0, missing };
}

function governorateLabel(value: string): string {
  const g = governorates.find((x) => x.value === value);
  return g ? `${g.ar} / ${g.en}` : value;
}

const money = (fils: number) => `${currency.symbol.en} ${formatFils(fils)}`;

/**
 * Plain text alongside HTML: the owner reads this on a phone, and some mail
 * clients will show the text part. Both must be complete on their own.
 */
function renderText(order: NotifiableOrder): string {
  const lines = [
    `New order — ${order.reference}`,
    '',
    `Payment: ${order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod}`,
    '',
    `Name:    ${order.customerName}`,
    `Phone:   ${order.customerPhone}`,
    `Address: ${governorateLabel(order.governorate)} — ${order.area} — ${order.street}`,
  ];
  if (order.notes) lines.push(`Notes:   ${order.notes}`);
  lines.push('', 'Items:');
  for (const i of order.items) {
    lines.push(`  • ${i.titleEn} (${i.sku}) × ${i.quantity} — ${money(i.lineTotalFils)}`);
  }
  lines.push(
    '',
    `Subtotal: ${money(order.subtotalFils)}`,
    `Delivery: ${money(order.shippingFils)}`,
    `Total:    ${money(order.totalFils)}`,
  );
  return lines.join('\n');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderHtml(order: NotifiableOrder): string {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #e6eded">
          <strong>${esc(i.titleEn)}</strong><br>
          <span style="color:#5C6B6D;font-size:13px">${esc(i.titleAr)} · ${esc(i.sku)}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e6eded;text-align:center">${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e6eded;text-align:right;white-space:nowrap">${money(i.lineTotalFils)}</td>
      </tr>`,
    )
    .join('');

  // Brand colours are inlined here because email clients do not load a
  // stylesheet — this is the one sanctioned exception to the "no hex outside
  // globals.css" rule, and it is why the values are repeated with a comment.
  return `<!doctype html><html><body style="margin:0;background:#F4FAFA;font-family:system-ui,'Segoe UI',sans-serif;color:#060606">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#060606;color:#fff;padding:16px 20px;border-radius:16px 16px 0 0">
      <div style="font-size:12px;letter-spacing:.18em;color:#66C0C9;text-transform:uppercase">${esc(site.legalName)}</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">New order — ${esc(order.reference)}</div>
    </div>
    <div style="background:#fff;padding:20px;border:1px solid #e6eded;border-top:0;border-radius:0 0 16px 16px">
      <p style="margin:0 0 16px">
        <span style="display:inline-block;background:#B5DDDF;color:#1E6A74;padding:4px 10px;border-radius:999px;font-size:13px;font-weight:600">
          ${order.paymentMethod === 'cod' ? 'Cash on delivery' : esc(order.paymentMethod)}
        </span>
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 0;color:#5C6B6D;width:90px">Name</td><td><strong>${esc(order.customerName)}</strong></td></tr>
        <tr><td style="padding:4px 0;color:#5C6B6D">Phone</td><td><a href="tel:${esc(order.customerPhone)}" style="color:#1E6A74">${esc(order.customerPhone)}</a></td></tr>
        <tr><td style="padding:4px 0;color:#5C6B6D;vertical-align:top">Address</td><td>${esc(governorateLabel(order.governorate))}<br>${esc(order.area)} — ${esc(order.street)}</td></tr>
        ${order.notes ? `<tr><td style="padding:4px 0;color:#5C6B6D;vertical-align:top">Notes</td><td>${esc(order.notes)}</td></tr>` : ''}
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px">
        <thead><tr>
          <th style="text-align:left;padding-bottom:6px;border-bottom:2px solid #060606">Item</th>
          <th style="padding-bottom:6px;border-bottom:2px solid #060606">Qty</th>
          <th style="text-align:right;padding-bottom:6px;border-bottom:2px solid #060606">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;margin-top:14px;font-size:14px">
        <tr><td style="color:#5C6B6D">Subtotal</td><td style="text-align:right">${money(order.subtotalFils)}</td></tr>
        <tr><td style="color:#5C6B6D">Delivery</td><td style="text-align:right">${money(order.shippingFils)}</td></tr>
        <tr><td style="font-size:18px;font-weight:700;padding-top:6px">Total</td><td style="text-align:right;font-size:18px;font-weight:700;padding-top:6px">${money(order.totalFils)}</td></tr>
      </table>
    </div>
  </div></body></html>`;
}

export type NotifyResult =
  | { sent: true }
  | { sent: false; reason: 'not-configured'; missing: string[] }
  | { sent: false; reason: 'send-failed'; error: string };

/**
 * Sends the notification and stamps `notifiedAt` ONLY on a confirmed send.
 *
 * Never throws. Callers are on the order path and must not be able to fail
 * because of a notification.
 */
export async function sendOrderNotification(order: NotifiableOrder): Promise<NotifyResult> {
  const status = notificationConfigStatus();
  if (!status.configured) {
    console.warn(
      `[order-notification] SKIPPED for ${order.reference}: missing ${status.missing.join(', ')}. ` +
        `The order is saved. Set these and run "npx tsx scripts/resend-unnotified.ts" to catch up.`,
    );
    return { sent: false, reason: 'not-configured', missing: status.missing };
  }

  try {
    const { apiKey, to, from } = config();
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to!],
      subject: `New order ${order.reference} — ${money(order.totalFils)}`,
      text: renderText(order),
      html: renderHtml(order),
    });

    if (error) {
      // Resend reports failures in the payload rather than by throwing.
      console.error(
        `[order-notification] FAILED for ${order.reference}: ${error.message ?? String(error)}. ` +
          `Order is saved; notifiedAt left null for retry.`,
      );
      return { sent: false, reason: 'send-failed', error: error.message ?? String(error) };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { notifiedAt: new Date() },
    });
    console.info(`[order-notification] sent for ${order.reference}`);
    return { sent: true };
  } catch (e) {
    console.error(
      `[order-notification] FAILED for ${order.reference}: ${(e as Error).message}. ` +
        `Order is saved; notifiedAt left null for retry.`,
    );
    return { sent: false, reason: 'send-failed', error: (e as Error).message };
  }
}
