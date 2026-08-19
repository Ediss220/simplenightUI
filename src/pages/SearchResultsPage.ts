import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { MapView } from './components/MapView';
import { HotelCard } from './components/HotelCard';

/** /search/hotels — filter rail, view switcher, results strip and the map. */
export class SearchResultsPage extends BasePage {
  readonly map = new MapView(this.page);

  private readonly resultsSummary = this.page.getByText(/Showing \d+ out of \d+ Properties/);
  /** The two Price Range thumbs (aria-valuemax="1000" excludes the distance slider). */
  private readonly priceThumbs = this.page.locator(
    '[role="slider"][aria-valuemin="0"][aria-valuemax="1000"]',
  );

  async expectLoaded(): Promise<void> {
    await expect(this.resultsSummary).toBeVisible({ timeout: 90_000 });
  }

  /**
   * Drags the minimum thumb of the price slider. The maximum already sits at
   * the open-ended cap ("1000+"), so only the lower bound moves.
   *
   * The platform snaps the slider value to the nearest available price bucket
   * (e.g. 100 -> 96), so the effective floor is returned for result checks.
   */
  async applyPriceRange(min: number, max = 1000): Promise<number> {
    const minThumb = this.priceThumbs.first();
    await expect(minThumb).toBeVisible();

    for (let attempt = 1; attempt <= 3; attempt++) {
      const from = await minThumb.boundingBox();
      const to = await this.priceThumbs.nth(1).boundingBox();
      if (!from || !to) throw new Error('Price slider thumbs are not measurable');

      const startX = from.x + from.width / 2;
      const endX = to.x + to.width / 2;
      const targetX = startX + ((endX - startX) * min) / max;
      const y = from.y + from.height / 2;

      await this.page.mouse.move(startX, y);
      await this.page.mouse.down();
      await this.page.mouse.move(targetX, y, { steps: 20 });
      await this.page.mouse.up();

      const settled = await expect
        .poll(async () => Number(await minThumb.getAttribute('aria-valuenow')), {
          timeout: 5_000,
        })
        .toBeGreaterThanOrEqual(min)
        .then(() => true)
        .catch(() => false);
      if (settled) break;
      if (attempt === 3) throw new Error(`Could not set price minimum to ${min}`);
    }

    // The results URL gains price_range=<floor>,... once the filtered search
    // runs (the browser encodes the list separator "," as %2C).
    await this.page.waitForURL(/price_range=\d+(?:%2C|,)/i, { timeout: 30_000 });
    const appliedMin = Number(
      new URL(this.page.url()).searchParams.get('price_range')?.split(',')[0],
    );
    // Bucket snapping only moves the floor down (nearest price point below).
    expect(appliedMin, 'applied price floor is at or below the slider').toBeLessThanOrEqual(min);
    return appliedMin;
  }

  /** Checks a Guest Score band, e.g. "Very Good (7+)", and waits for the filtered results. */
  async applyGuestScore(label: string, urlToken: string): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name: label }).first();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await this.page.waitForURL(new RegExp(urlToken), { timeout: 30_000 });
  }

  async switchToMapView(): Promise<void> {
    const mapToggle = this.page.getByRole('radio', { name: 'Map', exact: true });
    // Plain click + assertion: `.check()` re-verifies on the pre-click element
    // handle, which the SPA view swap can replace mid-flight.
    await mapToggle.click();
    await expect(mapToggle).toBeChecked();
    await this.map.expectVisible();
  }

  /**
   * The hotel card that pops up on the map once its pin is selected — an
   * article named after the property, with total/nightly price and guest score.
   */
  hotelCard(): HotelCard {
    return new HotelCard(this.page.getByRole('article'));
  }
}
