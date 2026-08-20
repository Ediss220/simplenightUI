import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { showsEventsBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface ShowsEventsCriteria {
  location: LocationQuery;
}

/** /home/shows-events — location + date range (defaults kept); keyword optional. */
export class ShowsEventsHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<ShowsEventsCriteria>
{
  readonly slug = categorySlug(showsEventsBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Location')).toBeVisible();
  }

  async fillCriteria({ location }: ShowsEventsCriteria): Promise<void> {
    await this.chooseLocation('Location', location);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
