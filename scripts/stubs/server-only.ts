/**
 * No-op stand-in for the `server-only` package.
 *
 * `server-only` throws on import outside a React Server Component, which stops
 * verification scripts from exercising modules like lib/orders.ts under plain
 * tsx. Mapped in tsconfig.scripts.json so ONLY the scripts use this — the app
 * build keeps the real guard.
 */
export {};
