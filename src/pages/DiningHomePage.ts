import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { diningBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface DiningCriteria {
  location: LocationQuery;
  /** Dinner date: the widget defaults to *tonight*, which is usually sold out. */
  date: Date;
}

/** /home/dining — location + a future dinner date; party size defaults to 2. */
export class DiningHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<DiningCriteria>
{
  readonly slug = categorySlug(diningBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Location')).toBeVisible();
  }

  async fillCriteria({ location, date }: DiningCriteria): Promise<void> {
    await this.chooseLocation('Location', location);
    await this.pickSingleDate('Date', date);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
