import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { thingsToDoFlow } from '../src/flows/booking.flows';
import { ThingsToDoResultsPage } from '../src/pages/ThingsToDoResultsPage';
import { thingsToDoBooking } from '../src/data/booking.data';

test.describe('Simplenight Things To Do booking', () => {
  test('search New York activities, filter, and open the 3rd list result', { tag: '@e2e' }, async ({
    page,
  }) => {
    // New York · Sep 1–3 → Activities results
    await runBookingJourney(page, thingsToDoFlow);

    // Free Cancellation only, then List view (not Grid) and the 3rd activity.
    const { filters, selection } = thingsToDoBooking;
    const results = new ThingsToDoResultsPage(page);
    await results.applyFreeCancellation();
    await results.switchToListView();
    await results.openListItem(selection.listPosition);
  });
});
