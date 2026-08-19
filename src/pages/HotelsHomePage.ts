import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { DatePickerDialog } from './components/DatePickerDialog';
import {
  GuestSelectorDialog,
  type GuestSelection,
} from './components/GuestSelectorDialog';

/**
 * /home/hotels — the category landing page with the search widget
 * (destination, dates, travelers). The same widget pattern backs the other
 * category pages, so this object is the template for extending to them.
 */
export class HotelsHomePage extends BasePage {
  private readonly datePicker = new DatePickerDialog(this.page);
  private readonly guestSelector = new GuestSelectorDialog(this.page);

  private readonly destinationField = this.page.getByRole('textbox', { name: 'Going to' });
  private readonly datesField = this.page.getByPlaceholder('Select your dates');
  private readonly travelersField = this.page.getByPlaceholder('How many guests?');
  private readonly searchButton = this.page.getByRole('button', {
    name: 'Search',
    exact: true,
  });

  async expectLoaded(): Promise<void> {
    await expect(this.searchButton).toBeVisible();
  }

  /** Types the destination query and picks the matching autocomplete option. */
  async searchLocation(query: string, optionText: string): Promise<void> {
    await this.destinationField.click();
    const dialogInput = this.dialog.getByRole('textbox');
    await expect(dialogInput).toBeVisible();
    await dialogInput.fill(query);

    const option = this.dialog.getByRole('option').filter({ hasText: optionText }).first();
    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
    await expect(this.dialog).toBeHidden();
    await expect(this.destinationField).toHaveValue(query, { timeout: 15_000 });
  }

  async setStayDates(checkIn: Date, checkOut: Date): Promise<void> {
    await this.datesField.click();
    await this.datePicker.selectRange(checkIn, checkOut);
    const short = (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    await expect(this.datesField).toHaveValue(`${short(checkIn)} - ${short(checkOut)}`);
  }

  async setGuests(guests: GuestSelection): Promise<void> {
    await this.travelersField.click();
    await expect(this.dialog).toBeVisible();
    await this.guestSelector.apply(guests);
    await this.page.keyboard.press('Escape');
    await expect(this.dialog).toBeHidden();

    const total = guests.adults + guests.childrenAges.length;
    await expect(this.travelersField).toHaveValue(`1 Room, ${total} Guest${total > 1 ? 's' : ''}`);
  }

  /** Submits the search and waits for the results route. */
  async search(): Promise<void> {
    await this.searchButton.click();
    await this.page.waitForURL(/\/search\/hotels\?/);
  }
}
