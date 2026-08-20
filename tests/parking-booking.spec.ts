import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { parkingFlow } from '../src/flows/booking.flows';

test.describe('Simplenight Parking booking', () => {
  test('search airport parking and land on the category results', { tag: '@e2e' }, async ({
    page,
  }) => {
    await runBookingJourney(page, parkingFlow);
  });
});
