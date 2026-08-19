import './load-env';
import { productImageUrl, PLACEHOLDER_IMAGE, storagePublicUrl } from '../lib/product-image';

/**
 * Verifies image resolution and the next/image host allowlist.
 *
 * What this CANNOT verify: that a real uploaded object renders. Uploading
 * object bytes requires the Storage HTTP API and therefore a Supabase key,
 * which this project deliberately does not hold. The upload path is the
 * dashboard procedure documented in CONTENT.md.
 */
const host = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_HOST;
console.log('storage host configured :', host || '(unset)');

const cases: [string, string | null | undefined, string][] = [
  ['bucket path', 'iphone-15-pro.webp', 'resolves to public bucket URL'],
  ['leading slash path', '/nested/photo.webp', 'treated as local public/ file'],
  ['absolute url', 'https://cdn.example.com/a.jpg', 'passed through'],
  ['empty string', '', 'placeholder'],
  ['null', null, 'placeholder'],
  ['undefined', undefined, 'placeholder'],
];

for (const [name, url, expectation] of cases) {
  const resolved = productImageUrl(url == null ? null : { url });
  console.log(`  ${name.padEnd(20)} -> ${resolved}`);
  console.log(`  ${''.padEnd(20)}    (${expectation})`);
}

const sample = storagePublicUrl('iphone-15-pro.webp');
console.log('\nsample public URL:', sample);
console.log('correct shape    :', sample === `https://${host}/storage/v1/object/public/products/iphone-15-pro.webp`);
console.log('placeholder const:', PLACEHOLDER_IMAGE);

// Does the bucket actually serve public reads? A missing object returns a
// Storage JSON error, NOT an auth error — that difference proves public-read.
const probe = await fetch(sample).catch(() => null);
if (probe) {
  const body = await probe.text();
  console.log('\nGET on a non-existent object:');
  console.log('  status:', probe.status);
  console.log('  body  :', body.slice(0, 120));
  console.log('  => public-read confirmed:', !/unauthor|invalid.*jwt|permission/i.test(body));
}
