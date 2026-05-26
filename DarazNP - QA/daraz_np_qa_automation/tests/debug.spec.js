const { test } = require('@playwright/test');

test('debug - find TC1 and TC6 selectors', async ({ page }) => {
  await page.goto('https://www.daraz.com.np', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // TC1 - Print page title
  console.log('PAGE TITLE:', await page.title());

  // TC6 - Print all links near the search bar (trending searches)
  const allLinks = await page.locator('a').all();
  for (const link of allLinks) {
    const text = await link.innerText().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    if (text.trim() && href && href.includes('q=')) {
      console.log(`SEARCH LINK: "${text.trim()}" | href: ${href.substring(0, 80)}`);
    }
  }
});