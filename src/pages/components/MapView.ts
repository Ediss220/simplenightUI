import { expect, type Page } from '@playwright/test';

/** A price pin rendered on the results map. */
export interface MapMarker {
  /**
   * Hotel name for overlay pins (rendered as real buttons with an aria-label),
   * or the price text for Google Maps' native canvas pins.
   */
  label: string;
  /** Parsed price shown on the pin, e.g. "$325" -> 325. */
  price: number;
  x: number;
  y: number;
  /** Overlay pins are accessible buttons and can be clicked by role. */
  accessible: boolean;
}

interface RawMarker {
  label: string;
  priceText: string;
  x: number;
  y: number;
  accessible: boolean;
}

/**
 * The results map renders hotel pins in two modes: Google Maps' native canvas
 * markers (no accessibility tree) and, once the viewport separates the hotels,
 * overlay buttons named after each property. Both are collected into one
 * marker set; because neither mode exposes readable state changes, updates are
 * synchronized by polling until two consecutive reads agree — the map
 * equivalent of a web-first wait.
 */
export class MapView {
  constructor(private readonly page: Page) {}

  async expectVisible(): Promise<void> {
    await expect(this.page.locator('.gm-style').first()).toBeVisible({ timeout: 30_000 });
  }

  /** Visible price pins from both rendering modes, deduplicated. */
  async readMarkers(): Promise<MapMarker[]> {
    const raw = await this.page.evaluate((): RawMarker[] => {
      // Regexes must live inside the evaluate callback — it is serialized and
      // runs in the page, where outer Node-scope bindings do not exist.
      const priceText = /^\$[\d,]+(?:\.\d+)?$/;
      const clusterText = /^\d{1,3}$/;
      const inViewport = (r: DOMRect) =>
        r.width > 0 && r.bottom >= 0 && r.top <= window.innerHeight && r.right >= 0;

      // Overlay buttons: aria-label is the hotel name, text content the price.
      const overlay = [...document.querySelectorAll<HTMLButtonElement>('button[aria-label]')]
        .filter((b) => {
          const text = b.textContent?.trim() ?? '';
          return priceText.test(text) || clusterText.test(text);
        })
        .map((b) => {
          const r = b.getBoundingClientRect();
          return {
            label: b.getAttribute('aria-label') ?? '',
            priceText: b.textContent?.trim() ?? '',
            x: r.x + r.width / 2,
            y: r.y + r.height / 2,
            accessible: true,
          };
        })
        .filter((m) => inViewport(new DOMRect(m.x, m.y, 1, 1)));

      // Native Google Maps pins: leaf text nodes inside the map canvas.
      const map = document.querySelector('.gm-style');
      const native: RawMarker[] = [];
      if (map) {
        const seen = new Set(
          overlay.map(
            (m) => `${m.priceText}@${Math.round(m.x / 25)},${Math.round(m.y / 25)}`,
          ),
        );
        for (const el of map.querySelectorAll<HTMLElement>('*')) {
          if (el.children.length > 0) continue;
          const text = el.textContent?.trim() ?? '';
          if (!priceText.test(text) && !clusterText.test(text)) continue;
          // Climb from the leaf label to its marker wrapper (~28px wide).
          let wrapper: HTMLElement = el;
          while (
            wrapper.parentElement &&
            wrapper.parentElement.getBoundingClientRect().width < 28
          ) {
            wrapper = wrapper.parentElement;
          }
          const box = wrapper.getBoundingClientRect();
          const key = `${text}@${Math.round((box.x + box.width / 2) / 25)},${Math.round((box.y + box.height / 2) / 25)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          native.push({
            label: text,
            priceText: text,
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            accessible: false,
          });
        }
      }
      return [...overlay, ...native].filter((m) => inViewport(new DOMRect(m.x, m.y, 1, 1)));
    });

    return raw.map((m) => ({
      label: m.label,
      // Cluster markers ("12") keep price 0; only "$..." text is a hotel pin.
      price: m.priceText.startsWith('$') ? Number(m.priceText.replace(/[$,]/g, '')) || 0 : 0,
      x: m.x,
      y: m.y,
      accessible: m.accessible,
    }));
  }

  /** Waits until the marker set stops changing between consecutive reads. */
  async waitForMarkersToSettle(timeout = 15_000): Promise<MapMarker[]> {
    let settled: MapMarker[] = [];
    // Coarse 25px buckets: pins ease into place, exact pixels never settle.
    const signature = (markers: MapMarker[]) =>
      markers
        .map((m) => `${m.label}@${Math.round(m.x / 25)},${Math.round(m.y / 25)}`)
        .sort()
        .join('|');
    await expect
      .poll(
        async () => {
          const first = await this.readMarkers();
          await this.page.waitForTimeout(400);
          const second = await this.readMarkers();
          const stable = signature(first) === signature(second);
          if (stable) settled = second;
          return stable;
        },
        { timeout, intervals: [250] },
      )
      .toBe(true);
    return settled;
  }

  /**
   * Zooms in until exactly one hotel price pin remains visible — then the
   * marker is unambiguous to select. Cluster markers are also collected so the
   * zoom can start before any pin has separated.
   */
  async zoomToSingleHotelMarker(maxRounds = 12): Promise<MapMarker> {
    const map = await this.mapBox();
    for (let round = 0; round < maxRounds; round++) {
      const markers = await this.waitForMarkersToSettle();
      const pins = markers.filter((m) => m.price > 0);
      const clusters = markers.filter((m) => m.price === 0);
      if (pins.length === 1 && clusters.length === 0) return pins[0]!;

      // Zoom exactly on the first marker so it stays put while the others
      // spread out — except overlay buttons, which swallow wheels themselves
      // (+x sidesteps them). The point is clamped inside the canvas: beyond
      // its edge the wheel never reaches the map.
      const anchor = pins[0] ?? clusters[0];
      const offsetX = anchor?.accessible ? 40 : 0;
      const rawX = (anchor?.x ?? map.x + map.width / 2) + offsetX;
      const rawY = anchor?.y ?? map.y + map.height / 2;
      const x = Math.min(Math.max(rawX, map.x + 20), map.x + map.width - 20);
      const y = Math.min(Math.max(rawY, map.y + 20), map.y + map.height - 20);
      await this.wheelZoomIn(x, y);
    }
    throw new Error(`Still not down to a single hotel marker after ${maxRounds} zoom rounds`);
  }

  async clickMarker(marker: MapMarker): Promise<void> {
    if (marker.accessible) {
      await this.page.getByRole('button', { name: marker.label, exact: true }).click();
    } else {
      await this.page.mouse.click(marker.x, marker.y);
    }
  }

  private async mapBox(): Promise<{ x: number; y: number; width: number; height: number }> {
    const box = await this.page.locator('.gm-style').first().boundingBox();
    if (!box) throw new Error('Map canvas is not visible');
    return box;
  }
  private async wheelZoomIn(x: number, y: number, ticks = 4): Promise<void> {
    await this.page.mouse.move(x, y);
    for (let i = 0; i < ticks; i++) {
      await this.page.mouse.wheel(0, -250);
      await this.page.waitForTimeout(150); // input pacing, not synchronization
    }
  }
}
