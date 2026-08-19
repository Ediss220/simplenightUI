import { expect, type Page } from '@playwright/test';

export interface GuestSelection {
  adults: number;
  childrenAges: readonly number[];
}

/** Travelers modal ("Room 1") with Adults / Children counters and child-age inputs. */
export class GuestSelectorDialog {
  constructor(private readonly page: Page) {}

  private get dialog() {
    return this.page.getByRole('dialog');
  }

  /**
   * Brings the room to the requested occupancy. Adults default to 1, so only
   * the delta is clicked. Each added child exposes a "Child N Age" combobox
   * (readonly Mantine select): clicking it opens an age list to pick from.
   */
  async apply({ adults, childrenAges }: GuestSelection): Promise<void> {
    for (let adult = 1; adult < adults; adult++) {
      await this.dialog.getByRole('button', { name: 'Add Adult' }).click();
    }
    for (const [index, age] of childrenAges.entries()) {
      await this.dialog.getByRole('button', { name: 'Add Child' }).click();
      await this.selectChildAge(index + 1, age);
    }
  }

  /** Picks an age (1–17) from the popover list the combobox opens. */
  private async selectChildAge(childNumber: number, age: number): Promise<void> {
    const ageField = this.dialog.getByRole('textbox', { name: `Child ${childNumber} Age` });
    await expect(ageField).toBeVisible();
    await ageField.click();

    // The popover renders as a second dialog; its options are the page's only
    // role=option elements while open, so they can be addressed unscoped.
    const option = this.page.getByRole('option', { name: String(age), exact: true });
    await expect(option).toBeVisible();
    await option.click();
    await expect(ageField).toHaveValue(String(age));
  }
}
