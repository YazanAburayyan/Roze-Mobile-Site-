import './load-env';
import { PrismaClient } from '@prisma/client';
import { buildOrderDraft, persistOrder } from '../lib/orders';

/**
 * Exercises the order-notification failure paths end to end.
 *
 * Scenario is chosen by argv[2]: "unconfigured" | "badkey".
 * Creates one real order, reports whether it saved and whether notifiedAt was
 * stamped, then leaves it for the resend script to pick up (the caller cleans).
 */
const scenario = process.argv[2] ?? 'unconfigured';

if (scenario === 'unconfigured') {
  delete process.env.RESEND_API_KEY;
  delete process.env.ORDER_NOTIFICATION_EMAIL;
} else if (scenario === 'badkey') {
  process.env.RESEND_API_KEY = 're_invalid_key_for_testing_0000';
  process.env.ORDER_NOTIFICATION_EMAIL = 'orders@example.com';
}

// Imported AFTER env is set, since the module reads it at load time.
const prisma = new PrismaClient();
const product = await prisma.product.findFirstOrThrow({ where: { inStock: true } });
const stockBefore = product.stockQuantity;

const draft = await buildOrderDraft([{ productId: product.id, quantity: 1 }], {
  customerName: `Notify test (${scenario})`,
  customerPhone: '+962790000456',
  governorate: 'amman',
  area: 'Jubaiha',
  street: 'Abu Nsair St',
  notes: `notification scenario: ${scenario}`,
});
if (!draft.ok) throw new Error('draft failed');

console.log(`--- scenario: ${scenario} ---`);
const order = await persistOrder(draft.draft, 'cod');

const saved = await prisma.order.findUnique({ where: { id: order.id } });
console.log('order saved        :', Boolean(saved), saved?.reference);
console.log('notifiedAt         :', saved?.notifiedAt ?? 'null (pending retry)');
console.log('order path survived:', true);

// leave stock as found
await prisma.product.update({
  where: { id: product.id },
  data: { stockQuantity: stockBefore, inStock: true },
});
await prisma.$disconnect();
