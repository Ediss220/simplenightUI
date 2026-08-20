import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { LocationQuery } from './contracts';
import { DatePickerDialog } from './components/DatePickerDialog';
import { GuestSelectorDialog } from './components/GuestSelectorDialog';
import { timing } from '../config/timing';

/**
 * Shared search-widget behaviour. Every category page opens the same Mantine
 * dialogs for destination autocompletion and date picking — only the field's
 * accessible name differs, so the interaction lives here once.
 */
export abstract class SearchWidgetPage extends BasePage {
  protected readonly datePicker = new DatePickerDialog(this.page);
  protected readonly guestSelector = new GuestSelectorDialog(this.page);
  /** This category's route slug, derived from its data entry — the single
   * source for the search route, the results route and the navbar path. */
  protected abstract readonly slug: string;


  /** A widget input by its accessible name (the Mantine label), exact match. */
  protected field(name: string): Locator {
    return this.page.getByRole('textbox', { name, exact: true });
  }

  protected searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search', exact: true });
  }

  /** Generic "the widget rendered" check; category pages add their own fields. */
  protected async expectWidgetLoaded(): Promise<void> {
    await expect(this.searchButton()).toBeVisible();
  }

  /**
   * Types a destination query and picks the matching autocomplete option.
   * The dialog is shared; `fieldName` is the widget field that opens it.
   */
  protected async chooseLocation(fieldName: string, { query, option }: LocationQuery): Promise<void> {
    const field = this.field(fieldName);
    await field.click();

    const input = this.dialog.getByRole('textbox').first();
    await expect(input).toBeVisible();
    await input.fill(query);

    const match = this.dialog.getByRole('option').filter({ hasText: option }).first();
    await expect(match).toBeVisible({ timeout: timing.searchWidget });
    await match.click();
    await expect(this.dialog).toBeHidden();
    await expect(field).not.toHaveValue('');
  }

  /** Opens a date field and selects a check-in → check-out range. */
  protected async pickDateRange(fieldName: string, checkIn: Date, checkOut: Date): Promise<void> {
    await this.field(fieldName).click();
    await this.datePicker.selectRange(checkIn, checkOut);
  }

  /** Opens a date field and selects a single day (dining, parking pick-ups). */
  protected async pickSingleDate(fieldName: string, date: Date): Promise<void> {
    await this.field(fieldName).click();
    await this.datePicker.selectSingle(date);
  }

  /** Clicks Search and waits for this category's /search/<slug> route. */
  protected async submitSearch(): Promise<void> {
    await this.searchButton().click();
    await this.page.waitForURL(new RegExp(`/search/${this.slug}\\?`), {
      timeout: timing.searchSubmit,
    });
  }
}
