'use server';

import { checkoutSchema } from '@/lib/validation';
import { normaliseJordanianPhone } from '@/lib/validation';
import { buildOrderDraft, persistOrder, type CartLineInput } from '@/lib/orders';
import { getPaymentProvider } from '@/lib/payments/providers';
import { isLocale, type Locale } from '@/i18n/routing';

/**
 * The checkout server action.
 *
 * Order of operations matters and is deliberate:
 *   1. validate the customer input
 *   2. rebuild the order from the DATABASE, ignoring client prices entirely
 *   3. persist the order and decrement stock in a transaction
 *   4. only then hand off to the payment provider
 *
 * Step 4 last means a WhatsApp customer who never presses send still leaves
 * ROZE an order row and a phone number to call back.
 */

export type CheckoutState =
  | { status: 'idle' }
  | { status: 'error'; errorKey: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; reference: string; redirectUrl?: string };

export async function submitCheckout(
  input: unknown,
  lines: CartLineInput[],
  localeInput: string,
): Promise<CheckoutState> {
  const locale: Locale = isLocale(localeInput) ? localeInput : 'ar';

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', errorKey: 'validationFailed', fieldErrors };
  }

  const data = parsed.data;

  const provider = getPaymentProvider(data.paymentMethod);
  if (!provider) return { status: 'error', errorKey: 'unknownPaymentMethod' };

  const draftResult = await buildOrderDraft(lines, {
    customerName: data.customerName,
    customerPhone: normaliseJordanianPhone(data.customerPhone),
    governorate: data.governorate,
    area: data.area,
    street: data.street,
    notes: data.notes || null,
  });

  if (!draftResult.ok) return { status: 'error', errorKey: draftResult.errorKey };

  const { draft } = draftResult;

  if (!provider.isAvailable(draft)) {
    return { status: 'error', errorKey: 'paymentUnavailable' };
  }

  await persistOrder(draft, provider.id);

  const result = await provider.process(draft, locale);

  if (result.status === 'failed') {
    return { status: 'error', errorKey: result.errorKey };
  }

  return {
    status: 'success',
    reference: result.reference,
    redirectUrl: result.redirectUrl,
  };
}
