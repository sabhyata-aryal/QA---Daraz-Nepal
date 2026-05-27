const { chromium } = require('@playwright/test');

// Run this ONCE to save your login session
// Command: node tests/auth.setup.js

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.daraz.com.np');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Please enter your Phone or' })
    .waitFor({ timeout: 10000 });
  await page.getByRole('textbox', { name: 'Please enter your Phone or' })
    .fill('sabhyata.aryal01@gmail.com');
  await page.getByRole('textbox', { name: 'Please enter your password' })
    .fill('sabhDaraz@123');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Wait for login to complete
  await page.waitForTimeout(5000);

  // Save session cookies and storage
  await context.storageState({ path: 'auth.json' });
  console.log('✅ Login session saved to auth.json');

  await browser.close();
})();