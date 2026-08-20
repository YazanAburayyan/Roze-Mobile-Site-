import { chromium } from 'playwright';
const b = await chromium.launch();
for (const loc of ['en', 'ar']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'NEXT_LOCALE', value: loc, url: 'http://localhost:3000' }]);
  const p = await ctx.newPage();
  await p.goto(loc === 'en' ? 'http://localhost:3000/en' : 'http://localhost:3000/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);              // let fonts swap + countdown tick
  await p.locator('header').screenshot({ path: `screenshots/hdr-only-${loc}.png` });
  console.log('screenshots/hdr-only-' + loc + '.png');
  await ctx.close();
}
await b.close();
