import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { transportationFlow } from '../src/flows/booking.flows';

test.describe('Simplenight Transportation booking', () => {
  test('search an airport transfer and land on the category results', { tag: '@e2e' }, async ({
    page,
  }) => {
    await runBookingJourney(page, transportationFlow);
  });
});
