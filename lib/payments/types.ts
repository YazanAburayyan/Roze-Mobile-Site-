import type { Locale } from '@/i18n/routing';

/**
 * The payment seam.
 *
 * ROZE has no card gateway in Phase 1 — Jordanian acquirers require a trade
 * licence and 1–3 weeks of paperwork, and that paperwork has not started. So
 * Phase 1 ships two providers: `cod` (cash on delivery) and `whatsapp` (hand
 * the order to a human on WhatsApp).
 *
 * The point of this interface is that adding HyperPay, Tap or MEPS later is
 * writing ONE new file in this folder and adding it to the registry in
 * `index.ts`. Nothing outside `lib/payments/` should ever need to change —
 * no component, no page, no schema migration. `Order.paymentMethod` is a plain
 * string precisely so a third value costs no migration.
 *
 * See EXTENDING.md for the step-by-step.
 */

export type PaymentMethodId = string;

export type OrderDraft = {
  reference: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  area: string;
  street: string;
  notes?: string | null;
  items: {
    productId: string | null;
    titleAr: string;
    titleEn: string;
    sku: string;
    unitPriceFils: number;
    quantity: number;
    lineTotalFils: number;
  }[];
  subtotalFils: number;
  shippingFils: number;
  totalFils: number;
};

/**
 * What a provider hands back to the checkout flow.
 *
 * `redirectUrl` is how a provider takes the customer somewhere else — a
 * WhatsApp deep link today, a hosted card page tomorrow. The checkout page
 * does not care which.
 */
export type PaymentResult =
  | { status: 'completed'; reference: string; redirectUrl?: string }
  | { status: 'redirect'; reference: string; redirectUrl: string }
  | { status: 'failed'; reference: string; errorKey: string };

export interface PaymentProvider {
  /** Stored verbatim in `Order.paymentMethod`. */
  readonly id: PaymentMethodId;

  /** i18n key under `checkout` for the label and the explanation. */
  readonly labelKey: string;
  readonly descriptionKey: string;

  /**
   * Whether this provider can serve a given draft. COD might later be
   * restricted by governorate or order value; a card gateway might require a
   * minimum. Returning false hides the option at checkout.
   */
  isAvailable(draft: OrderDraft): boolean;

  /**
   * Run the payment. Providers that take money would call out to an acquirer
   * here; the Phase 1 providers do not, which is exactly why they are cheap.
   * The order row is already persisted before this is called, so a provider
   * never has to know about the database.
   */
  process(draft: OrderDraft, locale: Locale): Promise<PaymentResult>;
}
