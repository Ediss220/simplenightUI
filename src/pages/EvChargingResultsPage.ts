import { expect } from '@playwright/test';
import { CategoryResultsPage } from './CategoryResultsPage';
import { timing } from '../config/timing';
import { evChargingBooking } from '../data/booking.data';
import { categorySlug } from '../utils/slug';

/** Wheel-zoom tuning, mirroring the hotels MapView input pacing. */
const WHEEL_TICKS = 4;
const WHEEL_DELTA = 250;
const WHEEL_TICK_PAUSE_MS = 150;
const ZOOM_ROUNDS = 3;

/**
 * /search/ev-charging — charger results over a Google map. The map (default
 * view) renders inside an iframe, but its controls — the Map/List radio
 * toggle and the "Map Scale" label — live in the host document, so zoom is
 * driven by mouse coordinates over the map region and verified through the
 * scale label. The chargers themselves are listed (and openable) in the List
 * view as detail links.
 */
export class EvChargingResultsPage extends CategoryResultsPage {
  constructor(page: ConstructorParameters<typeof CategoryResultsPage>[0]) {
    super(page, { slug: categorySlug(evChargingBooking.category), noun: 'Chargers' });
  }

  /** Kilometres per pixel from Google's "Map Scale" control, or null. */
  private readScaleKm(): Promise<number | null> {
    return this.page.evaluate(() => {
      const label =
        [...document.querySelectorAll('button, div')]
          .map((el) => el.getAttribute('aria-label') ?? '')
          .find((t) => t.startsWith('Map Scale')) ?? '';
      const match = label.match(/Map Scale: ([\d.]+) (km|m) per/);
      return match ? Number(match[1]) * (match[2] === 'm' ? 0.001 : 1) : null;
    });
  }

  /**
   * Signature of the charger overlay markers around the map — station-name
   * buttons and cluster counts. WebKit renders the markers as accessible
   * host-document buttons (and no Map Scale control), so there the zoom is
   * verified by the marker set changing instead.
   */
  private readMarkerSignature(): Promise<string> {
    return this.page.evaluate(() => {
      const region = document.querySelector('[role="region"][aria-label="Map"]');
      const container = region?.parentElement;
      if (!container) return '';
      return [...container.querySelectorAll('button')]
        .map((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').trim())
        .filter(Boolean)
        .sort()
        .join('|');
    });
  }

  /**
   * Zooms the map in with wheel input over the map region's centre — mouse
   * coordinates reach the map regardless of its iframe. The zoom is verified
   * through whatever zoom state the engine exposes: the "Map Scale" control
   * (Chromium/Firefox) or the charger marker set changing (WebKit renders
   * markers as accessible host buttons and no scale control).
   */
  async zoomInMap(): Promise<void> {
    const mapRegion = this.page.getByRole('region', { name: 'Map', exact: true });
    await expect(mapRegion).toBeVisible({ timeout: timing.mapVisible });
    // Either observable may mount late (WebKit markers render async): wait
    // for whichever this engine provides before zooming.
    let mode: string = 'none';
    await expect
      .poll(
        async () => {
          if ((await this.readScaleKm()) !== null) return (mode = 'scale');
          if ((await this.readMarkerSignature()) !== '') return (mode = 'markers');
          return (mode = 'none');
        },
        { timeout: timing.mapVisible },
      )
      .not.toBe('none');

    const beforeScale = mode === 'scale' ? await this.readScaleKm() : null;
    const beforeMarkers = mode === 'markers' ? await this.readMarkerSignature() : null;
    if (beforeScale === null && (beforeMarkers === null || beforeMarkers === '')) {
      throw new Error('No zoom observable: neither Map Scale nor map markers are readable');
    }

    const box = await mapRegion.boundingBox();
    if (!box) throw new Error('Map region is not measurable');

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await this.page.mouse.move(x, y);
    for (let round = 0; round < ZOOM_ROUNDS; round++) {
      for (let tick = 0; tick < WHEEL_TICKS; tick++) {
        await this.page.mouse.wheel(0, -WHEEL_DELTA);
        await this.page.waitForTimeout(WHEEL_TICK_PAUSE_MS); // input pacing
      }
    }

    if (beforeScale !== null) {
      await expect
        .poll(async () => (await this.readScaleKm()) ?? beforeScale, {
          timeout: timing.markersSettle,
        })
        .toBeLessThan(beforeScale);
    } else {
      await expect
        .poll(async () => await this.readMarkerSignature(), {
          timeout: timing.markersSettle,
        })
        .not.toBe(beforeMarkers);
    }
  }

  /** Switches the results to the list of chargers (the default is the map). */
  async switchToListView(): Promise<void> {
    const listToggle = this.page.getByRole('radio', { name: 'List', exact: true });
    const firstRow = this.page.locator('main a[href*="/details/ev-charging/"]').first();
    // A zoom-triggered refresh can reset the toggle back to Map: the switch
    // only counts once charger rows have actually rendered.
    for (let attempt = 0; attempt < 3; attempt++) {
      await listToggle.click();
      await expect(listToggle).toBeChecked();
      const switched = await expect(firstRow)
        .toBeVisible({ timeout: timing.viewSwitch })
        .then(
          () => true,
          () => false,
        );
      if (switched) return;
    }
    throw new Error('Results did not switch to the charger list');
  }

  /**
   * Opens the charger at `position` (1-based) in the list and waits for its
   * detail route and the station name heading. The zoom-triggered refresh can
   * flip the view back to Map at any moment — if the rows vanish mid-flight,
   * the switch is made again before retrying.
   */
  async openListItem(position: number): Promise<void> {
    const row = this.page.locator('main a[href*="/details/ev-charging/"]').nth(position - 1);
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.switchToListView();
      await row.click({ timeout: timing.viewSwitch }).catch(() => undefined);
      const opened = await this.page
        .waitForURL(/\/details\/ev-charging\//, { timeout: timing.detailOpen })
        .then(
          () => true,
          () => false,
        );
      if (opened) {
        await expect(
          this.page.getByRole('heading', { name: /.+/ }).first(),
        ).toBeVisible({ timeout: timing.searchSubmit });
        return;
      }
    }
    throw new Error(`Could not open charger ${position} from the list`);
  }
}
