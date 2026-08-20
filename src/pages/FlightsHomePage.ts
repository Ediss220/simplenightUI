import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { flightsBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface FlightsCriteria {
  origin: LocationQuery;
  destination: LocationQuery;
  /** Roundtrip (the widget default): depart and return days. */
  checkIn: Date;
  checkOut: Date;
}

/**
 * /home/flights — airports via the shared autocomplete (JFK/MIA style options)
 * plus explicit dates: without them the widget refuses to submit.
 */
export class FlightsHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<FlightsCriteria>
{
  readonly slug = categorySlug(flightsBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Leaving from')).toBeVisible();
  }

  async fillCriteria({ origin, destination, checkIn, checkOut }: FlightsCriteria): Promise<void> {
    await this.chooseLocation('Leaving from', origin);
    await this.chooseLocation('Going to', destination);
    await this.pickDateRange('Dates', checkIn, checkOut);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
