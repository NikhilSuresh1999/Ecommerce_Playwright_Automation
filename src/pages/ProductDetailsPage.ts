import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { MathHelper } from '@utils/math.helper';

export class ProductDetailsPage extends BasePage {
  public readonly productName: Locator;
  public readonly unitPrice: Locator;
  public readonly productDescription: Locator;
  public readonly co2Badge: Locator;
  public readonly outOfStockBadge: Locator;
  public readonly decreaseQuantityBtn: Locator;
  public readonly quantityInput: Locator;
  public readonly increaseQuantityBtn: Locator;
  public readonly addToCartBtn: Locator;
  public readonly addToFavoritesBtn: Locator;
  public readonly addToCompareBtn: Locator;
  public readonly specsTable: Locator;
  public readonly specRows: Locator;
  public readonly toastAlert: Locator;

  constructor(page: Page) {
    super(page, 'ProductDetailsPage');
    this.productName = page.locator('[data-test="product-name"]');
    this.unitPrice = page.locator('[data-test="unit-price"]');
    this.productDescription = page.locator('[data-test="product-description"]');
    this.co2Badge = page.locator('[data-test="co2-rating-badge"]');
    this.outOfStockBadge = page.locator('[data-test="out-of-stock"]');
    this.decreaseQuantityBtn = page.locator('[data-test="decrease-quantity"]');
    this.quantityInput = page.locator('[data-test="quantity"]');
    this.increaseQuantityBtn = page.locator('[data-test="increase-quantity"]');
    this.addToCartBtn = page.locator('[data-test="add-to-cart"]');
    this.addToFavoritesBtn = page.locator('[data-test="add-to-favorites"]');
    this.addToCompareBtn = page.locator('[data-test="add-to-compare"]');
    this.specsTable = page.locator('[data-test="product-specs"]');
    this.specRows = page.locator('[data-test="spec-row"]');
    this.toastAlert = page.locator('#toast-container, .ngx-toastr, .toast-message, div[role="alert"]').first();
  }

  public async openProductById(productId: string): Promise<void> {
    await this.navigateTo(`/product/${productId}`);
    await expect(this.productName).toBeVisible();
  }

  public async getDetails(): Promise<{
    name: string;
    price: number;
    description: string;
    co2Rating: string;
  }> {
    const name = await this.getTrimmedText(this.productName);
    const priceStr = await this.getTrimmedText(this.unitPrice);
    const description = await this.getTrimmedText(this.productDescription);
    const co2Rating = (await this.co2Badge.locator('.badge, span.active').first().textContent().catch(() => '')) || '';
    return {
      name,
      price: MathHelper.parseCurrency(priceStr),
      description,
      co2Rating: co2Rating.trim(),
    };
  }

  public async addToCart(quantity = 1): Promise<void> {
    if (quantity > 1) {
      await this.quantityInput.fill(String(quantity));
    }
    await this.addToCartBtn.click();
    await expect(this.page.locator('[data-test="cart-quantity"]')).toBeVisible();
  }

  public async getSpecificationsMap(): Promise<Record<string, string>> {
    const count = await this.specRows.count();
    const specs: Record<string, string> = {};
    for (let i = 0; i < count; i++) {
      const row = this.specRows.nth(i);
      const name = ((await row.locator('[data-test="spec-name"]').textContent()) ?? '').trim();
      const val = ((await row.locator('[data-test="spec-value"]').textContent()) ?? '').trim();
      specs[name] = val;
    }
    return specs;
  }
}
