import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Category } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

/**
 * Landing page. Category navigation is data-driven: any navbar category can be
 * selected without adding page objects for each.
 */
export class HomePage extends BasePage {
  /** The header has its own nav; category links live in the main-content nav. */
  private readonly navbar = this.page.getByRole('main').locator('nav');

  categoryLink(name: Category | string): Locator {
    return this.navbar.getByRole('link', { name, exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  /** The landing brand promise — the smoke-test observable. */
  async expectBrandHeading(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { level: 1, name: 'Book Everything, Anywhere.®' }),
    ).toBeVisible();
  }

  /**
   * Selects a booking category in the navbar, e.g. "Hotels" -> /home/hotels.
   * `expectedPath` overrides the route for categories whose link keeps the
   * current page (Things To Do is the landing default and stays on "/").
   */
  async selectCategory(name: Category | string, expectedPath?: string): Promise<void> {
    const link = this.categoryLink(name);
    await expect(link).toBeVisible();
    await link.click();
    const path = expectedPath ?? `/home/${categorySlug(name)}`;
    await this.page.waitForURL((url) => url.pathname === path);
  }
}
