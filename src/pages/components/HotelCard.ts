import { expect, type Locator } from '@playwright/test';
import { timing } from '../../config/timing';

/**
 * Guest-score band vocabulary. Order matters — longest first, so the regex
 * prefers "Very Good" over its substring "Good". Extend when the site adds a
 * band (e.g. "Exceptional").
 */
const SCORE_BANDS = ['Excellent', 'Very Good', 'Good', 'Average'] as const;
const SCORE_WITH_BAND = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${SCORE_BANDS.join('|')})`);

export interface HotelCardDetails {
  name: string;
  /** Total stay price ("Total $416") — the value the price filter applies to. */
  total: number;
  perNight: number;
  /** Guest score, e.g. 8.8 — "Very Good" starts at 7. */
  score: number;
  scoreLabel: string;
  reviewCount: number | null;
}

/**
 * Hotel card that opens over the map when a price pin is selected. Prices and
 * scores are plain text nodes, so the card is read once and parsed — one DOM
 * read, no locator churn.
 */
export class HotelCard {
  constructor(public readonly root: Locator) {}

  async expectVisible(): Promise<void> {
    await expect(this.root.first()).toBeVisible({ timeout: timing.hotelCard });
  }

  async details(): Promise<HotelCardDetails> {
    const text = (await this.root.first().innerText()).replace(/\u00a0/g, ' ');
    const money = (pattern: RegExp): number => {
      const match = text.match(pattern);
      return match ? Number((match[1] ?? '').replace(/,/g, '')) : NaN;
    };
    const scoreMatch = text.match(SCORE_WITH_BAND);
    const reviewMatch = text.match(/\((\d[\d,]*)\)/);
    const name = text
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 10 && !/^\$/.test(line));

    return {
      name: name ?? '',
      total: money(/Total\s*\$([\d,]+(?:\.\d+)?)/),
      perNight: money(/Per night\s*\$([\d,]+(?:\.\d+)?)/),
      score: scoreMatch ? Number(scoreMatch[1]) : NaN,
      scoreLabel: scoreMatch?.[2] ?? '',
      reviewCount: reviewMatch ? Number((reviewMatch[1] ?? '').replace(/,/g, '')) : null,
    };
  }
}
