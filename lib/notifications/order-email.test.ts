import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

/**
 * Order-notification contract.
 *
 * Resend itself is mocked — these assert OUR rules, which are the ones a
 * refactor can break:
 *
 *   1. Missing config never throws; it logs and skips.
 *   2. A send failure never throws and never stamps `notifiedAt`, so the
 *      order stays recoverable by scripts/resend-unnotified.ts.
 *   3. `notifiedAt` is stamped ONLY on a confirmed send.
 *
 * Rule 3 is what makes the retry script safe to run repeatedly: a stamped
 * order is never selected again, and an unstamped one always is.
 */

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const { sendOrderNotification, notificationConfigStatus } = await import('./order-email');
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

const orderIds: string[] = [];

async function makeOrder() {
  const order = await prisma.order.create({
    data: {
      reference: 'ROZE-TESTN' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      customerName: 'Notification Contract Test',
      customerPhone: '+962790000789',
      governorate: 'amman',
      area: 'Jubaiha',
      street: 'Abu Nsair St',
      subtotalFils: 20_000,
      shippingFils: 3_000,
      totalFils: 23_000,
      paymentMethod: 'cod',
    },
  });
  orderIds.push(order.id);
  return {
    id: order.id,
    reference: order.reference,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    governorate: order.governorate,
    area: order.area,
    street: order.street,
    notes: null,
    subtotalFils: order.subtotalFils,
    shippingFils: order.shippingFils,
    totalFils: order.totalFils,
    paymentMethod: order.paymentMethod,
    items: [
      { titleAr: 'آيفون 15 برو', titleEn: 'iPhone 15 Pro', sku: 'X1', quantity: 1, lineTotalFils: 20_000 },
    ],
  };
}

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.ORDER_NOTIFICATION_EMAIL = 'owner@example.com';
});

afterAll(async () => {
  if (orderIds.length) await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  await prisma.$disconnect();
});

describe('order notification', () => {
  it('skips without throwing when config is missing, and does not stamp', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.ORDER_NOTIFICATION_EMAIL;

    expect(notificationConfigStatus()).toEqual({
      configured: false,
      missing: ['RESEND_API_KEY', 'ORDER_NOTIFICATION_EMAIL'],
    });

    const order = await makeOrder();
    const result = await sendOrderNotification(order);

    expect(result).toEqual({
      sent: false,
      reason: 'not-configured',
      missing: ['RESEND_API_KEY', 'ORDER_NOTIFICATION_EMAIL'],
    });
    expect(sendMock).not.toHaveBeenCalled();

    const row = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(row.notifiedAt).toBeNull();
  });

  it('does not stamp notifiedAt when the provider returns an error', async () => {
    sendMock.mockResolvedValue({ error: { message: 'API key is invalid' }, data: null });

    const order = await makeOrder();
    const result = await sendOrderNotification(order);

    expect(result).toEqual({ sent: false, reason: 'send-failed', error: 'API key is invalid' });
    const row = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(row.notifiedAt).toBeNull();
  });

  it('does not stamp notifiedAt when the provider throws', async () => {
    sendMock.mockRejectedValue(new Error('network down'));

    const order = await makeOrder();
    const result = await sendOrderNotification(order);

    expect(result.sent).toBe(false);
    const row = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(row.notifiedAt).toBeNull();
  });

  it('stamps notifiedAt only on a confirmed send', async () => {
    sendMock.mockResolvedValue({ error: null, data: { id: 'msg_123' } });

    const order = await makeOrder();
    const before = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(before.notifiedAt).toBeNull();

    const result = await sendOrderNotification(order);
    expect(result).toEqual({ sent: true });

    const after = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(after.notifiedAt).toBeInstanceOf(Date);
  });

  it('sends the details the shop needs to act on the order', async () => {
    sendMock.mockResolvedValue({ error: null, data: { id: 'msg_1' } });
    const order = await makeOrder();
    await sendOrderNotification(order);

    const payload = sendMock.mock.calls[0][0];
    expect(payload.to).toEqual(['owner@example.com']);
    expect(payload.subject).toContain(order.reference);

    // Reference, name, phone, address, item and total must all be present in
    // the plain-text part — the owner may only ever see that one.
    for (const needle of [
      order.reference,
      'Notification Contract Test',
      '+962790000789',
      'Jubaiha',
      'iPhone 15 Pro',
      '23.000',
    ]) {
      expect(payload.text).toContain(needle);
    }
  });

  it('escapes customer-supplied text in the HTML part', async () => {
    sendMock.mockResolvedValue({ error: null, data: { id: 'msg_2' } });
    const order = await makeOrder();
    order.customerName = '<script>alert(1)</script>';

    await sendOrderNotification(order);
    const payload = sendMock.mock.calls[0][0];
    expect(payload.html).not.toContain('<script>alert(1)</script>');
    expect(payload.html).toContain('&lt;script&gt;');
  });

  it('once stamped, the order is no longer selected for retry', async () => {
    sendMock.mockResolvedValue({ error: null, data: { id: 'msg_3' } });
    const order = await makeOrder();
    await sendOrderNotification(order);

    const pending = await prisma.order.findMany({
      where: { notifiedAt: null, id: { in: [order.id] } },
    });
    expect(pending).toHaveLength(0);
  });
});
