import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { transportationBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface TransportationCriteria {
  pickUp: LocationQuery;
  dropOff: LocationQuery;
  /**
   * Transfer date, picked explicitly: the widget shows a default date but
   * never binds it, and Search silently does nothing until one is chosen.
   */
  date: Date;
}

/**
 * /home/transportation — requires BOTH addresses (with only Pick-Up filled it
 * blocks submit with "Select drop-off location") and an explicitly picked
 * transfer date.
 */
export class TransportationHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<TransportationCriteria>
{
  readonly slug = categorySlug(transportationBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Pick-Up').first()).toBeVisible();
  }

  async fillCriteria({ pickUp, dropOff, date }: TransportationCriteria): Promise<void> {
    await this.chooseLocation('Pick-Up', pickUp);
    await this.chooseLocation('Drop-Off', dropOff);
    await this.pickSingleDate('Pick-Up Date', date);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
