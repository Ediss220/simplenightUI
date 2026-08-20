import { expect } from '@playwright/test';
import { CategoryResultsPage } from './CategoryResultsPage';
import { timing } from '../config/timing';
import { thingsToDoBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

/**
 * /search/things-to-do — the Activities results with their filter rail and
 * view switcher.
 */
export class ThingsToDoResultsPage extends CategoryResultsPage {
  constructor(page: ConstructorParameters<typeof CategoryResultsPage>[0]) {
    super(page, { slug: categorySlug(thingsToDoBooking.category), noun: 'Activities' });
  }

  private get summary() {
    return this.page.getByText(/Showing \d+ out of \d+ Activities/).first();
  }

  /**
   * Checks the rail's "Free Cancellation" filter (the result cards carry
   * similar badges, so the checkbox is scoped to the filter form).
   * Sync point: the URL gains `free_cancellation=true`.
   */
  async applyFreeCancellation(): Promise<void> {
    const label = this.page
      .locator('form label')
      .filter({ hasText: /^Free Cancellation$/ })
      .first();
    await label.click();
    await this.page.waitForURL(/free_cancellation=true/, {
      timeout: timing.filteredResults,
    });
    await expect(this.summary).toBeVisible({ timeout: timing.resultsSummary });
  }

  /** Switches the results rendering to rows (the default Grid shows tiles). */
  async switchToListView(): Promise<void> {
    const listToggle = this.page.getByRole('radio', { name: 'List', exact: true });
    await listToggle.click();
    await expect(listToggle).toBeChecked();
  }

  /**
   * Opens the activity card at `position` (1-based) in the current view and
   * waits for its detail page route.
   */
  async openListItem(position: number): Promise<void> {
    const card = this.page.locator('main article').nth(position - 1);
    await expect(card).toBeVisible();
    // Filtered list cards lead with non-navigating links (policy, tags) —
    // target the details route itself.
    await card.locator('a[href*="/details/things-to-do/"]').first().click();
    await this.page.waitForURL(/\/details\/things-to-do\//, { timeout: timing.searchSubmit });
  }
}
