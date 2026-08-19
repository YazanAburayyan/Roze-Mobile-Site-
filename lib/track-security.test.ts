import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

/**
 * Regression guard for the /track disclosure property.
 *
 * THE PROPERTY: looking up an order with the WRONG PHONE and looking up a
 * reference THAT DOES NOT EXIST must produce byte-identical responses.
 *
 * WHY IT MATTERS: if the two differ in any way — a different error key, a
 * different message, even a different field order — the form becomes an oracle
 * for "does this order reference exist?". Since references are short and
 * guessable, that turns /track into an enumeration endpoint over customer
 * names, phone numbers and delivery addresses.
 *
 * This is exactly the kind of property a well-meaning refactor breaks
 * ("let's tell the user their phone didn't match, it's friendlier"), so it is
 * asserted rather than left to review.
 *
 * These tests hit the real database and create one order, which they delete.
 */

// `headers()` needs a request context that does not exist under vitest.
vi.mock('next/headers', () => ({
  headers: async () => new Map([['x-forwarded-for', '203.0.113.10']]),
}));

const REAL_PHONE = '+962790000123';
const WRONG_PHONE = '0791111111';
let realReference = '';

let prisma: import('@prisma/client').PrismaClient;
let lookupOrder: typeof import('@/app/actions/track')['lookupOrder'];
let findOrderForTracking: typeof import('@/lib/orders')['findOrderForTracking'];

beforeAll(async () => {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
  ({ lookupOrder } = await import('@/app/actions/track'));
  ({ findOrderForTracking } = await import('@/lib/orders'));

  realReference = 'ROZE-TEST' + Math.random().toString(36).slice(2, 6).toUpperCase();
  await prisma.order.create({
    data: {
      reference: realReference,
      customerName: 'Track Security Test',
      customerPhone: REAL_PHONE,
      governorate: 'amman',
      area: 'Jubaiha',
      street: 'Abu Nsair St',
      subtotalFils: 10_000,
      shippingFils: 3_000,
      totalFils: 13_000,
      paymentMethod: 'cod',
    },
  });
});

afterAll(async () => {
  if (realReference) {
    await prisma.order.deleteMany({ where: { reference: realReference } });
  }
  await prisma.$disconnect();
});

describe('/track does not disclose which order references exist', () => {
  it('returns byte-identical responses for a wrong phone and a missing reference', async () => {
    const wrongPhone = await lookupOrder({ reference: realReference, phone: WRONG_PHONE });
    const missingRef = await lookupOrder({ reference: 'ROZE-NOPE99', phone: WRONG_PHONE });

    // Byte-identical, not merely equivalent: field order included.
    expect(JSON.stringify(wrongPhone)).toBe(JSON.stringify(missingRef));
    expect(wrongPhone).toEqual({ status: 'error', errorKey: 'orderNotFound' });
  });

  it('leaks nothing about the real order in the refused response', async () => {
    const refused = JSON.stringify(
      await lookupOrder({ reference: realReference, phone: WRONG_PHONE }),
    );
    expect(refused).not.toContain(realReference);
    expect(refused).not.toContain('Track Security Test');
    expect(refused).not.toContain('Jubaiha');
    expect(refused).not.toContain('13000');
  });

  it('still returns the order to the person who has the right phone', async () => {
    const ok = await lookupOrder({ reference: realReference, phone: REAL_PHONE });
    expect(ok.status).toBe('found');
    if (ok.status === 'found') expect(ok.order.reference).toBe(realReference);
  });

  it('accepts the local 07 form as well as E.164 for the same order', async () => {
    const local = await lookupOrder({ reference: realReference, phone: '0790000123' });
    expect(local.status).toBe('found');
  });

  it('refuses a reference-only lookup at the data layer', async () => {
    // Defence in depth: even below the action, reference alone must not match.
    expect(await findOrderForTracking(realReference, WRONG_PHONE)).toBeNull();
    expect(await findOrderForTracking(realReference, REAL_PHONE)).not.toBeNull();
  });
});
