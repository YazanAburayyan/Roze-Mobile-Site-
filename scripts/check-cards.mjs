import { chromium } from 'playwright';
const b = await chromium.launch();
const out = [];
for (const [loc, path] of [['en','/en/category/phones'], ['ar','/category/phones']]) {
  for (const w of [390, 768, 1280, 1440]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addCookies([{ name: 'NEXT_LOCALE', value: loc, url: 'http://localhost:3000' }]);
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      // A label is clipped when its scrollWidth exceeds its clientWidth.
      // Button labels only. The category chip is truncated on purpose
      // (max-width + ellipsis), so counting it would be a false positive.
      const spans = [...document.querySelectorAll('button span.truncate')];
      const clipped = spans.filter((el) => el.scrollWidth > el.clientWidth + 1).length;
      // Chip vs stock badge overlap inside each card image.
      let overlaps = 0;
      for (const card of document.querySelectorAll('[class*="group"][class*="rounded-md"]')) {
        const chip = card.querySelector('span.absolute.end-2');
        const badge = card.querySelector('.absolute.start-2');
        if (!chip || !badge) continue;
        const a = chip.getBoundingClientRect(), c = badge.getBoundingClientRect();
        if (!(a.right < c.left || c.right < a.left || a.bottom < c.top || c.bottom < a.top)) overlaps++;
      }
      return {
        clipped, overlaps,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        cards: document.querySelectorAll('a[href*="/product/"]').length,
      };
    });
    out.push({ tag: `${loc}@${w}`, ...r });
    await ctx.close();
  }
}
await b.close();
let bad = 0;
for (const r of out) {
  const ok = r.clipped === 0 && r.overlaps === 0 && !r.overflow && r.cards > 0;
  if (!ok) bad++;
  console.log(`${ok?'PASS':'FAIL'} ${r.tag.padEnd(10)} clippedLabels=${r.clipped} badgeOverlaps=${r.overlaps} overflow=${r.overflow} cards=${r.cards}`);
}
console.log(bad ? `\n${bad} FAILED` : '\nCards render cleanly at every width.');
process.exit(bad?1:0);
