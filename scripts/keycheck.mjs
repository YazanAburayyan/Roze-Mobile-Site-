import fs from 'node:fs';

/**
 * Guards messages/ar.json and messages/en.json against drift.
 *
 * Several agents edit these files concurrently during a build, so this asserts
 * two things: the key sets are identical, and each message uses the same ICU
 * placeholders in both languages.
 *
 * Run: node scripts/keycheck.mjs   (exit 1 on any problem)
 */
const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? flat(v, p + k + '.') : [p + k],
  );

const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

const A = new Set(flat(ar));
const E = new Set(flat(en));
const onlyAr = [...A].filter((k) => !E.has(k));
const onlyEn = [...E].filter((k) => !A.has(k));

console.log('ar keys:', A.size, ' en keys:', E.size);
console.log('only in ar:', onlyAr.length ? onlyAr.join(', ') : '(none)');
console.log('only in en:', onlyEn.length ? onlyEn.join(', ') : '(none)');

const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

/**
 * Real ICU argument names only — `{count}` and `{count, plural, ...}`.
 * Deliberately ignores plural-branch bodies like `{1 item}` or `{# devices}`,
 * which are text, not placeholders.
 */
const ph = (s) =>
  [...String(s).matchAll(/\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[,}]/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

let mismatch = 0;
for (const k of A) {
  if (!E.has(k)) continue;
  const a = ph(get(ar, k));
  const e = ph(get(en, k));
  if (a !== e) {
    console.log('PLACEHOLDER MISMATCH', k, '| ar:', a, '| en:', e);
    mismatch++;
  }
}
console.log('placeholder mismatches:', mismatch);
process.exit(onlyAr.length || onlyEn.length || mismatch ? 1 : 0);
