import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { evChargingBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface EvChargingCriteria {
  location: LocationQuery;
}

/** /home/ev-charging — location-only search for nearby chargers. */
export class EvChargingHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<EvChargingCriteria>
{
  readonly slug = categorySlug(evChargingBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Location')).toBeVisible();
  }

  async fillCriteria({ location }: EvChargingCriteria): Promise<void> {
    await this.chooseLocation('Location', location);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
