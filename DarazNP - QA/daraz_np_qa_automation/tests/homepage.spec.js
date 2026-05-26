const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.daraz.com.np';

test.describe('TS 005 - Home Page Functionality', () => {

  // TC1 - Homepage loads successfully
  test('TC1 - Homepage loads within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(
      page.locator('input[placeholder="Search in Daraz"]')
    ).toBeVisible({ timeout: 10000 });

    await expect(page).toHaveTitle(
      'Online Shopping in Nepal: Best Deals, Prices & Discounts - Daraz.com.np',
      { timeout: 5000 }
    );

    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);

    console.log(`TC1 PASSED - Homepage loaded in ${loadTime}ms`);
  });

  // TC2 - Categories dropdown works
  test('TC2 - Categories dropdown opens and shows category links', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.getByText('Categories').click();
    await page.waitForTimeout(1500);

    const dropdownLinks = page.locator(
      '[class*="dropdown"] a, [class*="category"] a, [class*="Categories"] a, nav ul a'
    );

    await expect(dropdownLinks.first()).toBeVisible({ timeout: 5000 });
    const count = await dropdownLinks.count();
    expect(count).toBeGreaterThan(2);

    console.log(`TC2 PASSED - Categories dropdown opened with ${count} links`);
  });

  // TC3 - Clicking a category navigates correctly
  test('TC3 - Clicking a category navigates to correct page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.getByText('Categories').click();
    await page.waitForTimeout(1500);

    const dropdownLinks = page.locator(
      '[class*="dropdown"] a, [class*="category"] a, [class*="Categories"] a'
    );
    await dropdownLinks.first().click();

    await expect(page).not.toHaveURL('https://www.daraz.com.np/', { timeout: 8000 });

    console.log('TC3 PASSED - Category click navigated away from homepage');
  });

  // TC4 - Banner carousel arrows work
  test('TC4 - Homepage banner carousel is visible and navigable', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.swiper-button-prev').first())
      .toBeVisible({ timeout: 8000 });
    await expect(page.locator('.swiper-button-next').first())
      .toBeVisible({ timeout: 8000 });

    await page.locator('.swiper-button-next').first().click();
    await page.waitForTimeout(1000);
    await page.locator('.swiper-button-prev').first().click();
    await page.waitForTimeout(1000);

    console.log('TC4 PASSED - Banner carousel arrows work correctly');
  });

  // TC5 - Flash sale product cards are visible and clickable
  test('TC5 - Featured product cards display and are clickable', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // From error context: flash sale products use href="//www.daraz.com.np/products/..."
    const productCard = page.locator('a[href*="/products/"]').first();

    await expect(productCard).toBeVisible({ timeout: 8000 });
    const productName = await productCard.getAttribute('aria-label')
      .catch(() => 'product');
    await productCard.click();

    // After clicking a product, URL should contain /products/
    await expect(page).toHaveURL(/products/, { timeout: 8000 });

    console.log(`TC5 PASSED - Product card navigated to product page`);
  });

  // TC6 - Featured category links work
  test('TC6 - Homepage category links are visible and clickable', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const categoryLink = page.locator('a[href*="up_id"]').first();

    await expect(categoryLink).toBeVisible({ timeout: 8000 });
    const linkText = await categoryLink.innerText();
    await categoryLink.click();

    await expect(page).not.toHaveURL(BASE_URL, { timeout: 8000 });

    console.log(`TC6 PASSED - Category link "${linkText.trim()}" navigated correctly`);
  });

  // TC7 - Footer links visible
  test('TC7 - Footer is visible with key links', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    await expect(page.getByRole('link', { name: 'About Daraz' }))
      .toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('link', { name: 'Help Center' }))
      .toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact Us' }))
      .toBeVisible();

    console.log('TC7 PASSED - Footer is visible with key links');
  });

});