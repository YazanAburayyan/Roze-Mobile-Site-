import './load-env';
import { PrismaClient } from '@prisma/client';

/**
 * Removes orders created by the verification scripts and test suites.
 *
 * Every fixture this repo creates uses one of the reference prefixes or
 * customer names listed below. Anything else is left alone and reported
 * loudly, so a real order can never be deleted by running this.
 *
 *   npx tsx scripts/cleanup-test-orders.mts
 */
const prisma = new PrismaClient();

const TEST_REFERENCE_PREFIXES = ['RLS-PROBE-', 'ROZE-TEST'];

const TEST_CUSTOMER_NAMES = [
  'Track Security Test',
  'Notification Contract Test',
  'RLS probe',
  'اختبار الاتصال', // verify-order-roundtrip.mts
];

const all = await prisma.order.findMany({
  select: { id: true, reference: true, customerName: true, createdAt: true },
  orderBy: { createdAt: 'asc' },
});

console.log(`orders currently in database: ${all.length}`);
for (const o of all) console.log(`  ${o.reference.padEnd(26)} ${o.customerName}`);

const isTest = (o: (typeof all)[number]) =>
  TEST_REFERENCE_PREFIXES.some((p) => o.reference.startsWith(p)) ||
  TEST_CUSTOMER_NAMES.includes(o.customerName) ||
  o.customerName.startsWith('Notify test (');

const doomed = all.filter(isTest);
console.log(`\ndeleting ${doomed.length} test order(s)`);

for (const o of doomed) {
  await prisma.orderItem.deleteMany({ where: { orderId: o.id } });
  await prisma.order.delete({ where: { id: o.id } });
  console.log(`  removed ${o.reference}`);
}

const left = await prisma.order.findMany({ select: { reference: true, customerName: true } });
console.log(`\norders remaining: ${left.length}`);
for (const o of left) console.log(`  NOT A KNOWN FIXTURE (left alone): ${o.reference} ${o.customerName}`);

await prisma.$disconnect();
