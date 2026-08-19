import './load-env';
import { PrismaClient } from '@prisma/client';
import { sendOrderNotification, notificationConfigStatus } from '../lib/notifications/order-email';

/**
 * Retries order notifications that never went out.
 *
 * This is the safety net for the one failure this design tolerates: the process
 * dies, or the email provider is down, between the order committing and the
 * notification sending. The order is saved either way — `notifiedAt` stays null
 * and this script picks it up.
 *
 * Run it manually after fixing credentials, or on a schedule (cron / a Vercel
 * cron job hitting a protected route) if you want it automatic.
 *
 *   npx tsx scripts/resend-unnotified.ts            # send
 *   npx tsx scripts/resend-unnotified.ts --dry-run  # list only
 *
 * Safe to run repeatedly: an order is only ever stamped on a confirmed send,
 * and stamped orders are not selected again.
 */

const dryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

async function main() {
  const status = notificationConfigStatus();
  if (!status.configured && !dryRun) {
    console.error(
      `Cannot send: missing ${status.missing.join(', ')}.\n` +
        `Set them in .env.local, then run this again. Nothing was changed.`,
    );
    process.exitCode = 1;
    return;
  }

  const pending = await prisma.order.findMany({
    where: { notifiedAt: null },
    include: { items: true },
    orderBy: { createdAt: 'asc' },
  });

  if (pending.length === 0) {
    console.log('No unnotified orders. Nothing to do.');
    return;
  }

  console.log(`${pending.length} unnotified order(s):`);
  for (const o of pending) {
    console.log(`  ${o.reference}  ${o.createdAt.toISOString()}  ${o.customerName}`);
  }

  if (dryRun) {
    console.log('\n--dry-run: nothing sent.');
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const order of pending) {
    const result = await sendOrderNotification({
      id: order.id,
      reference: order.reference,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      governorate: order.governorate,
      area: order.area,
      street: order.street,
      notes: order.notes,
      subtotalFils: order.subtotalFils,
      shippingFils: order.shippingFils,
      totalFils: order.totalFils,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i) => ({
        titleAr: i.titleAr,
        titleEn: i.titleEn,
        sku: i.sku,
        quantity: i.quantity,
        lineTotalFils: i.lineTotalFils,
      })),
    });

    if (result.sent) {
      sent++;
      console.log(`  ✓ ${order.reference}`);
    } else {
      failed++;
      console.log(`  ✗ ${order.reference} — ${result.reason}`);
    }
  }

  console.log(`\nsent: ${sent}   still pending: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error('resend-unnotified failed:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
