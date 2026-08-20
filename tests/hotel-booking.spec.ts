import { test, expect } from '@playwright/test';
import { runBookingJourney } from '../src/flows/booking-flow';
import { hotelsFlow } from '../src/flows/booking.flows';
import { SearchResultsPage } from '../src/pages/SearchResultsPage';
import { hotelBooking } from '../src/data/booking.data';

test.describe('Simplenight hotel booking', () => {
  test(
    'search Miami hotels, filter, and validate the hotel selected from the map',
    { tag: '@e2e' },
    async ({ page }) => {
      // 1–3: staging homepage → Hotels → Miami · next August 1–3 · 1 Adult + 1 Child (8)
      await runBookingJourney(page, hotelsFlow);

      // 4. Map view for the results
      const resultsPage = new SearchResultsPage(page);
      await resultsPage.switchToMapView();

      // 5. Left-panel filters: price 100–"1000+" (open-ended) and guest score Very Good
      const { filters } = hotelBooking;
      const priceFloor = await resultsPage.applyPriceRange(filters.priceMin, filters.priceMax);
      await resultsPage.applyGuestScore(filters.guestScore);

      // 6. Zoom in until one hotel marker remains, then select it
      const marker = await resultsPage.map.zoomToSingleHotelMarker();
      await resultsPage.map.clickMarker(marker);
      const card = resultsPage.hotelCard();
      await card.expectVisible();

      // 7. The selected hotel's card must sit within the filtered parameters
      const details = await card.details();
      if (marker.accessible) {
        expect(details.name, 'the card belongs to the pin that was clicked').toContain(
          marker.label,
        );
      }
      expect(
        details.total,
        'total price respects the price filter (bucket floor may sit below the slider)',
      ).toBeGreaterThanOrEqual(priceFloor);
      expect(
        details.score,
        `guest score ${details.score} "${details.scoreLabel}" meets ${filters.guestScore.band} (${filters.guestScore.minimum}+)`,
      ).toBeGreaterThanOrEqual(filters.guestScore.minimum);
    },
  );
});
