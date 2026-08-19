import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Category } from '../data/booking.data';

/** "Things To Do" -> "things-to-do", "Shows & Events" -> "shows-events". */
const categorySlug = (name: string): string =>
  name.toLowerCase().replace(/\s*&\s*/g, '').replace(/\s+/g, '-');

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

  /** Selects a booking category in the navbar, e.g. "Hotels" -> /home/hotels. */
  async selectCategory(name: Category | string): Promise<void> {
    const link = this.categoryLink(name);
    await expect(link).toBeVisible();
    await link.click();
    await expect(this.page).toHaveURL(new RegExp(`/home/${categorySlug(name)}$`));
  }
}
