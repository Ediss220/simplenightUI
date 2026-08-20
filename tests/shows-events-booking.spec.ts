import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { showsEventsFlow } from '../src/flows/booking.flows';

test.describe('Simplenight Shows & Events booking', () => {
  test('search Miami shows and land on the category results', { tag: '@e2e' }, async ({ page }) => {
    await runBookingJourney(page, showsEventsFlow);
  });
});
