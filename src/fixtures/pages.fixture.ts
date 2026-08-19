import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { HotelsHomePage } from '../pages/HotelsHomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

/** Every test receives ready-built page objects — no construction boilerplate. */
export interface PageObjects {
  homePage: HomePage;
  hotelsPage: HotelsHomePage;
  resultsPage: SearchResultsPage;
}

export const test = base.extend<PageObjects>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  hotelsPage: async ({ page }, use) => use(new HotelsHomePage(page)),
  resultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
});

export { expect } from '@playwright/test';
