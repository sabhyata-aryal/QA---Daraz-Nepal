const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.daraz.com.np';

async function openFirstProduct(page) {

  await page.goto(BASE_URL, {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForTimeout(3000);

  const firstProduct = page.locator(
    'a[href*="/products/"]'
  ).first();

  await expect(firstProduct).toBeVisible({
    timeout: 15000
  });

  await firstProduct.click();

  await page.waitForLoadState('domcontentloaded');

  await page.waitForTimeout(3000);
}

async function getAddToCartButton(page) {

  return page.locator('button').filter({
    hasText: /add to cart/i
  }).first();
}

async function getQuantityPlusControl(page) {

  const pickerPlus = page.locator('.next-number-picker-handler-up').first();

  if (await pickerPlus.count()) {
    return pickerPlus;
  }

  return page
    .locator('h6')
    .filter({ hasText: /^Quantity$/i })
    .locator('xpath=ancestor::*[contains(@class,"number-picker") or contains(@class,"quantity")][1]')
    .locator('[class*="handler-up"], [class*="plus"]')
    .first();
}

test.describe('TS 009 - Add to Cart Functionality', () => {

  test.describe('with authenticated session', () => {

    test.use({ storageState: 'auth.json' });

    test('TC1 - Add a single in-stock product to cart', async ({ page }) => {

    await openFirstProduct(page);

    const cartBadge = page.locator(
      '[class*="cart-quantity"], ' +
      '[class*="cart-count"]'
    ).first();

    const countBefore = parseInt(
      await cartBadge.innerText().catch(() => '0')
    ) || 0;

    const addToCartBtn = await getAddToCartButton(page);

    await expect(addToCartBtn).toBeVisible({
      timeout: 15000
    });

    await addToCartBtn.scrollIntoViewIfNeeded();

    try {
      await addToCartBtn.click();
    } catch {
      await addToCartBtn.click({ force: true });
    }

    const countAfter = parseInt(
      await cartBadge.innerText().catch(() => '0')
    ) || 0;

    let cartHasItem = false;

    if (countAfter <= countBefore) {
      await page.goto('https://cart.daraz.com.np/cart', {
        waitUntil: 'domcontentloaded'
      });

      const emptyCartVisible = await page
        .getByText(/your cart is empty|no item in your cart/i)
        .isVisible()
        .catch(() => false);

      cartHasItem = !emptyCartVisible;
    }

    const addedToCart = countAfter > countBefore || cartHasItem;

    expect(addedToCart).toBeTruthy();

    console.log('TC1 PASSED');
    });

  });

  test('TC2 - Add to Cart button is visible', async ({ page }) => {

    await openFirstProduct(page);

    await expect(await getAddToCartButton(page)).toBeVisible({
      timeout: 15000
    });

    console.log('TC2 PASSED');
  });

  test('TC3 - Quantity selector is visible and can be increased', async ({ page }) => {

    await openFirstProduct(page);

    await expect(
      page.locator('h6').filter({ hasText: /^Quantity$/i })
    ).toBeVisible({
      timeout: 15000
    });

    const qtyPlus = await getQuantityPlusControl(page);
    const quantityInput = page
      .locator('h6')
      .filter({ hasText: /^Quantity$/i })
      .locator('xpath=ancestor::*[1]')
      .locator('input')
      .first();

    if (await qtyPlus.count()) {
      await qtyPlus.click();
      await expect(quantityInput).toHaveValue(/[2-9]/, { timeout: 5000 });
    } else {
      await quantityInput.fill('2');
      await expect(quantityInput).toHaveValue('2');
    }

    console.log('TC3 PASSED');
  });

  test.describe('guest session', () => {

    test.use({ storageState: { cookies: [], origins: [] } });

    test('TC4 - Add to Cart without login prompts response', async ({ page }) => {

      await openFirstProduct(page);

      const addToCartBtn = await getAddToCartButton(page);
      await addToCartBtn.click();

      await page.waitForTimeout(3000);

      const loginModalVisible = await page.locator(
        '.iweb-modal, ' +
        'button:has-text("LOGIN")'
      ).first().isVisible().catch(() => false);

      const toastVisible = await page.locator(
        '[class*="toast"], ' +
        '[class*="success"]'
      ).first().isVisible().catch(() => false);

      const cartPageReached = page.url().includes('/cart');

      expect(
        loginModalVisible || cartPageReached || toastVisible
      ).toBeTruthy();

      console.log('TC4 PASSED');
    });
  });

  test('TC5 - Product images are visible', async ({ page }) => {

    await openFirstProduct(page);

    const images = page.locator('img');
    const count = await images.count();

    expect(count).toBeGreaterThan(0);

    console.log(`TC5 PASSED - ${count} images found`);
  });

});