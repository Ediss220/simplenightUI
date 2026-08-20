import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { thingsToDoBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface ThingsToDoCriteria {
  location: LocationQuery;
  checkIn: Date;
  checkOut: Date;
}

/**
 * /home/things-to-do — location + explicit date range; the Activities results
 * it lands on are filtered further by ThingsToDoResultsPage.
 */
export class ThingsToDoHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<ThingsToDoCriteria>
{
  readonly slug = categorySlug(thingsToDoBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    // Things To Do is the landing default: its navbar link may keep the current
    // route, so the widget's own field proves the category is mounted.
    await expect(this.field('Location')).toBeVisible();
  }

  async fillCriteria({ location, checkIn, checkOut }: ThingsToDoCriteria): Promise<void> {
    await this.chooseLocation('Location', location);
    await this.pickDateRange('Dates', checkIn, checkOut);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
