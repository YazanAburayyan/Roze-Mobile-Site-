/**
 * Product image resolution.
 *
 * Photos live in the public Supabase Storage bucket `products`. The database
 * stores a PATH inside that bucket (e.g. `iphone-15-pro.webp`), never a full
 * URL — so the project can move buckets, regions or CDNs without rewriting
 * every row.
 *
 * Public-read, no signed URLs: a retail catalogue's product photos are public
 * by definition. Signing them would add expiry handling and defeat CDN caching
 * for no benefit.
 *
 * Three shapes are accepted, so nothing breaks while photography is arriving:
 *   "iphone-15-pro.webp"        -> bucket path, resolved to the public URL
 *   "/products/local.jpg"       -> a file in public/, served as-is
 *   "https://cdn.example/x.jpg" -> already absolute, served as-is
 * Anything missing falls back to the placeholder, so the grid never renders a
 * broken tile.
 *
 * See CONTENT.md for the non-developer upload procedure.
 */

export const PLACEHOLDER_IMAGE = '/products/placeholder.svg';

export const STORAGE_BUCKET = 'products';

/**
 * Host of the Supabase project, e.g. `abcdefgh.supabase.co`.
 *
 * NOT a credential — it is the public hostname that appears in every image
 * URL. It lives in an env var only so the project ref is not hardcoded into a
 * public repository, and so a bucket move is a config change.
 */
const STORAGE_HOST = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_HOST ?? '';

/** Public object URL for a path inside the bucket. */
export function storagePublicUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  if (!STORAGE_HOST) {
    // Misconfiguration must degrade to the placeholder, not to a broken tile.
    console.warn(
      '[product-image] NEXT_PUBLIC_SUPABASE_STORAGE_HOST is not set — ' +
        `cannot resolve "${path}", using the placeholder instead.`,
    );
    return PLACEHOLDER_IMAGE;
  }
  return `https://${STORAGE_HOST}/storage/v1/object/public/${STORAGE_BUCKET}/${clean}`;
}

/**
 * Resolve a stored image reference to something `next/image` can render.
 * Always returns a usable src — never null, never an empty string.
 */
export function productImageUrl(image?: { url: string } | null): string {
  const raw = image?.url?.trim();
  if (!raw) return PLACEHOLDER_IMAGE;

  // Already absolute, or a local file under public/ — pass through untouched.
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;

  return storagePublicUrl(raw);
}
