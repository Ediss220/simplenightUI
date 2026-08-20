import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { categories } from '../src/data/booking.data';

test.describe('homepage', () => {
  test('landing shows the brand promise heading', { tag: '@smoke' }, async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.expectBrandHeading();
  });

  test('navbar exposes every booking category', { tag: '@e2e' }, async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.expectLoaded();
    for (const category of categories) {
      await expect(homePage.categoryLink(category)).toBeVisible();
    }
  });
});
