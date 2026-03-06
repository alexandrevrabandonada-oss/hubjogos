const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/estado');
  await page.waitForTimeout(5000);

  const headings = await page.$$eval('h1,h2,h3', (els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );

  const body = (await page.textContent('body')) || '';

  console.log('HEADINGS_JSON', JSON.stringify(headings));
  console.log('HAS_SOURCE_BADGE', body.toLowerCase().includes('supabase') || body.toLowerCase().includes('remoto'));
  console.log('HAS_EXPERIMENT_WORD', body.toLowerCase().includes('experimento'));
  console.log('HAS_UI_VARIANT', body.includes('ui_variant'));

  await browser.close();
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
