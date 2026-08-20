import type { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CategoryResultsPage } from '../pages/CategoryResultsPage';
import type { CategorySearchPage } from '../pages/contracts';
import type { Category } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

/**
 * Everything the generic journey needs to run one category end to end:
 * pick the category in the navbar, fill its widget, submit, land on results.
 */
export interface BookingFlow<C> {
  category: Category;
  criteria: C;
  searchPage: new (page: Page) => CategorySearchPage<C>;
  /**
   * The noun this category's "Showing X out of Y <noun>" summary counts,
   * e.g. "Properties" or "Activities". Omitted when the results page exposes
   * no such summary — then only the route is asserted. The route itself is
   * derived from the category name, never duplicated here.
   */
  resultsNoun?: string;
  /**
   * Route the navbar click must land on. Defaults to /home/<slug>; categories
   * that are the landing default (Things To Do) keep "/" instead.
   */
  categoryRoute?: string;
}

/** Type-preserving wrapper so heterogeneous flows share one registry type. */
export function defineFlow<C>(flow: BookingFlow<C>): BookingFlow<unknown> {
  return flow as BookingFlow<unknown>;
}

/**
 * Runs the shared part of every booking journey:
 * homepage → category → widget search → results route.
 */
export async function runBookingJourney(
  page: Page,
  flow: BookingFlow<unknown>,
): Promise<CategoryResultsPage> {
  const home = new HomePage(page);
  await home.open();
  await home.expectLoaded();
  await home.selectCategory(flow.category, flow.categoryRoute);

  const searchPage = new flow.searchPage(page);
  await searchPage.expectLoaded();
  await searchPage.fillCriteria(flow.criteria);
  await searchPage.submit();
  const results = new CategoryResultsPage(page, {
    slug: categorySlug(flow.category),
    noun: flow.resultsNoun,
  });
  await results.expectLoaded();
  return results;
}
