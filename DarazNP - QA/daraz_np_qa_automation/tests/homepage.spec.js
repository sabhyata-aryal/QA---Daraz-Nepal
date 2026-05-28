const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.daraz.com.np';

test.describe('TS 005 - Home Page Functionality', () => {

  test('TC1 - Homepage loads within acceptable time', async ({ page }) => {

    const start = Date.now();

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    await expect(
      page.locator('input[placeholder="Search in Daraz"]')
    ).toBeVisible();

    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(30000);

    console.log(`TC1 PASSED - Homepage loaded in ${loadTime} ms`);
  });

  test('TC2 - Homepage category links are visible', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    const count = await page.getByRole('link').count();

    expect(count).toBeGreaterThan(20);

    console.log(`TC2 PASSED - ${count} links found`);
  });

  test('TC3 - Clicking a category navigates correctly', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    const categoryLink = page
      .getByRole('link')
      .filter({
        hasText: /Fashion|Groceries|Electronic|Mobile|Beauty|Health|Home/i
      })
      .filter({ hasNotText: /Login|Sign Up|Seller|Help/i })
      .first();

    await expect(categoryLink).toBeVisible({
      timeout: 20000
    });

    const categoryText = await categoryLink.innerText();

    await categoryLink.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Verify URL changed
    await expect(page).not.toHaveURL(BASE_URL);

    console.log(`TC3 PASSED - ${categoryText} opened successfully`);
  });

  test('TC4 - Homepage banner carousel is visible and navigable', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    const nextBtn = page.locator('.swiper-button-next').first();

    const prevBtn = page.locator('.swiper-button-prev').first();

    await expect(nextBtn).toBeVisible();

    await expect(prevBtn).toBeVisible();

    await nextBtn.click();

    await page.waitForTimeout(1000);

    await prevBtn.click();

    console.log('TC4 PASSED - Carousel works');
  });

  test('TC5 - Featured product cards display and are clickable', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    const productCard = page
      .locator('a[href*="/products/"]')
      .first();

    await expect(productCard).toBeVisible({
      timeout: 15000
    });

    await productCard.click();

    await expect(page).toHaveURL(/products/);

    console.log('TC5 PASSED - Product card clickable');
  });

  test('TC6 - Homepage category links are clickable', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    const categoryLink = page
      .getByRole('link')
      .filter({
        hasText: /Fashion|Groceries|Electronic|Mobile|Beauty|Health|Home/i
      })
      .filter({ hasNotText: /Login|Sign Up|Seller|Help/i })
      .first();

    await expect(categoryLink).toBeVisible({
      timeout: 20000
    });

    const text = await categoryLink.innerText();

    await categoryLink.click();

    await expect(page).not.toHaveURL(BASE_URL);

    console.log(`TC6 PASSED - ${text.trim()} clicked`);
  });

  test('TC7 - Footer is visible with key links', async ({ page }) => {

    await page.goto(BASE_URL, {
      waitUntil: 'networkidle'
    });

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await expect(
      page.getByRole('link', { name: /About Daraz/i })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /Help Center/i })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /Contact Us/i })
    ).toBeVisible();

    console.log('TC7 PASSED - Footer visible');
  });

});