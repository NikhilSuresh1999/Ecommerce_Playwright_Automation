import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseCurrency } from '@utils/math.helper';
import { PaymentMethodScenario } from '@data/toolshop.checkout.data';

export interface CartTableLineItem {
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export class CheckoutWizardPage extends BasePage {
  // Step 1: Cart Review Table
  public readonly productTitles: Locator;
  public readonly productQuantities: Locator;
  public readonly productPrices: Locator;
  public readonly linePrices: Locator;
  public readonly cartTotalCell: Locator;
  public readonly proceedStep1Button: Locator;
  public readonly continueShoppingButton: Locator;

  // Step 2: Sign-In Check
  public readonly proceedStep2Button: Locator;
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly loginSubmitButton: Locator;

  // Step 3: Billing Address
  public readonly streetInput: Locator;
  public readonly cityInput: Locator;
  public readonly stateInput: Locator;
  public readonly countryInput: Locator;
  public readonly postalCodeInput: Locator;
  public readonly houseNumberInput: Locator;
  public readonly proceedStep3Button: Locator;

  // Step 4: Payment Methods & Finish
  public readonly paymentMethodSelect: Locator;
  public readonly bankNameInput: Locator;
  public readonly accountNameInput: Locator;
  public readonly accountNumberInput: Locator;
  public readonly creditCardNumberInput: Locator;
  public readonly expirationDateInput: Locator;
  public readonly cvvInput: Locator;
  public readonly cardHolderNameInput: Locator;
  public readonly monthlyInstallmentsSelect: Locator;
  public readonly giftCardNumberInput: Locator;
  public readonly validationCodeInput: Locator;
  public readonly finishButton: Locator;
  public readonly paymentSuccessMessage: Locator;
  public readonly orderConfirmationNumber: Locator;

  constructor(page: Page) {
    super(page, 'CheckoutWizardPage');
    this.productTitles = page.locator('[data-test="product-title"]');
    this.productQuantities = page.locator('[data-test="product-quantity"]');
    this.productPrices = page.locator('[data-test="product-price"]');
    this.linePrices = page.locator('[data-test="line-price"]');
    this.cartTotalCell = page.locator('[data-test="cart-total"]');
    this.proceedStep1Button = page.locator('[data-test="proceed-1"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');

    this.proceedStep2Button = page.locator('[data-test="proceed-2"]');
    this.emailInput = page.locator('[data-test="email"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginSubmitButton = page.locator('[data-test="login-submit"]');

    this.streetInput = page.locator('[data-test="street"]');
    this.cityInput = page.locator('[data-test="city"]');
    this.stateInput = page.locator('[data-test="state"]');
    this.countryInput = page.locator('[data-test="country"]');
    this.postalCodeInput = page.locator('[data-test="postal_code"]');
    this.houseNumberInput = page.locator('[data-test="house_number"]');
    this.proceedStep3Button = page.locator('[data-test="proceed-3"]');

    this.paymentMethodSelect = page.locator('[data-test="payment-method"]');
    this.bankNameInput = page.locator('[data-test="bank_name"]');
    this.accountNameInput = page.locator('[data-test="account_name"]');
    this.accountNumberInput = page.locator('[data-test="account_number"]');
    this.creditCardNumberInput = page.locator('[data-test="credit_card_number"]');
    this.expirationDateInput = page.locator('[data-test="expiration_date"]');
    this.cvvInput = page.locator('[data-test="cvv"]');
    this.cardHolderNameInput = page.locator('[data-test="card_holder_name"]');
    this.monthlyInstallmentsSelect = page.locator('[data-test="monthly_installments"]');
    this.giftCardNumberInput = page.locator('[data-test="gift_card_number"]');
    this.validationCodeInput = page.locator('[data-test="validation_code"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.paymentSuccessMessage = page.locator('[data-test="payment-success-message"]');
    this.orderConfirmationNumber = page.locator('#order-confirmation');
  }

  public async openCheckout(): Promise<void> {
    await this.navigateTo('/checkout');
  }

  public async getCartLineItems(): Promise<CartTableLineItem[]> {
    const count = await this.productTitles.count();
    const items: CartTableLineItem[] = [];
    for (let i = 0; i < count; i++) {
      const title = ((await this.productTitles.nth(i).textContent()) ?? '').trim();
      const qtyStr = await this.productQuantities.nth(i).inputValue();
      const unitStr = ((await this.productPrices.nth(i).textContent()) ?? '').trim();
      const totalStr = ((await this.linePrices.nth(i).textContent()) ?? '').trim();
      items.push({
        title,
        quantity: parseInt(qtyStr, 10) || 0,
        unitPrice: parseCurrency(unitStr),
        lineTotal: parseCurrency(totalStr),
      });
    }
    return items;
  }

  public async getCartTotalPrice(): Promise<number> {
    const text = await this.getTrimmedText(this.cartTotalCell);
    return parseCurrency(text);
  }

  public async updateLineItemQuantity(rowIndex: number, newQuantity: number): Promise<void> {
    const input = this.productQuantities.nth(rowIndex);
    await input.fill(String(newQuantity));
    await input.press('Enter');
  }

  public async deleteLineItem(rowIndex: number): Promise<void> {
    const deleteButtons = this.page.locator('a.btn-danger');
    await deleteButtons.nth(rowIndex).click();
  }

  public async proceedFromCartStep(): Promise<void> {
    await expect(this.proceedStep1Button).toBeVisible();
    await this.proceedStep1Button.click();
  }

  public async proceedFromSignInStep(): Promise<void> {
    await expect(this.proceedStep2Button).toBeVisible();
    await this.proceedStep2Button.click();
  }

  public async fillBillingAddress(address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  }): Promise<void> {
    await expect(this.streetInput).toBeVisible();
    await this.countryInput.selectOption(address.country);
    await this.postalCodeInput.fill(address.postal_code);
    if ((await this.houseNumberInput.count()) > 0) {
      await this.houseNumberInput.fill('98');
    }
    await this.streetInput.fill(address.street);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
  }

  public async proceedFromAddressStep(): Promise<void> {
    await expect(this.proceedStep3Button).toBeEnabled();
    await this.proceedStep3Button.click();
  }

  public async selectAndFillPaymentMethod(scenario: PaymentMethodScenario): Promise<void> {
    await expect(this.paymentMethodSelect).toBeVisible();
    await this.paymentMethodSelect.selectOption(scenario.methodValue);

    switch (scenario.methodValue) {
      case 'bank-transfer':
        await this.bankNameInput.fill(scenario.fields.bank_name);
        await this.accountNameInput.fill(scenario.fields.account_name);
        await this.accountNumberInput.fill(scenario.fields.account_number);
        break;
      case 'cash-on-delivery':
        break;
      case 'credit-card':
        await this.creditCardNumberInput.fill(scenario.fields.credit_card_number);
        await this.expirationDateInput.fill(scenario.fields.expiration_date);
        await this.cvvInput.fill(scenario.fields.cvv);
        await this.cardHolderNameInput.fill(scenario.fields.card_holder_name);
        break;
      case 'buy-now-pay-later':
        await this.monthlyInstallmentsSelect.selectOption(scenario.fields.monthly_installments);
        break;
      case 'gift-card':
        await this.giftCardNumberInput.fill(scenario.fields.gift_card_number);
        await this.validationCodeInput.fill(scenario.fields.validation_code);
        break;
    }
  }

  public async confirmPayment(): Promise<void> {
    await expect(this.finishButton).toBeEnabled();
    await this.finishButton.click();
  }
}
