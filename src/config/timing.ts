/**
 * Single source for per-wait timeout overrides (ms). The global budget lives
 * in playwright.config.ts (timeout / expect / actionTimeout); these are the
 * waits that intentionally deviate because the SPA is slow at that spot.
 * Named by purpose, not by value.
 */
export const timing = {
  /** Search submit reflected in the /search/<slug> route. */
  searchSubmit: 60_000,
  /** Autocomplete options appearing, and the field syncing after the dialog closes. */
  searchWidget: 15_000,
  /** Filtered search reflected in the results URL. */
  filteredResults: 30_000,
  /** Initial "Showing X out of Y Properties" summary on a fresh search. */
  resultsSummary: 90_000,
  /** One slider drag settling onto its price bucket. */
  sliderSettle: 5_000,
  /** Google Map canvas appearing after the view switch. */
  mapVisible: 30_000,
  /** Marker set reaching two consecutive identical reads. */
  markersSettle: 15_000,
  /** Hotel card popup after a pin click. */
  hotelCard: 20_000,
  /** A single-date dialog closing itself after a pick. */
  dialogAutoClose: 3_000,
  /** The Map/List toggle switch confirmed by charger rows rendering. */
  viewSwitch: 5_000,
  /** One retry round of opening a charger detail inside the retry loop. */
  detailOpen: 10_000,
  /** A target=_blank footer link opening its popup. */
  popupRedirect: 10_000,
} as const;
