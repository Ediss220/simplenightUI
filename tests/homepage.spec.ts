import { test, expect } from '../src/fixtures/pages.fixture';
import { categories } from '../src/data/booking.data';

test.describe('homepage', () => {
  test('navbar exposes every booking category', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectLoaded();
    for (const category of categories) {
      await expect(homePage.categoryLink(category)).toBeVisible();
    }
  });
});
