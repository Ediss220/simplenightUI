import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { diningFlow } from '../src/flows/booking.flows';

test.describe('Simplenight Dining booking', () => {
  test('search Miami restaurants and land on the category results', { tag: '@e2e' }, async ({
    page,
  }) => {
    await runBookingJourney(page, diningFlow);
  });
});
