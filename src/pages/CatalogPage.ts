import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { MathHelper } from '@utils/math.helper';

export type ToolshopSortOption =
  | 'name,asc'
  | 'name,desc'
  | 'price,desc'
  | 'price,asc'
  | 'co2_rating,asc'
  | 'co2_rating,desc';

export class CatalogPage extends BasePage {
  public readonly searchQueryInput: Locator;
  public readonly searchSubmitButton: Locator;
  public readonly searchResetButton: Locator;
  public readonly searchCaption: Locator;
  public readonly noResultsContainer: Locator;
  public readonly noResultsMessage: Locator;
  public readonly sortDropdown: Locator;
  public readonly ecoFriendlyFilter: Locator;
  public readonly productCards: Locator;
  public readonly productNames: Locator;
  public readonly productPrices: Locator;
  public readonly co2Badges: Locator;
  public readonly ecoBadges: Locator;
  public readonly outOfStockBadges: Locator;
  public readonly paginationPrev: Locator;
  public readonly paginationNext: Locator;
  public readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page, 'CatalogPage');
    this.searchQueryInput = page.locator('[data-test="search-query"]');
    this.searchSubmitButton = page.locator('[data-test="search-submit"]');
    this.searchResetButton = page.locator('[data-test="search-reset"]');
    this.searchCaption = page.locator('[data-test="search-caption"]');
    this.noResultsContainer = page.locator('[data-test="no-results"]');
    this.noResultsMessage = page.locator('[data-test="no-results"]');
    this.sortDropdown = page.locator('[data-test="sort"]');
    this.ecoFriendlyFilter = page.locator('[data-test="eco-friendly-filter"]');
    this.productCards = page.locator('a.card[data-test^="product-"]');
    this.productNames = page.locator('[data-test="product-name"]');
    this.productPrices = page.locator('[data-test="product-price"]');
    this.co2Badges = page.locator('[data-test="co2-rating-badge"]');
    this.ecoBadges = page.locator('[data-test="eco-badge"]');
    this.outOfStockBadges = page.locator('[data-test="out-of-stock"]');
    this.paginationPrev = page.locator('a[aria-label="Previous"], [data-test="pagination-prev"]');
    this.paginationNext = page.locator('a[aria-label="Next"], [data-test="pagination-next"]');
    this.pageTitle = page.locator('[data-test="page-title"]');
  }

  public async open(): Promise<void> {
    await this.navigateTo('/');
    await expect(this.productCards.first()).toBeVisible();
  }

  public async searchFor(keyword: string): Promise<void> {
    await this.searchQueryInput.fill(keyword);
    await this.searchSubmitButton.click();
  }

  public async searchForProduct(keyword: string): Promise<void> {
    await this.searchFor(keyword);
  }

  public async resetSearch(): Promise<void> {
    await this.searchResetButton.click();
  }

  public async selectSort(option: ToolshopSortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  public async selectSortOption(option: ToolshopSortOption): Promise<void> {
    await this.selectSort(option);
  }

  public async toggleEcoFriendlyFilter(): Promise<void> {
    await this.ecoFriendlyFilter.click();
  }

  public getCategoryCheckbox(categoryId: string): Locator {
    return this.page.locator(`[data-test="category-${categoryId}"]`);
  }

  public async toggleCategoryFilter(categoryId: string): Promise<void> {
    const cb = this.getCategoryCheckbox(categoryId);
    await expect(cb).toBeVisible();
    await cb.click();
  }

  public getBrandCheckbox(brandId: string): Locator {
    return this.page.locator(`[data-test="brand-${brandId}"]`);
  }

  public async toggleBrandFilter(brandId: string): Promise<void> {
    const cb = this.getBrandCheckbox(brandId);
    await expect(cb).toBeVisible();
    await cb.click();
  }

  public getProductCardById(productId: string): Locator {
    return this.page.locator(`[data-test="product-${productId}"]`);
  }

  public getProductCardByName(name: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('[data-test="product-name"]', { hasText: name }),
    });
  }

  public async getAllVisibleProductNames(): Promise<string[]> {
    await expect(this.productNames.first()).toBeVisible();
    const raw = await this.productNames.allTextContents();
    return raw.map((n) => n.trim());
  }

  public async getVisibleProductNames(): Promise<string[]> {
    return await this.getAllVisibleProductNames();
  }

  public async getAllVisibleProductPrices(): Promise<number[]> {
    await expect(this.productPrices.first()).toBeVisible();
    const raw = await this.productPrices.allTextContents();
    return raw.map((p) => MathHelper.parseCurrency(p));
  }

  public async getVisibleProductPrices(): Promise<number[]> {
    return await this.getAllVisibleProductPrices();
  }

  public async openProductByName(name: string): Promise<void> {
    await this.productNames.filter({ hasText: name }).first().click();
  }
}

