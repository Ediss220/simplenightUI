/**
 * Test data for the automated booking flow — every business input lives here,
 * tests only orchestrate. Adding another category's flow means adding data +
 * a page object, not editing test logic.
 */
export const categories = [
  'Things To Do',
  'EV Charging',
  'Hotels',
  'Flights',
  'Car Rental',
  'Transportation',
  'Shows & Events',
  'Dining',
  'Parking',
] as const;

export type Category = (typeof categories)[number];

export const hotelBooking = {
  category: 'Hotels' as Category,

  location: {
    query: 'Miami',
    option: 'Miami, FL, USA', // substring of the autocomplete option to pick
  },

  /**
   * Month is 1-based (8 = August). Concrete years resolve to the next upcoming
   * occurrence (see src/utils/dates.ts), keeping the suite runnable year-round.
   */
  stay: { month: 8, checkInDay: 1, checkOutDay: 3 },

  guests: {
    adults: 1,
    childrenAges: [8], // assignment: 1 Adult + 1 Child, any valid age
  },

  filters: {
    priceMin: 100,
    /** Slider maximum — renders as the open-ended "1000+" cap, so no upper bound is asserted. */
    priceMax: 1000,
    guestScore: {
      band: 'Very Good',
      minimum: 7,
      urlToken: 'ratings=7', // URL reflects the applied filter, used as a sync point
    },
  },
} as const;
