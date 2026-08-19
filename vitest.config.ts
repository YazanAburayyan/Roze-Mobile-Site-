import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Load .env then .env.local, matching Next.js precedence, so integration
// tests reach the same database the app does.
for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    /* absent file is fine */
  }
}

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws outside a React Server Component, which would
      // block testing lib/orders.ts. The real guard still applies in the build.
      'server-only': path.resolve('./scripts/stubs/server-only.ts'),
      '@': path.resolve('.'),
    },
  },
  test: {
    environment: 'node',
    // These hit the real database over the network.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
