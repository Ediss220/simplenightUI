/** A destination autocomplete request: type `query`, pick the `option` text. */
export interface LocationQuery {
  query: string;
  /** Substring of the autocomplete option to pick, e.g. "Miami, FL, USA". */
  option: string;
}

/**
 * Contract every category landing page implements to be automatable:
 * load → fill the widget → submit and land on the results route.
 *
 * Adding a category = a page object implementing this + data + one registry
 * line in src/flows/booking.flows.ts — no orchestration changes anywhere.
 */
export interface CategorySearchPage<C> {
  /** Waits until the category's search widget is interactive. */
  expectLoaded(): Promise<void>;
  /** Fills every widget field the category requires. */
  fillCriteria(criteria: C): Promise<void>;
  /** Clicks Search and waits for the category's results route. */
  submit(): Promise<void>;
}
