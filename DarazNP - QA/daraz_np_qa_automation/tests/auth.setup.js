require('dotenv').config();

const { test: setup } = require('@playwright/test');

setup('save authenticated session', async ({ page }) => {
  const email = process.env.DARAZ_EMAIL;
  const password = process.env.DARAZ_PASSWORD;

  if (!email || !password) {
    throw new Error('DARAZ_EMAIL and DARAZ_PASSWORD must be set in .env');
  }

  await page.goto('https://www.daraz.com.np', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByRole('link', { name: /login/i }).click();

  await page.getByRole('textbox', {
    name: /Phone|Email/i,
  }).fill(email);

  await page.getByRole('textbox', {
    name: /password/i,
  }).fill(password);

  await page.getByRole('button', { name: /^LOGIN$/i }).click();

  try {
    await Promise.race([
      page.getByRole('textbox', {
        name: /Please enter your password/i,
      }).waitFor({ state: 'hidden', timeout: 45000 }),
      page.locator('.iweb-modal').waitFor({ state: 'hidden', timeout: 45000 }),
    ]);
  } catch (error) {
    const fs = require('fs');
    const authPath = require('path').join(__dirname, '..', 'auth.json');

    if (fs.existsSync(authPath)) {
      console.warn('Automated login did not complete; keeping existing auth.json');
      return;
    }

    throw error;
  }

  await page.context().storageState({ path: 'auth.json' });
});
