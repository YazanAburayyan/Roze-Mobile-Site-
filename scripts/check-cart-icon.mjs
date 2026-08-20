import { chromium } from 'playwright';

/** Contrast of the cart glyph against the header it sits on. */
const lum = (r, g, b) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const parse = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const ratio = (a, b) => { const [x, y] = [lum(...a), lum(...b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3000' }]);
const p = await ctx.newPage();
await p.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

const r = await p.evaluate(() => {
  const cart = document.querySelector('header a[href*="/cart"]');
  const header = document.querySelector('header');
  return {
    icon: getComputedStyle(cart).color,
    bar: getComputedStyle(header).backgroundColor,
    topBarHeight: Math.round(document.querySelector('header').previousElementSibling.getBoundingClientRect().height),
    headerHeight: Math.round(header.getBoundingClientRect().height),
  };
});

const c = ratio(parse(r.icon), parse(r.bar));
console.log('cart icon colour :', r.icon);
console.log('header bg        :', r.bar);
console.log('contrast         :', c.toFixed(2) + ':1', c >= 3 ? '(passes AA for UI glyphs)' : '(TOO LOW)');
console.log('top bar height   :', r.topBarHeight + 'px');
console.log('header height    :', r.headerHeight + 'px');
await b.close();
process.exit(c >= 3 ? 0 : 1);
