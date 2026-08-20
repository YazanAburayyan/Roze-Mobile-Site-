import { chromium } from 'playwright';
import fs from 'node:fs';

/**
 * Real screenshots from a running server.
 *
 * The R10 gate requires images a human (or model) can actually look at —
 * computed-style inspection is what let the previous build ship looking dead.
 *
 *   node scripts/shoot.mjs [label]
 */
const label = process.argv[2] ?? 'shot';
const BASE = process.env.SHOOT_BASE ?? 'http://localhost:3000';

const targets = [
  ['home-ar', '/', 'ar'],
  ['home-en', '/en', 'en'],
  ['category-ar', '/category/phones', 'ar'],
  ['product-en', '/en/product/iphone-15-pro', 'en'],
];
const viewports = [
  ['mobile', 390, 844],
  ['desktop', 1440, 900],
];

fs.mkdirSync('screenshots', { recursive: true });
const browser = await chromium.launch();

for (const [name, path, locale] of targets) {
  for (const [vpName, width, height] of viewports) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      locale: locale === 'ar' ? 'ar-JO' : 'en-US',
      extraHTTPHeaders: { 'Accept-Language': locale === 'ar' ? 'ar-JO,ar' : 'en-US,en' },
    });
    // Pin the locale so cookie-based detection cannot redirect us.
    await ctx.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: BASE }]);
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(900); // let scroll-reveal settle
    const file = `screenshots/${label}-${name}-${vpName}.png`;
    await page.screenshot({ path: file, fullPage: vpName === 'desktop' });
    const kb = (fs.statSync(file).size / 1024).toFixed(0);
    console.log(`${file}  (${width}x${height}, ${kb} KB)`);
    await ctx.close();
  }
}
await browser.close();
