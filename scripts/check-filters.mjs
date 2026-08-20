import { chromium } from 'playwright';

const b = await chromium.launch();
const rows = [];

for (const [loc, path] of [['ar', '/category/entertainment'], ['en', '/en/category/entertainment']]) {
  for (const w of [390, 768, 1024, 1280, 1440]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addCookies([{ name: 'NEXT_LOCALE', value: loc, url: 'http://localhost:3000' }]);
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);

    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const panel = document.querySelector('form[data-filter-panel], aside, fieldset')?.closest('div,form,aside');
      // Any element whose box escapes the viewport:
      const escaping = [...document.querySelectorAll('body *')].filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 1 && (b.right > vw + 1 || b.left < -1);
      }).length;
      // Price inputs specifically.
      const nums = [...document.querySelectorAll('input[type="number"]')].map((el) => {
        const b = el.getBoundingClientRect();
        return { w: Math.round(b.width), right: Math.round(b.right), inView: b.right <= vw + 1 && b.left >= -1 };
      });
      return { vw, docW: document.documentElement.scrollWidth, escaping, nums };
    });

    rows.push({
      tag: `${loc} @${w}`,
      overflow: r.docW > r.vw,
      escaping: r.escaping,
      priceInputs: r.nums.length,
      allInView: r.nums.every((n) => n.inView),
      widths: r.nums.map((n) => n.w).join('/'),
    });
    await ctx.close();
  }
}
await b.close();

let bad = 0;
for (const r of rows) {
  const ok = !r.overflow && r.escaping === 0 && r.allInView && r.priceInputs === 2;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.tag.padEnd(12)} overflow=${r.overflow} escaping=${r.escaping} inputs=${r.priceInputs} inView=${r.allInView} widths=${r.widths}`);
}
console.log(bad ? `\n${bad} FAILED` : '\nFilter sidebar fits at every width.');
process.exit(bad ? 1 : 0);
