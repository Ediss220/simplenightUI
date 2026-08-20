import { test } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { evChargingFlow } from '../src/flows/booking.flows';
import { EvChargingResultsPage } from '../src/pages/EvChargingResultsPage';
import { evChargingBooking } from '../src/data/booking.data';

test.describe('Simplenight EV Charging booking', () => {
  test('search Wayne NJ chargers, zoom the map, and open the first one', { tag: '@e2e' }, async ({
    page,
  }) => {
    // Wayne, NJ → charger results over a map
    await runBookingJourney(page, evChargingFlow);

    // Zoom in on the map, then take the first charger from the list. The
    // detail page must open with the station name as a heading.
    const results = new EvChargingResultsPage(page);
    await results.zoomInMap();
    await results.openListItem(evChargingBooking.selection.listPosition);
  });
});
