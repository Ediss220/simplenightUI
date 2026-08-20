import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { timing } from '../config/timing';

/** One footer/header link expectation: visible with this href. */
export interface LinkExpectation {
  name: string;
  href: string;
}

/**
 * Site chrome — header and footer shared by every page. The header's currency
 * button opens a two-tab selector (Language / Currency); its own label mirrors
 * the active currency ("$", "€", "US$" after a language switch).
 */
export class SiteChrome extends BasePage {
  /** The currency button; matches any currency symbol or prefixed form. */
  get selectorButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: /[$€¥£₹₩]/ }).first();
  }

  private get selectorDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /** The selector's tabs render as role=tab with a text fallback. */
  private tab(name: string): Locator {
    return this.page
      .getByRole('tab', { name, exact: true })
      .or(this.page.getByText(name, { exact: true }))
      .first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  /**
   * Switches the site currency. Verified through the persisted ui-currency
   * store and the header button adopting the new symbol.
   */
  async selectCurrency(code: string, symbol: string): Promise<void> {
    await this.openSelector('Currency');
    await this.selectorDialog.getByRole('button', { name: code, exact: true }).click();
    await expect(this.selectorDialog).toBeHidden();

    await expect
      .poll(() => this.page.evaluate(() => localStorage.getItem('ui-currency') ?? ''))
      .toContain(`"currency":"${code}"`);
    await expect(this.selectorButton).toHaveText(new RegExp(symbol));
  }

  /**
   * Switches the site language. No DOM state exposes it — the observable is
   * the translated UI itself, asserted by the caller via expected strings.
   */
  async selectLanguage(language: string): Promise<void> {
    await this.openSelector('Language');
    await this.selectorDialog.getByRole('button', { name: language, exact: true }).click();
    await expect(this.selectorDialog).toBeHidden();
  }

  /** Every footer link must render with its exact href. */
  async expectFooterLinks(links: readonly LinkExpectation[]): Promise<void> {
    for (const { name, href } of links) {
      const link = this.footerLink(href);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    }
  }

  /**
   * Footer legal links open in a new tab (target=_blank): follow the popup
   * and assert it lands on the expected path.
   */
  async openLegalPopup(name: string, path: string): Promise<void> {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup', { timeout: timing.popupRedirect }),
      this.page.getByRole('link', { name, exact: true }).click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    await expect(popup).toHaveURL(new RegExp(`${path}$`));
    await popup.close();
  }

  /** Header links navigate in place; assert the route they land on. */
  async followHeaderLink(name: string, path: string): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).first().click();
    await this.page.waitForURL((url) => url.pathname === path);
  }

  /** Header utility buttons open overlays; assert the dialog's key texts. */
  async openUtilityDialog(buttonName: string, expectedTexts: readonly string[]): Promise<void> {
    await this.page.getByRole('button', { name: buttonName, exact: true }).first().click();
    await expect(this.selectorDialog).toBeVisible();
    for (const text of expectedTexts) {
      await expect(this.selectorDialog).toContainText(text);
    }
  }

  /**
   * The translated navbar is the language observable: after a switch, the
   * category links must render under their translated names.
   */
  async expectNavbarShows(linkName: string): Promise<void> {
    await expect(
      this.page.getByRole('main').locator('nav').getByRole('link', { name: linkName, exact: true }),
    ).toBeVisible();
  }

  /** A footer link by href — mailto:/tel:/internal/external alike. */
  private footerLink(href: string): Locator {
    return this.page
      .locator(`footer a[href="${href}"], [class*="footer"] a[href="${href}"]`)
      .first();
  }

  private async openSelector(tabName: string): Promise<void> {
    await this.selectorButton.click();
    await expect(this.selectorDialog).toBeVisible();
    await this.tab(tabName).click();
  }
}
