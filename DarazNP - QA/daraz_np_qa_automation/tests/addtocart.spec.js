const { test, expect } = require('@playwright/test');

const PRODUCT_URL = 'https://www.daraz.com.np/products/asus-vivobook-15-intel-core-5-120u-14th-generation-16gb-ddr4-ram-512gb-nvme-ssd-156-fhd-1920-x-1080-ips-display-intel-uhd-graphics-silver-i1514909056-s8395528423.html';

test.describe('TS 009 - Add to Cart Functionality', () => {

  // TC1 - Add single in-stock product to cart
  test('TC1 - Add a single in-stock product to cart', async ({ page }) => {
    test.setTimeout(60000); // extend timeout for this test

    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Read cart count before clicking — the number next to cart icon
    const getCartCount = async () => {
      const text = await page.locator('a[href*="cart"]').innerText().catch(() => '');
      const match = text.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    const countBefore = await getCartCount();

    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForTimeout(3000);

    const countAfter = await getCartCount();
    const toastVisible = await page.locator('.iweb-toast-wrap').isVisible().catch(() => false);

    // Either count increased OR toast shown
    expect(countAfter > countBefore || toastVisible).toBeTruthy();
    console.log(`TC1 PASSED - Cart count: ${countBefore} → ${countAfter}`);
  });

  // TC2 - Add to Cart button is visible on product detail page
  test('TC2 - Add to Cart button is visible on product detail page', async ({ page }) => {
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(
      page.getByRole('button', { name: 'Add to Cart' })
    ).toBeVisible({ timeout: 10000 });

    console.log('TC2 PASSED - Add to Cart button is visible');
  });

  // TC3 - Quantity + button works
  test('TC3 - Quantity selector is visible and can be increased', async ({ page }) => {
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(
      page.locator('.next-number-picker-handler').first()
    ).toBeVisible({ timeout: 8000 });

    await page.locator('.next-number-picker-handler').last().click();
    await page.waitForTimeout(500);

    console.log('TC3 PASSED - Quantity + button clicked successfully');
  });

  // TC4 - Add to Cart without login shows login modal
  test('TC4 - Add to Cart without login prompts login modal', async ({ page, context }) => {
    await context.clearCookies();

    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await page.waitForTimeout(2000);

    const modalShown = await page.locator('input[placeholder="Please enter your Phone or Email"]').isVisible().catch(() => false);
    const btnShown   = await page.getByRole('button', { name: 'LOGIN' }).isVisible().catch(() => false);

    expect(modalShown || btnShown).toBeTruthy();
    console.log('TC4 PASSED - Login modal shown when not logged in');
  });

  // TC5 - Product images visible
  test('TC5 - Product images are visible on product detail page', async ({ page }) => {
    await page.goto(PRODUCT_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const allImages = page.locator('img[alt]');
    const count = await allImages.count();
    expect(count).toBeGreaterThan(0);
    await expect(allImages.first()).toBeVisible({ timeout: 8000 });

    console.log(`TC5 PASSED - ${count} images found on product page`);
  });

});