'use server';

import { headers } from 'next/headers';
import { trackSchema, normaliseJordanianPhone } from '@/lib/validation';
import { findOrderForTracking } from '@/lib/orders';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Order lookup — no account, no login.
 *
 * Two safety properties, both required:
 *  - reference AND phone must match the SAME order, so guessing references
 *    leaks nothing about other customers
 *  - rate limited per IP, so the reference space cannot be brute-forced
 *
 * The rate limiter is in-process (see lib/rate-limit.ts) — effective on one
 * node, useless across several. Documented rather than hidden.
 */

export type TrackState =
  | { status: 'idle' }
  | { status: 'error'; errorKey: string; fieldErrors?: Record<string, string> }
  | {
      status: 'found';
      order: {
        reference: string;
        status: string;
        createdAt: string;
        totalFils: number;
        items: { titleAr: string; titleEn: string; quantity: number; lineTotalFils: number }[];
      };
    };

export async function lookupOrder(input: unknown): Promise<TrackState> {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';

  const limit = rateLimit(`track:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!limit.allowed) return { status: 'error', errorKey: 'tooManyAttempts' };

  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', errorKey: 'validationFailed', fieldErrors };
  }

  const order = await findOrderForTracking(
    parsed.data.reference,
    normaliseJordanianPhone(parsed.data.phone),
  );

  // A wrong phone and a nonexistent reference return the SAME response, so the
  // form cannot be used to discover which references exist.
  if (!order) return { status: 'error', errorKey: 'orderNotFound' };

  return {
    status: 'found',
    order: {
      reference: order.reference,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      totalFils: order.totalFils,
      items: order.items.map((i) => ({
        titleAr: i.titleAr,
        titleEn: i.titleEn,
        quantity: i.quantity,
        lineTotalFils: i.lineTotalFils,
      })),
    },
  };
}
