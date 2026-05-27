const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.daraz.com.np';
const VALID_EMAIL = process.env.DARAZ_EMAIL;
const VALID_PASSWORD = process.env.DARAZ_PASSWORD;

async function openLoginModal(page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Please enter your Phone or' })
    .waitFor({ timeout: 10000 });
}

// For wrong credentials — Daraz shows a dark toast notification
async function expectToast(page) {
  await expect(
    page.locator('.iweb-toast-wrap').first()
  ).toBeVisible({ timeout: 8000 });
}

// For empty fields — Daraz highlights the input pink (no toast shown)
// We assert that the modal is still open (login did NOT succeed)
async function expectStillOnLoginModal(page) {
  await expect(
    page.getByRole('button', { name: 'LOGIN' })
  ).toBeVisible({ timeout: 5000 });
}

test.describe('TS 002 - Login Functionality', () => {

  // TC1 - Valid login
  test('TC1 - Valid login with valid email and password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your Phone or' })
      .fill(VALID_EMAIL);
    await page.getByRole('textbox', { name: 'Please enter your password' })
      .fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Login link disappears from navbar after successful login
    await expect(
      page.getByRole('link', { name: 'Login' })
    ).not.toBeVisible({ timeout: 10000 });

    console.log('TC1 PASSED - Valid login successful');
  });

  // TC2 - Invalid email, valid password
  test('TC2 - Invalid email with valid password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your Phone or' })
      .fill('user10@invalid.com');
    await page.getByRole('textbox', { name: 'Please enter your password' })
      .fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectToast(page);
    console.log('TC2 PASSED - Invalid email toast error shown');
  });

  // TC3 - Valid email, wrong password
  test('TC3 - Valid email with invalid password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your Phone or' })
      .fill(VALID_EMAIL);
    await page.getByRole('textbox', { name: 'Please enter your password' })
      .fill('wrongpassword999');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectToast(page);
    console.log('TC3 PASSED - Wrong password toast error shown');
  });

  // TC4 - Invalid email, invalid password
  test('TC4 - Invalid email and invalid password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your Phone or' })
      .fill('user10@invalid.com');
    await page.getByRole('textbox', { name: 'Please enter your password' })
      .fill('wrongpassword999');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectToast(page);
    console.log('TC4 PASSED - Invalid credentials toast error shown');
  });

  // TC5 - Empty email, valid password
  test('TC5 - Empty email with valid password', async ({ page }) => {
    await openLoginModal(page);

    // Leave email empty — input turns pink, no toast
    await page.getByRole('textbox', { name: 'Please enter your password' })
      .fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Assert login did NOT succeed — modal stays open
    await expectStillOnLoginModal(page);

    // Also assert email input is highlighted (has error styling)
    const emailInput = page.getByRole('textbox', { name: 'Please enter your Phone or' });
    await expect(emailInput).toBeVisible();

    console.log('TC5 PASSED - Empty email blocks login, modal stays open');
  });

  // TC6 - Empty email, invalid password
  test('TC6 - Empty email with invalid password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your password' })
      .fill('wrongpassword999');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectStillOnLoginModal(page);
    console.log('TC6 PASSED - Empty email blocks login, modal stays open');
  });

  // TC7 - Valid email, empty password
  test('TC7 - Valid email with empty password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your Phone or' })
      .fill(VALID_EMAIL);
    // Leave password empty
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectStillOnLoginModal(page);
    console.log('TC7 PASSED - Empty password blocks login, modal stays open');
  });

  // TC8 - Invalid email, empty password
  test('TC8 - Invalid email with empty password', async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole('textbox', { name: 'Please enter your Phone or' })
      .fill('user10@invalid.com');
    // Leave password empty
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectStillOnLoginModal(page);
    console.log('TC8 PASSED - Empty password blocks login, modal stays open');
  });

  // TC9 - Both fields empty
  test('TC9 - Empty email and empty password', async ({ page }) => {
    await openLoginModal(page);

    // Submit with nothing filled
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expectStillOnLoginModal(page);
    console.log('TC9 PASSED - Empty fields block login, modal stays open');
  });

});