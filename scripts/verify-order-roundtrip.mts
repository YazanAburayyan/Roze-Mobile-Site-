import '../scripts/load-env';
import { PrismaClient } from '@prisma/client';
import { buildOrderDraft, persistOrder, findOrderForTracking } from '../lib/orders';

/**
 * End-to-end write test against the POOLER.
 *
 * This is the whole reason for leaving SQLite: orders must survive. It also
 * exercises a multi-statement $transaction through PgBouncer in transaction
 * mode, which is where a misconfigured pooler URL fails.
 *
 * Creates one order and deletes it again — the database is left as found.
 */
const prisma = new PrismaClient();
let reference: string | null = null;

try {
  const product = await prisma.product.findFirstOrThrow({ where: { inStock: true } });
  const stockBefore = product.stockQuantity;

  const draft = await buildOrderDraft(
    [{ productId: product.id, quantity: 2 }],
    {
      customerName: 'اختبار الاتصال',
      customerPhone: '+962790000000',
      governorate: 'amman',
      area: 'الجبيهة',
      street: 'شارع أبو نصير',
      notes: 'automated connectivity test',
    },
  );

  if (!draft.ok) throw new Error('draft failed: ' + draft.errorKey);
  reference = draft.draft.reference;

  const order = await persistOrder(draft.draft, 'cod');
  console.log('order written        :', order.reference);
  console.log('line items persisted :', order.items.length);
  console.log('total (fils)         :', order.totalFils, '= JOD', (order.totalFils / 1000).toFixed(3));

  // Server-side re-pricing must have used the DB price, not a client value.
  console.log('priced from DB       :', order.items[0]!.unitPriceFils === product.price);

  // Stock decrement inside the transaction.
  const after = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
  console.log('stock decremented    :', stockBefore - after.stockQuantity === 2);

  // The /track security property: reference + phone must match the same row.
  const found = await findOrderForTracking(reference, '0790000000');
  console.log('lookup w/ right phone:', found?.reference === reference);
  const wrong = await findOrderForTracking(reference, '0791111111');
  console.log('lookup w/ wrong phone:', wrong === null ? 'correctly refused' : 'LEAKED');

  // Restore stock.
  await prisma.product.update({
    where: { id: product.id },
    data: { stockQuantity: stockBefore, inStock: true },
  });
} finally {
  if (reference) {
    const o = await prisma.order.findUnique({ where: { reference } });
    if (o) {
      await prisma.orderItem.deleteMany({ where: { orderId: o.id } });
      await prisma.order.delete({ where: { id: o.id } });
      console.log('test order cleaned up:', reference);
    }
  }
  const remaining = await prisma.order.count();
  console.log('orders left in db    :', remaining);
  await prisma.$disconnect();
}
