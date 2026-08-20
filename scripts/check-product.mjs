import { chromium } from 'playwright';
const b = await chromium.launch();
const out = [];
for (const [loc, path] of [['en','/en/product/iphone-15-pro'], ['ar','/product/iphone-15-pro'],
                            ['en-oos','/en/product/oppo-a78']]) {
  for (const w of [390, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addCookies([{ name: 'NEXT_LOCALE', value: loc.startsWith('ar') ? 'ar' : 'en', url: 'http://localhost:3000' }]);
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const txt = document.body.innerText;
      const tabs = [...document.querySelectorAll('[role="tab"]')].map(t => t.textContent.trim());
      // Only the MAIN buy panel. Related-product cards carry their own
      // add-to-cart buttons and are correctly enabled when those items are in
      // stock, so counting them all was a flaw in this check, not the page.
      const cart = [...document.querySelectorAll('button')]
        .filter(b => /add to cart|أضف/i.test(b.textContent))
        .filter(b => !b.closest('a[href*="/product/"]') && !b.parentElement?.closest('[class*=group]'));
      const wa = [...document.querySelectorAll('a[href*="wa.me"]')];
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        tabs, tabCount: tabs.length,
        hasReviewTab: tabs.some(t => /review|تقييم/i.test(t)),
        cartDisabled: cart.length ? cart.every(b => b.disabled) : null,
        waCount: wa.length,
        onlyLeftCount: (txt.match(/Only \d+ left|متبقي/g) || []).length,
      };
    });
    out.push({ tag: `${loc}@${w}`, ...r });
    await ctx.close();
  }
}
await b.close();
let bad = 0;
for (const r of out) {
  const oos = r.tag.startsWith('en-oos');
  const ok = !r.overflow && r.h1 === 1 && !r.hasReviewTab && r.tabCount === 2 && r.waCount >= 1 &&
             (oos ? r.cartDisabled !== false : true);
  if (!ok) bad++;
  console.log(`${ok?'PASS':'FAIL'} ${r.tag.padEnd(12)} overflow=${r.overflow} h1=${r.h1} tabs=${r.tabCount} review=${r.hasReviewTab} cartDisabled=${r.cartDisabled} wa=${r.waCount} lowStockMentions=${r.onlyLeftCount}`);
}
console.log(bad ? `\n${bad} FAILED` : '\nProduct page checks pass.');
process.exit(bad?1:0);
