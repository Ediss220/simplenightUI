import { test } from '@playwright/test';
import { SiteChrome } from '../src/pages/SiteChrome';
import { siteChromeData } from '../src/data/booking.data';

const { currency, language, headerLinks, legalLinks, footerLinks } = siteChromeData;

test.describe('site chrome', () => {
  test('switching the currency to EUR reprices the site', { tag: '@e2e' }, async ({ page }) => {
    const site = new SiteChrome(page);
    await site.open();
    await site.expectLoaded();

    await site.selectCurrency(currency.code, currency.symbol);
  });

  test('switching the language to Español translates the UI', { tag: '@e2e' }, async ({ page }) => {
    const site = new SiteChrome(page);
    await site.open();
    await site.expectLoaded();

    await site.selectLanguage(language.name);
    // No DOM state exposes the language — the translated navbar is the proof.
    await site.expectNavbarShows(language.translatedNavLink);
  });

  test('footer links are exposed and legal links redirect to their pages', { tag: '@e2e' }, async ({
    page,
  }) => {
    const site = new SiteChrome(page);
    await site.open();
    await site.expectLoaded();

    await site.expectFooterLinks(footerLinks);

    // Legal links open in a new tab (target=_blank): each popup must land on
    // its own route, not on a redirect back to the homepage.
    for (const { name, path } of legalLinks) {
      await site.openLegalPopup(name, path);
    }
  });

  test('header links redirect to their routes', { tag: '@e2e' }, async ({ page }) => {
    const site = new SiteChrome(page);
    await site.open();
    await site.expectLoaded();

    for (const { name, path } of headerLinks) {
      await site.followHeaderLink(name, path);
      await site.open();
    }
  });

  test('Order Lookup and Support open their dialogs', { tag: '@e2e' }, async ({ page }) => {
    const site = new SiteChrome(page);
    await site.open();
    await site.expectLoaded();

    const [first, second] = siteChromeData.utilityDialogs;
    await site.openUtilityDialog(first.button, first.texts);
    await page.keyboard.press('Escape');
    await site.openUtilityDialog(second.button, second.texts);
  });
});
