import { z } from 'zod';
import { governorates } from './site';

/**
 * Shared schemas. Used by react-hook-form on the client AND re-validated in the
 * server action — client validation is a courtesy, server validation is the
 * rule.
 *
 * Error messages are i18n KEYS, not sentences. The form resolves them through
 * next-intl's `forms` namespace so validation speaks Arabic by default.
 */

/**
 * Jordanian mobile numbers.
 *
 * Accepts what people actually type: `0791234567`, `+962791234567`,
 * `00962791234567`, and the same with spaces or dashes. Normalises to E.164.
 * Jordanian mobile prefixes are 077, 078 and 079.
 */
export const JO_MOBILE_RE = /^(?:\+962|00962|0)?7[789]\d{7}$/;

export function normaliseJordanianPhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^00/, '');
  const national = digits.startsWith('962') ? digits.slice(3) : digits.replace(/^0/, '');
  return `+962${national}`;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => JO_MOBILE_RE.test(v), { message: 'invalidPhone' });

export const nameSchema = z.string().trim().min(3, { message: 'nameTooShort' });

export const checkoutSchema = z.object({
  customerName: nameSchema,
  customerPhone: phoneSchema,
  governorate: z.enum(
    governorates.map((g) => g.value) as [string, ...string[]],
    { message: 'pleaseChooseGovernorate' },
  ),
  area: z.string().trim().min(2, { message: 'requiredField' }),
  street: z.string().trim().min(3, { message: 'requiredField' }),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  paymentMethod: z.string().min(1, { message: 'requiredField' }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const serviceRequestSchema = z.object({
  customerName: nameSchema,
  customerPhone: phoneSchema,
  deviceType: z.enum(['phone', 'laptop', 'console', 'other'], {
    message: 'requiredField',
  }),
  deviceModel: z.string().trim().max(120).optional().or(z.literal('')),
  serviceTypeId: z.string().optional().or(z.literal('')),
  issueDescription: z.string().trim().min(10, { message: 'messageTooShort' }),
  preferredTime: z.string().optional().or(z.literal('')),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export const trackSchema = z.object({
  reference: z.string().trim().min(4, { message: 'requiredField' }),
  phone: phoneSchema,
});

export type TrackInput = z.infer<typeof trackSchema>;
