import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { carRentalFlow } from '../src/flows/booking.flows';

test.describe('Simplenight Car Rental booking', () => {
  test('search Miami rentals and land on the category results', { tag: '@e2e' }, async ({
    page,
  }) => {
    await runBookingJourney(page, carRentalFlow);
  });
});
