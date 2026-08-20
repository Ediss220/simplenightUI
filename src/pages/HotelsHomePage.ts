import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import type { GuestSelection } from './components/GuestSelectorDialog';
import { hotelBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';
import { timing } from '../config/timing';
import { LOCALE } from '../config/locale';

/** /home/hotels widget inputs, with concrete resolved dates. */
export interface HotelsCriteria {
  location: LocationQuery;
  checkIn: Date;
  checkOut: Date;
  guests: GuestSelection;
}

/**
 * /home/hotels — the reference CategorySearchPage. The granular methods stay
 * public: the deep e2e journey composes them, fillCriteria composes them for
 * the generic runner.
 */
export class HotelsHomePage extends SearchWidgetPage implements CategorySearchPage<HotelsCriteria> {
  readonly slug = categorySlug(hotelBooking.category);

  private readonly destinationField = this.field('Going to');
  private readonly datesField = this.page.getByPlaceholder('Select your dates');
  private readonly travelersField = this.page.getByPlaceholder('How many guests?');

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.destinationField).toBeVisible();
  }

  /** Types the destination query and picks the matching autocomplete option. */
  async searchLocation(query: string, optionText: string): Promise<void> {
    await this.chooseLocation('Going to', { query, option: optionText });
    await expect(this.destinationField).toHaveValue(query, { timeout: timing.searchWidget });
  }

  async setStayDates(checkIn: Date, checkOut: Date): Promise<void> {
    await this.datesField.click();
    await this.datePicker.selectRange(checkIn, checkOut);
    const short = (date: Date) =>
      date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' });
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

  async fillCriteria({ location, checkIn, checkOut, guests }: HotelsCriteria): Promise<void> {
    await this.searchLocation(location.query, location.option);
    await this.setStayDates(checkIn, checkOut);
    await this.setGuests(guests);
  }

  /** Submits the search and waits for the results route. */
  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
