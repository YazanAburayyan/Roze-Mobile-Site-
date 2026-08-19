import type { ReactNode } from 'react';

/**
 * Next requires a root layout, but the real document shell lives in
 * `app/[locale]/layout.tsx` — it is the only place that knows the locale, and
 * therefore the only place that can set `lang` and `dir` on <html>.
 * This layout is a deliberate pass-through.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
