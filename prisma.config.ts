import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI configuration.
 *
 * WHY THIS FILE EXISTS — two separate reasons:
 *
 * 1. Environment loading. Next.js reads `.env.local` automatically; the Prisma
 *    CLI does NOT — it only reads `.env`. Without this, `prisma migrate` would
 *    silently pick up whatever `DATABASE_URL` is in `.env` (previously the old
 *    SQLite file) and migrate the wrong database while appearing to succeed.
 *    `process.loadEnvFile` is built into Node 20+, so this needs no dependency.
 *
 * 2. `package.json#prisma` is deprecated and removed in Prisma 7. The seed
 *    command lives here now instead.
 *
 * Load order below is deliberate: `.env` first as the baseline, then
 * `.env.local` on top so it wins — matching how Next.js resolves them, so the
 * CLI and the running app always agree on which database they are pointing at.
 */
for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // Missing file is fine — `.env.local` is not committed and won't exist on
    // a fresh clone or in CI.
  }
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
