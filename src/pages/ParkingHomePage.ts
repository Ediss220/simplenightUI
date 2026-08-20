import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { parkingBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface ParkingCriteria {
  location: LocationQuery;
  /** Arrival → departure: without a range the widget's Departure Time stays
   * "Invalid time" and Search never submits. */
  checkIn: Date;
  checkOut: Date;
}

/** /home/parking — airport parking: destination + arrival/departure range. */
export class ParkingHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<ParkingCriteria>
{
  readonly slug = categorySlug(parkingBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Going to')).toBeVisible();
  }

  async fillCriteria({ location, checkIn, checkOut }: ParkingCriteria): Promise<void> {
    await this.chooseLocation('Going to', location);
    await this.pickDateRange('Dates', checkIn, checkOut);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
