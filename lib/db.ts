import { PrismaClient } from '@prisma/client';

/**
 * Standard Next.js PrismaClient singleton, guarded against hot-reload
 * duplication in dev. Next dev's module reload would otherwise create a
 * fresh PrismaClient (and a fresh SQLite connection pool) on every edit,
 * eventually exhausting connections.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
