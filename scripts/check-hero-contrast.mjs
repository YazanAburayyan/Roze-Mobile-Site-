import { chromium } from 'playwright';
import sharp from 'sharp';

/**
 * Headline legibility over the hero photograph.
 *
 * The backdrop is an image, so a token-based contrast check cannot answer it.
 * Method: find the headline's box, then hide the type and screenshot the SAME
 * box — that yields the backdrop alone, with no anti-aliased glyph edges to
 * pollute the sample. Worst case is the brightest backdrop pixel, since the
 * type is near-white.
 */
const lum = (r, g, b) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const browser = await chromium.launch();
const results = [];

for (const [loc, url] of [['ar', 'http://localhost:3000/'], ['en', 'http://localhost:3000/en']]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: 'NEXT_LOCALE', value: loc, url: 'http://localhost:3000' }]);
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);

  const box = await p.locator('h1').boundingBox();
  await p.evaluate(() => { document.querySelector('h1').style.visibility = 'hidden'; });
  await p.waitForTimeout(200);
  await p.screenshot({ path: `screenshots/_backdrop-${loc}.png`, clip: box });

  const { data, info } = await sharp(`screenshots/_backdrop-${loc}.png`)
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });

  let brightest = 0, sum = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const L = lum(data[i], data[i + 1], data[i + 2]);
    if (L > brightest) brightest = L;
    sum += L; n++;
  }
  const paper = lum(250, 249, 247);
  const worst = (paper + 0.05) / (brightest + 0.05);
  const mean = (paper + 0.05) / (sum / n + 0.05);
  results.push({ loc, brightest, worst, mean });
  await ctx.close();
}
await browser.close();

let bad = 0;
for (const r of results) {
  // Display type is 40px+ and bold, so the AA threshold for large text is 3:1.
  const ok = r.worst >= 3;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.loc}  worst-case ${r.worst.toFixed(2)}:1  mean ${r.mean.toFixed(2)}:1  (large-text AA needs 3:1)`);
}
process.exit(bad ? 1 : 0);
