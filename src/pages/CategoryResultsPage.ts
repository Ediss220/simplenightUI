import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { timing } from '../config/timing';

/** How to recognize one category's results page. */
export interface ResultsExpectation {
  /** Route under /search/, e.g. "hotels" for /search/hotels?... */
  slug: string;
  /**
   * The noun its "Showing X out of Y <noun>" summary counts, e.g.
   * "Properties" or "Activities". Omitted while a category's results page
   * exposes no such summary — then only the route is asserted.
   */
  noun?: string;
}

/** /search/<slug> — the results route every category search lands on. */
export class CategoryResultsPage extends BasePage {
  constructor(
    page: Page,
    private readonly expectation: ResultsExpectation,
  ) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/search/${this.expectation.slug}\\?`));
    if (this.expectation.noun) {
      const summary = this.page.getByText(
        new RegExp(`Showing \\d+ out of \\d+ ${this.expectation.noun}`),
      );
      await expect(summary).toBeVisible({ timeout: timing.resultsSummary });
    }
  }
}
