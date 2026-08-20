/**
 * F2 (RTL) + F3 (accessibility) static audit.
 *
 * Fetches every route in both locales from a running dev server and checks the
 * rendered HTML against the brand and accessibility gates. Static-HTML checks
 * only — this catches markup problems, not runtime interaction bugs.
 *
 * Run: npm run dev, then `node scripts/audit-pages.mjs`
 */
const BASE = 'http://localhost:3000';

const PATHS = [
  '', 'offers', 'maintenance', 'brands-list', 'brands/apple',
  'category/phones', 'category/phones/phone-accessories/chargers-cables',
  'product/iphone-15-pro', 'product/oppo-a78',
  `search?q=${encodeURIComponent('ايفون')}`,
  'cart', 'checkout', 'track',
  'about', 'faq', 'how-to-buy', 'contact', 'warranty', 'privacy',
];

/** Pages deliberately excluded from indexing, where hreflang is not required. */
const NOINDEX = /^(en\/)?(checkout|cart|search|track)/;

const findings = [];
const add = (page, rule, detail) => findings.push({ page, rule, detail });

for (const p of PATHS) {
  for (const loc of ['', 'en/']) {
    const url = `${BASE}/${loc}${p}`;
    const page = `${loc}${p || '/'}`;
    let html;
    try {
      const res = await fetch(url);
      if (!res.ok) { add(page, 'HTTP', String(res.status)); continue; }
      html = await res.text();
    } catch (e) { add(page, 'FETCH', String(e)); continue; }

    const expectedDir = loc === 'en/' ? 'ltr' : 'rtl';
    const dir = html.match(/<html[^>]*dir="([^"]+)"/)?.[1];
    if (dir !== expectedDir) add(page, 'dir', `expected ${expectedDir}, got ${dir}`);

    const expectedLang = loc === 'en/' ? 'en' : 'ar';
    const lang = html.match(/<html[^>]*lang="([^"]+)"/)?.[1];
    if (lang !== expectedLang) add(page, 'lang', `expected ${expectedLang}, got ${lang}`);

    // Physical direction utilities must not survive an RTL-first build.
    const physical = html.match(
      /class="[^"]*\b(ml-\d|mr-\d|pl-\d|pr-\d|text-left|text-right|border-l-|border-r-|rounded-l-|rounded-r-)/g,
    );
    if (physical) {
      const kinds = [...new Set(physical.map((m) => m.match(/\b(ml-\d|mr-\d|pl-\d|pr-\d|text-left|text-right|border-l-|border-r-|rounded-l-|rounded-r-)/)[1]))];
      add(page, 'physical-css', kinds.join(','));
    }

    // Colour contract: no raw hex outside globals.css.
    const hex = html.match(/style="[^"]*#[0-9a-fA-F]{3,6}/g);
    if (hex) add(page, 'inline-hex', hex.slice(0, 2).join(' '));

    const imgs = html.match(/<img[^>]*>/g) || [];
    const noAlt = imgs.filter((i) => !/\salt=/.test(i));
    if (noAlt.length) add(page, 'img-no-alt', `${noAlt.length} image(s)`);

    const h1s = (html.match(/<h1[\s>]/g) || []).length;
    if (h1s !== 1) add(page, 'h1-count', String(h1s));

    if (!/<title>/.test(html)) add(page, 'no-title', '');
    if (!/rel="canonical"/.test(html)) add(page, 'no-canonical', '');

    // Next emits the attribute as `hrefLang`; HTML attributes are
    // case-insensitive, so match either spelling.
    const hreflangs = [...html.matchAll(/hreflang="([^"]+)"/gi)].map((m) => m[1]);
    if (!NOINDEX.test(page) && (!hreflangs.includes('ar') || !hreflangs.includes('en'))) {
      add(page, 'hreflang', hreflangs.join(',') || 'none');
    }

    // Brand rule: the logo must never sit on a light ground.
    if (/<img[^>]*roze-logo/.test(html)) {
      const idx = html.search(/<img[^>]*roze-logo/);
      const context = html.slice(Math.max(0, idx - 400), idx);
      if (!/band-ink|bg-ink|bg-teal|on-ink/.test(context)) {
        add(page, 'logo-on-light', 'no plate/ink ancestor');
      }
    }

    // Every button needs an accessible name: aria-label, sr-only text, or text.
    const buttons = html.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];
    const nameless = buttons.filter(
      (b) => !/aria-label=/.test(b) && !/sr-only/.test(b) && !b.replace(/<[^>]+>/g, '').trim(),
    ).length;
    if (nameless) add(page, 'button-no-accessible-name', String(nameless));
  }
}

if (!findings.length) {
  console.log(`CLEAN — no findings across ${PATHS.length * 2} page renders.`);
} else {
  console.log(`${findings.length} finding(s):\n`);
  const byRule = {};
  for (const f of findings) (byRule[f.rule] ||= []).push(f);
  for (const [rule, list] of Object.entries(byRule)) {
    console.log(`## ${rule} (${list.length})`);
    for (const f of list.slice(0, 10)) console.log(`   ${f.page.padEnd(52)} ${f.detail}`);
    if (list.length > 10) console.log(`   ...and ${list.length - 10} more`);
  }
  process.exit(1);
}
