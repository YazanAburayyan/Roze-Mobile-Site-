import { redirect } from 'next/navigation';

/**
 * Root-level 404.
 *
 * Anything that never matched the `[locale]` segment has no locale context and
 * therefore no translations. Rather than render an untranslated dead end, send
 * the visitor to the Arabic homepage — the default locale — where the branded
 * 404 and the full navigation are available.
 */
export default function RootNotFound() {
  redirect('/');
}
