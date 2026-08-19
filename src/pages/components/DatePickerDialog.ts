import { expect, type Locator, type Page } from '@playwright/test';
import { LOCALE } from '../../config/locale';
import { nightsBetween } from '../../utils/dates';

/**
 * Range calendar (Mantine) opened in a modal dialog from the "Dates" field.
 *
 * The field is pre-filled by the site with a default range ([today, tomorrow])
 * and clicks resolve relative to the current range:
 *   - a day after the current end moves only the end (start is kept);
 *   - the current end re-anchors the range on that day (+1 night).
 * Selecting check-in twice collapses any starting state to [checkIn, +1 night],
 * after which one more click sets the check-out — deterministic for any target.
 *
 * Also handles year hops — "August 23" may resolve to next year — and the
 * duplicate hidden day cells the dialog keeps for the adjacent month.
 */
export class DatePickerDialog {
  constructor(private readonly page: Page) {}

  private get dialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * Header of the first calendar panel, e.g. "August 2026" — the calendar is
   * dual-month, so the second panel's header must not compete for the click.
   * Clicking it opens the year/month view.
   */
  private get monthHeader(): Locator {
    return this.dialog
      .getByRole('button', { name: /^[A-Z][a-z]+ \d{4}$/ })
      .first();
  }

  /** Selects a check-in → check-out range and closes the dialog. */
  async selectRange(checkIn: Date, checkOut: Date): Promise<void> {
    await this.openMonth(checkIn);
    await this.pickDay(checkIn); // may only move the end of the default range
    await this.pickDay(checkIn); // re-anchors the range on the check-in day
    if (nightsBetween(checkIn, checkOut) > 1) {
      await this.pickDay(checkOut);
    }
    await this.done();
  }

  private async done(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(this.dialog).toBeHidden();
  }

  /** Navigates the year/month view until the check-in's month is displayed. */
  private async openMonth(target: Date): Promise<void> {
    await expect(this.monthHeader).toBeVisible();
    await this.monthHeader.click();

    const yearButton = this.dialog.getByRole('button', {
      name: String(target.getFullYear()),
      exact: true,
    });
    await expect(yearButton).toBeVisible();

    // The year view shows two panels ("2026", "2027") each with its own month grid.
    const yearPanel = yearButton.locator('xpath=../..');
    const monthButton = yearPanel.getByRole('button', {
      name: target.toLocaleDateString(LOCALE, { month: 'short' }),
      exact: true,
    });
    await monthButton.click();
  }

  private async pickDay(date: Date): Promise<void> {
    const label = `${date.getDate()} ${date.toLocaleDateString(LOCALE, { month: 'long' })} ${date.getFullYear()}`;
    const day = this.dialog
      .getByRole('button', { name: label, exact: true })
      .filter({ visible: true })
      .first();
    await expect(day).toBeVisible();
    await day.click();
  }
}
