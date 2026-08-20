import { expect } from '@playwright/test';
import { SearchWidgetPage } from './SearchWidgetPage';
import type { CategorySearchPage, LocationQuery } from './contracts';
import { carRentalBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

export interface CarRentalCriteria {
  location: LocationQuery;
}

/**
 * /home/car-rental — one combined Pick-Up/Drop-Off field (same location both
 * ways unless "different location" is checked); default rental dates are kept.
 */
export class CarRentalHomePage
  extends SearchWidgetPage
  implements CategorySearchPage<CarRentalCriteria>
{
  readonly slug = categorySlug(carRentalBooking.category);

  async expectLoaded(): Promise<void> {
    await this.expectWidgetLoaded();
    await expect(this.field('Pick-Up/Drop-Off')).toBeVisible();
  }

  async fillCriteria({ location }: CarRentalCriteria): Promise<void> {
    await this.chooseLocation('Pick-Up/Drop-Off', location);
  }

  async submit(): Promise<void> {
    await this.submitSearch();
  }
}
