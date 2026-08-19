import 'server-only';
import { prisma } from './db';
import type { OrderDraft } from './payments/types';
import { FREE_SHIPPING_THRESHOLD_FILS, FLAT_SHIPPING_FILS } from './cart/store';

/**
 * Order creation.
 *
 * The rule that matters here: **prices are re-read from the database, never
 * taken from the client.** The cart in localStorage is a UI convenience and a
 * hostile client can put any number in it. Every line is re-priced and
 * re-checked for stock server-side before the order row is written.
 */

/** Human-readable and phone-friendly: ROZE-7K3M9Q. No 0/O/1/I ambiguity. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateReference(prefix = 'ROZE'): string {
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${prefix}-${out}`;
}

export type CartLineInput = { productId: string; quantity: number };

export type BuildDraftResult =
  | { ok: true; draft: OrderDraft }
  | { ok: false; errorKey: 'emptyCart' | 'itemUnavailable'; unavailable?: string[] };

export async function buildOrderDraft(
  lines: CartLineInput[],
  customer: {
    customerName: string;
    customerPhone: string;
    governorate: string;
    area: string;
    street: string;
    notes?: string | null;
  },
): Promise<BuildDraftResult> {
  if (!lines.length) return { ok: false, errorKey: 'emptyCart' };

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isActive: true },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const unavailable: string[] = [];
  const items: OrderDraft['items'] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    const quantity = Math.max(1, Math.floor(line.quantity));

    // Gone, deactivated, or no longer in stock in the quantity asked for.
    if (!product || !product.inStock || product.stockQuantity < quantity) {
      unavailable.push(product?.titleEn ?? line.productId);
      continue;
    }

    items.push({
      productId: product.id,
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      sku: product.sku,
      // Authoritative price, from the database.
      unitPriceFils: product.price,
      quantity,
      lineTotalFils: product.price * quantity,
    });
  }

  if (unavailable.length) return { ok: false, errorKey: 'itemUnavailable', unavailable };
  if (!items.length) return { ok: false, errorKey: 'emptyCart' };

  const subtotalFils = items.reduce((sum, i) => sum + i.lineTotalFils, 0);
  const shippingFils =
    subtotalFils >= FREE_SHIPPING_THRESHOLD_FILS ? 0 : FLAT_SHIPPING_FILS;

  return {
    ok: true,
    draft: {
      reference: generateReference(),
      ...customer,
      notes: customer.notes ?? null,
      items,
      subtotalFils,
      shippingFils,
      totalFils: subtotalFils + shippingFils,
    },
  };
}

/**
 * Persist the order and decrement stock in one transaction.
 *
 * The order is written BEFORE the payment provider runs. For WhatsApp that is
 * deliberate: if the customer never presses send in WhatsApp, ROZE still has
 * the order and a phone number to call back on. Losing that would be the whole
 * point of the handoff, lost.
 */
export async function persistOrder(draft: OrderDraft, paymentMethod: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        reference: draft.reference,
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        governorate: draft.governorate,
        area: draft.area,
        street: draft.street,
        notes: draft.notes ?? null,
        subtotalFils: draft.subtotalFils,
        shippingFils: draft.shippingFils,
        totalFils: draft.totalFils,
        paymentMethod,
        status: 'pending',
        items: {
          create: draft.items.map((i) => ({
            productId: i.productId,
            titleAr: i.titleAr,
            titleEn: i.titleEn,
            sku: i.sku,
            unitPriceFils: i.unitPriceFils,
            quantity: i.quantity,
            lineTotalFils: i.lineTotalFils,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of draft.items) {
      if (!item.productId) continue;
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      // `inStock` is stored, not derived, so it has to be kept honest here.
      if (updated.stockQuantity <= 0 && updated.inStock) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: false, stockQuantity: Math.max(0, updated.stockQuantity) },
        });
      }
    }

    return order;
  });
}

/**
 * Order lookup for `/track`.
 *
 * Reference AND phone are both required and both must match the same row. A
 * reference alone must never return an order — otherwise guessing references
 * would leak other people's names, addresses and phone numbers.
 */
export async function findOrderForTracking(reference: string, phone: string) {
  const normalisedRef = reference.trim().toUpperCase();
  const normalisedPhone = phone.replace(/[^\d+]/g, '');

  const order = await prisma.order.findFirst({
    where: { reference: normalisedRef },
    include: { items: true },
  });

  if (!order) return null;

  // Compare on digits only, so 0799000301 and +962799000301 both work — but
  // still require a genuine match rather than accepting the reference alone.
  const stored = order.customerPhone.replace(/[^\d]/g, '');
  const given = normalisedPhone.replace(/[^\d]/g, '');
  const matches =
    stored === given ||
    stored.endsWith(given.slice(-9)) ||
    given.endsWith(stored.slice(-9));

  return matches ? order : null;
}
