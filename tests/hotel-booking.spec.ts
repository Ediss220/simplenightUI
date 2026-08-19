import { test, expect } from '../src/fixtures/pages.fixture';
import { hotelBooking } from '../src/data/booking.data';
import { nextUpcoming } from '../src/utils/dates';

const { location, stay, guests, filters } = hotelBooking;
// "August 1-3" resolves to the next August the calendar still accepts.
const checkIn = nextUpcoming(stay.month, stay.checkInDay);
const checkOut = nextUpcoming(stay.month, stay.checkInDay, stay.checkOutDay - stay.checkInDay);

test.describe('Simplenight hotel booking', () => {
  test(
    'search Miami hotels, filter, and validate the hotel selected from the map',
    { tag: '@e2e' },
    async ({ homePage, hotelsPage, resultsPage }) => {
      // 1. Staging homepage
      await homePage.open();
      await homePage.expectLoaded();

      // 2. Hotels category from the navbar
      await homePage.selectCategory(hotelBooking.category);
      await hotelsPage.expectLoaded();

      // 3. Search in category: Miami · check-in → check-out · 1 Adult + 1 Child (8)
      await hotelsPage.searchLocation(location.query, location.option);
      await hotelsPage.setStayDates(checkIn, checkOut);
      await hotelsPage.setGuests(guests);
      await hotelsPage.search();
      await resultsPage.expectLoaded();

      // 4. Map view for the results
      await resultsPage.switchToMapView();

      // 5. Left-panel filters: price 100–"1000+" (open-ended) and guest score Very Good
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
