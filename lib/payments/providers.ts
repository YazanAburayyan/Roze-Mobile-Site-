import type { PaymentProvider, OrderDraft, PaymentResult } from './types';
import type { Locale } from '@/i18n/routing';
import { orderMessage, whatsappUrl } from '../whatsapp';
import { whatsapp } from '../site';

/**
 * Cash on delivery.
 *
 * Still the dominant payment method in Jordan. The order row is already saved
 * by the time this runs, so there is genuinely nothing to do but confirm — the
 * money changes hands at the door. That is not a stub; it is the whole flow.
 */
export const codProvider: PaymentProvider = {
  id: 'cod',
  labelKey: 'cashOnDeliveryLabel',
  descriptionKey: 'cashOnDeliveryExplanation',

  isAvailable() {
    // Later this is where a governorate allow-list or an order ceiling goes.
    return true;
  },

  async process(draft: OrderDraft): Promise<PaymentResult> {
    return { status: 'completed', reference: draft.reference };
  },
};

/**
 * WhatsApp handoff.
 *
 * Sends the customer into a chat with the shop, message pre-filled. The order
 * is persisted first, so if the customer never presses send, ROZE still has the
 * order and the phone number to call back.
 */
export const whatsappProvider: PaymentProvider = {
  id: 'whatsapp',
  labelKey: 'whatsappOrderLabel',
  descriptionKey: 'whatsappOrderExplanation',

  isAvailable() {
    return true;
  },

  async process(draft: OrderDraft, locale: Locale): Promise<PaymentResult> {
    return {
      status: 'redirect',
      reference: draft.reference,
      redirectUrl: whatsappUrl(whatsapp.sales, orderMessage(draft, locale)),
    };
  },
};

/**
 * The registry. Adding a card gateway means writing `hyperpay.ts` in this
 * folder and adding it to this array — nothing else in the codebase changes.
 * Order here is the order shown at checkout.
 */
export const paymentProviders: readonly PaymentProvider[] = [
  codProvider,
  whatsappProvider,
];

export function getPaymentProvider(id: string): PaymentProvider | undefined {
  return paymentProviders.find((p) => p.id === id);
}

export function availableProviders(draft: OrderDraft): PaymentProvider[] {
  return paymentProviders.filter((p) => p.isAvailable(draft));
}
