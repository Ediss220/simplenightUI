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

export const thingsToDoBooking = {
  category: 'Things To Do' as Category,
  location: { query: 'New York', option: 'New York, NY, USA' },
  stay: { month: 9, checkInDay: 1, checkOutDay: 3 },
  filters: {
    freeCancellation: true,
  },
  /** 1-based position in the results list to open after filtering. */
  selection: { listPosition: 3 },
} as const;

export const evChargingBooking = {
  category: 'EV Charging' as Category,
  location: { query: 'Wayne', option: 'Wayne, NJ, USA' },
  /** 1-based position in the charger list to open after the map zoom. */
  selection: { listPosition: 1 },
} as const;

export const flightsBooking = {
  category: 'Flights' as Category,
  origin: { query: 'JFK', option: 'John F. Kennedy' },
  destination: { query: 'MIA', option: 'Miami International' },
  stay: { month: 9, departDay: 15, returnDay: 18 },
} as const;

export const carRentalBooking = {
  category: 'Car Rental' as Category,
  // The widget's place options are airport-first, unlike the city options
  // the Hotels/Things To Do dialogs resolve to.
  location: { query: 'Miami', option: 'Miami International Airport' },
} as const;
export const transportationBooking = {
  category: 'Transportation' as Category,
  // A transfer needs distinct endpoints — Pick-Up == Drop-Off never submits.
  pickUp: { query: 'Miami', option: 'Miami International Airport' },
  dropOff: { query: 'Miami Beach', option: 'Miami Beach' },
  // The widget never binds its default date — one must be picked explicitly.
  pickUpDate: { month: 9, day: 20 },
} as const;

export const showsEventsBooking = {
  category: 'Shows & Events' as Category,
  location: { query: 'Miami', option: 'Miami, FL, USA' },
} as const;

export const diningBooking = {
  category: 'Dining' as Category,
  location: { query: 'Miami', option: 'Miami, FL, USA' },
  // The widget defaults to *tonight*, which is routinely sold out.
  dinnerDate: { month: 9, day: 15 },
} as const;

export const parkingBooking = {
  category: 'Parking' as Category,
  location: { query: 'Miami', option: 'Miami International Airport' },
  // The default single "Aug 19" leaves Departure Time invalid ("Invalid
  // time") — the widget needs a real arrival → departure range to submit.
  stay: { month: 9, arrivalDay: 15, departureDay: 18 },
} as const;
export const siteChromeData = {
  currency: { code: 'EUR', symbol: '€' },
  language: { name: 'Español', translatedNavLink: 'Hoteles' },
  /** Header links navigate in place to their routes. */
  headerLinks: [
    { name: 'Sign In', path: '/login' },
    { name: 'Create an Account', path: '/register' },
    { name: 'Cart', path: '/cart' },
  ],
  /** Footer legal links open in target="_blank" popups. */
  legalLinks: [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'ADA Disclosure', path: '/ada-disclosure' },
  ],
  /** Header utility buttons and the key texts their overlays must show. */
  utilityDialogs: [
    { button: 'Order Lookup', texts: ['Order Number'] },
    { button: 'Support', texts: ['Support Center', 'customersupport@simplenight.com'] },
  ],
  footerLinks: [
    { name: 'support e-mail', href: 'mailto:customersupport@simplenight.com' },
    { name: 'support phone', href: 'tel:+18002164122' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'ADA Disclosure', href: '/ada-disclosure' },
    { name: 'X/Twitter', href: 'https://twitter.com/simplenight' },
    { name: 'Facebook', href: 'https://facebook.com/simplenight' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/simplenight' },
  ],
} as const;
