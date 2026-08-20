import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { flightsFlow } from '../src/flows/booking.flows';

test.describe('Simplenight Flights booking', () => {
  test('search JFK→MIA roundtrip and land on the category results', { tag: '@e2e' }, async ({
    page,
  }) => {
    await runBookingJourney(page, flightsFlow);
  });
});
