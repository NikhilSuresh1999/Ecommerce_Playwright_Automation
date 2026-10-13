import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RentalsPage extends BasePage {
  public readonly pageTitle: Locator;
  public readonly rentalCards: Locator;

  constructor(page: Page) {
    super(page, 'RentalsPage');
    this.pageTitle = page.locator('[data-test="page-title"]');
    this.rentalCards = page.locator('[data-test^="product-"]');
  }

  public async open(): Promise<void> {
    await this.navigateTo('/rentals');
    await expect(this.pageTitle).toHaveText('Rentals');
    await expect(this.rentalCards.first()).toBeVisible();
  }

  public getRentalCardById(rentalId: string): Locator {
    return this.page.locator(`[data-test="product-${rentalId}"]`);
  }
}

