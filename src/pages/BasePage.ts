import { type Locator, type Page } from '@playwright/test';

/** Shared behaviour for all page objects. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** The site opens pickers (destination, dates, guests) in a Mantine modal dialog. */
  get dialog(): Locator {
    return this.page.getByRole('dialog');
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}
