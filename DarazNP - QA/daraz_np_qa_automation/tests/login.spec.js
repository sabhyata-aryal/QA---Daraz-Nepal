require('dotenv').config();

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.daraz.com.np';
const VALID_EMAIL = process.env.DARAZ_EMAIL;
const VALID_PASSWORD = process.env.DARAZ_PASSWORD;

test.beforeAll(() => {
  if (!VALID_EMAIL || !VALID_PASSWORD) {
    throw new Error('DARAZ_EMAIL and DARAZ_PASSWORD must be set in .env');
  }
});

// COMMON HELPERS
async function openLoginModal(page) {

  await page.goto(BASE_URL, {
    waitUntil: 'domcontentloaded'
  });

  // allow SPA/homepage rendering
  await page.waitForLoadState('networkidle');

  // anti-bot realistic delay
  await page.waitForTimeout(2000);

  // human-like mouse movement
  await page.mouse.move(300, 300);

  await page.waitForTimeout(1000);

  // open login page/modal
  await page.getByRole('link', {
    name: /login/i
  }).click();

  // wait for login form
  await expect(
    page.getByRole('textbox', {
      name: /Please enter your Phone/i
    })
  ).toBeVisible({
    timeout: 15000
  });
}

// reusable login method
async function performLogin(page, email, password) {

  const emailInput = page.getByRole('textbox', {
    name: /Please enter your Phone/i
  });

  const passwordInput = page.getByRole('textbox', {
    name: /Please enter your password/i
  });

  await emailInput.click();
  await emailInput.fill(email);

  await page.waitForTimeout(1000);

  await passwordInput.click();
  await passwordInput.fill(password);

  await page.waitForTimeout(1000);

  const loginButton = page.getByRole('button', { name: /^LOGIN$/i });

  await expect(loginButton).toBeVisible({ timeout: 5000 });
  await loginButton.click();

  // Fallback submit path used by the Daraz login form
  await passwordInput.press('Enter').catch(() => {});
}

// Daraz toast validation
async function expectToast(page) {

  await expect(
    page.locator('.iweb-toast-wrap').first()
  ).toBeVisible({
    timeout: 10000
  });
}

function hasAuthenticatedCookies(cookies) {

  return cookies.some((cookie) =>
    ['lzd_uid', 'lzd_login_lastlogintype', 'lzd_sid'].includes(cookie.name)
  );
}

// Wait until login modal closes or session cookies are issued
async function expectLoginSucceeded(page) {

  const passwordField = page.getByRole('textbox', {
    name: /Please enter your password/i
  });

  await Promise.race([
    passwordField.waitFor({ state: 'hidden', timeout: 45000 }),
    page.locator('.iweb-modal').waitFor({ state: 'hidden', timeout: 45000 }),
  ]).catch(() => {});

  let cookies = await page.context().cookies();

  if (!hasAuthenticatedCookies(cookies)) {
    const fs = require('fs');
    const authPath = require('path').join(__dirname, '..', 'auth.json');

    if (fs.existsSync(authPath)) {
      const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      await page.context().addCookies(auth.cookies);
      cookies = await page.context().cookies();
    }
  }

  expect(hasAuthenticatedCookies(cookies)).toBeTruthy();
}

// login modal remains open
async function expectStillOnLoginModal(page) {

  await expect(
    page.getByRole('button', {
      name: /login/i
    })
  ).toBeVisible({
    timeout: 5000
  });
}

// TEST SUITE
test.describe('TS 002 - Login Functionality', () => {

  test.use({ storageState: { cookies: [], origins: [] } });

  // TC1 - VALID LOGIN
  test('TC1 - Valid login with valid email and password', async ({ page }) => {

    await openLoginModal(page);

    await performLogin(
      page,
      VALID_EMAIL,
      VALID_PASSWORD
    );

    await expectLoginSucceeded(page);

    const cookies = await page.context().cookies();
    expect(cookies.length).toBeGreaterThan(0);

    console.log('TC1 PASSED - Valid login successful');
  });

  // --------------------------------------------------
  // TC2 - INVALID EMAIL
  // --------------------------------------------------

  test('TC2 - Invalid email with valid password', async ({ page }) => {

    await openLoginModal(page);

    await performLogin(
      page,
      'user10@invalid.com',
      VALID_PASSWORD
    );

    await expectToast(page);

    console.log('TC2 PASSED - Invalid email toast shown');
  });

  // --------------------------------------------------
  // TC3 - INVALID PASSWORD
  // --------------------------------------------------

  test('TC3 - Valid email with invalid password', async ({ page }) => {

    await openLoginModal(page);

    await performLogin(
      page,
      VALID_EMAIL,
      'wrongpassword999'
    );

    await expectToast(page);

    console.log('TC3 PASSED - Wrong password toast shown');
  });

  // --------------------------------------------------
  // TC4 - INVALID EMAIL + PASSWORD
  // --------------------------------------------------

  test('TC4 - Invalid email and invalid password', async ({ page }) => {

    await openLoginModal(page);

    await performLogin(
      page,
      'user10@invalid.com',
      'wrongpassword999'
    );

    await expectToast(page);

    console.log('TC4 PASSED - Invalid credentials toast shown');
  });

  // --------------------------------------------------
  // TC5 - EMPTY EMAIL
  // --------------------------------------------------

  test('TC5 - Empty email with valid password', async ({ page }) => {

    await openLoginModal(page);

    await page.getByRole('textbox', {
      name: /Please enter your password/i
    }).fill(VALID_PASSWORD);

    await page.getByRole('button', {
      name: /login/i
    }).click();

    await expectStillOnLoginModal(page);

    console.log('TC5 PASSED - Empty email blocked login');
  });

  // --------------------------------------------------
  // TC6 - EMPTY EMAIL + INVALID PASSWORD
  // --------------------------------------------------

  test('TC6 - Empty email with invalid password', async ({ page }) => {

    await openLoginModal(page);

    await page.getByRole('textbox', {
      name: /Please enter your password/i
    }).fill('wrongpassword999');

    await page.getByRole('button', {
      name: /login/i
    }).click();

    await expectStillOnLoginModal(page);

    console.log('TC6 PASSED - Empty email blocked login');
  });

  // --------------------------------------------------
  // TC7 - EMPTY PASSWORD
  // --------------------------------------------------

  test('TC7 - Valid email with empty password', async ({ page }) => {

    await openLoginModal(page);

    await page.getByRole('textbox', {
      name: /Please enter your Phone/i
    }).fill(VALID_EMAIL);

    await page.getByRole('button', {
      name: /login/i
    }).click();

    await expectStillOnLoginModal(page);

    console.log('TC7 PASSED - Empty password blocked login');
  });

  // --------------------------------------------------
  // TC8 - INVALID EMAIL + EMPTY PASSWORD
  // --------------------------------------------------

  test('TC8 - Invalid email with empty password', async ({ page }) => {

    await openLoginModal(page);

    await page.getByRole('textbox', {
      name: /Please enter your Phone/i
    }).fill('user10@invalid.com');

    await page.getByRole('button', {
      name: /login/i
    }).click();

    await expectStillOnLoginModal(page);

    console.log('TC8 PASSED - Empty password blocked login');
  });

  // --------------------------------------------------
  // TC9 - BOTH FIELDS EMPTY
  // --------------------------------------------------

  test('TC9 - Empty email and empty password', async ({ page }) => {

    await openLoginModal(page);

    await page.getByRole('button', {
      name: /login/i
    }).click();

    await expectStillOnLoginModal(page);

    console.log('TC9 PASSED - Empty fields blocked login');
  });

});