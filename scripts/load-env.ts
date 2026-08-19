import path from 'node:path';

/**
 * Loads `.env` then `.env.local` (the latter winning), matching how Next.js
 * resolves them.
 *
 * Standalone scripts run under plain `tsx` get no automatic env loading, and
 * the real connection strings live in `.env.local` — which is gitignored and
 * therefore the only place they can safely live. Without this, a script would
 * fail with "Environment variable not found: DATABASE_URL", or worse, silently
 * fall back to a stale URL in `.env` and operate on the wrong database.
 *
 * `process.loadEnvFile` is built into Node 20+, so this costs no dependency.
 * Import this module for its side effect, before anything that reads env.
 */
for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // Absent file is fine — `.env.local` does not exist on a fresh clone.
  }
}
