import { chromium } from 'playwright';

const b = await chromium.launch();
const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

for (const [loc, url] of [['en', 'http://localhost:3000/en'], ['ar', 'http://localhost:3000/']]) {
  for (const [vp, width] of [['desktop', 1440], ['mobile', 390]]) {
    const ctx = await b.newContext({ viewport: { width, height: 860 } });
    await ctx.addCookies([{ name: 'NEXT_LOCALE', value: loc, url: 'http://localhost:3000' }]);
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'networkidle' });
    const tag = `${loc}/${vp}`;

    // Panel must not exist until the icon is clicked.
    check(`${tag} closed by default`, await p.locator('#roze-search-panel').count() === 0);

    const trigger = p.locator('header button[aria-controls="roze-search-panel"]');
    check(`${tag} icon visible`, await trigger.isVisible());

    await trigger.click();
    const panel = p.locator('#roze-search-panel');
    await panel.waitFor({ state: 'visible', timeout: 4000 });
    check(`${tag} opens on click`, true);

    // White field, dark text.
    const bg = await p.locator('#roze-header-search').evaluate(
      (el) => getComputedStyle(el).backgroundColor);
    check(`${tag} field is light`, bg === 'rgb(255, 253, 251)', bg);

    check(`${tag} input focused`, await p.evaluate(
      () => document.activeElement?.id === 'roze-header-search'));

    // Escape closes.
    await p.keyboard.press('Escape');
    await p.waitForTimeout(200);
    check(`${tag} Escape closes`, await p.locator('#roze-search-panel').count() === 0);

    // Click-outside closes.
    await trigger.click();
    await panel.waitFor({ state: 'visible' });
    await p.mouse.click(width / 2, 700);
    await p.waitForTimeout(250);
    check(`${tag} click-outside closes`, await p.locator('#roze-search-panel').count() === 0);

    // Submitting navigates to /search.
    await trigger.click();
    await panel.waitFor({ state: 'visible' });
    await p.locator('#roze-header-search').fill('ايفون');
    await p.keyboard.press('Enter');
    await p.waitForURL(/\/search\?q=/, { timeout: 8000 });
    const hits = await p.locator('a[href*="/product/"]').count();
    check(`${tag} submit -> results`, hits > 0, `${hits} results`);

    await ctx.close();
  }
}
await b.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(30)} ${r.detail}`);
}
console.log(failed ? `\n${failed} FAILED` : '\nAll search interactions pass.');
process.exit(failed ? 1 : 0);
