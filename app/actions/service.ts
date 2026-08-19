'use server';

import { prisma } from '@/lib/db';
import { serviceRequestSchema, normaliseJordanianPhone } from '@/lib/validation';
import { generateReference } from '@/lib/orders';
import { serviceRequestMessage, whatsappUrl } from '@/lib/whatsapp';
import { whatsapp } from '@/lib/site';
import { isLocale, type Locale } from '@/i18n/routing';

/**
 * Maintenance booking.
 *
 * Routes to the SERVICE WhatsApp line, never the showroom — a repair enquiry
 * landing on the sales phone is a real operational cost for a shop this size.
 * `whatsapp.service` is env-overridable in one place (lib/site.ts).
 */

export type ServiceState =
  | { status: 'idle' }
  | { status: 'error'; errorKey: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; reference: string; redirectUrl: string };

export async function submitServiceRequest(
  input: unknown,
  localeInput: string,
): Promise<ServiceState> {
  const locale: Locale = isLocale(localeInput) ? localeInput : 'ar';

  const parsed = serviceRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', errorKey: 'validationFailed', fieldErrors };
  }

  const data = parsed.data;
  const reference = generateReference('ROZE-S');

  const serviceType = data.serviceTypeId
    ? await prisma.serviceType.findUnique({ where: { id: data.serviceTypeId } })
    : null;

  // Persist first, so a booking survives the customer abandoning WhatsApp.
  await prisma.serviceRequest.create({
    data: {
      reference,
      customerName: data.customerName,
      customerPhone: normaliseJordanianPhone(data.customerPhone),
      deviceType: data.deviceType,
      deviceModel: data.deviceModel || null,
      serviceTypeId: serviceType?.id ?? null,
      issueDescription: data.issueDescription,
      preferredTime: data.preferredTime ? new Date(data.preferredTime) : null,
      status: 'new',
    },
  });

  const message = serviceRequestMessage(
    {
      reference,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deviceType: data.deviceType,
      deviceModel: data.deviceModel || null,
      serviceName: serviceType
        ? locale === 'ar'
          ? serviceType.nameAr
          : serviceType.nameEn
        : null,
      issueDescription: data.issueDescription,
      preferredTime: data.preferredTime || null,
    },
    locale,
  );

  return {
    status: 'success',
    reference,
    redirectUrl: whatsappUrl(whatsapp.service, message),
  };
}
