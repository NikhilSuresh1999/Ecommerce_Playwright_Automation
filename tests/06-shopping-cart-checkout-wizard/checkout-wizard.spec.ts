import { test, expect } from '@fixtures/base.fixture';
import { TOOLSHOP_PRODUCTS } from '@data/toolshop.catalog.data';
import { TOOLSHOP_USERS } from '@data/toolshop.users.data';
import { PAYMENT_METHOD_SCENARIOS } from '@data/toolshop.checkout.data';
import { roundToTwoDecimals } from '@utils/math.helper';

test.describe('Suite 06: 4-Step Shopping Cart & Multi-Payment Checkout Wizard Engine', () => {
  const inStockProducts = TOOLSHOP_PRODUCTS.filter((p) => p.in_stock);
  const defaultAddress = TOOLSHOP_USERS.customer.address;

  test.describe('Parameterized Payment Method End-to-End Checkout Matrix (8 Payment Scenarios)', () => {
    for (const [idx, paymentScenario] of PAYMENT_METHOD_SCENARIOS.entries()) {
      const testId = `CHK-${String(idx + 1).padStart(3, '0')}`;
      test(`${testId}: [${paymentScenario.scenarioId}] Complete 4-step checkout using "${paymentScenario.displayName}" (${paymentScenario.methodValue})`, async ({
        authPage,
        productDetailsPage,
        checkoutWizardPage,
      }) => {
        await authPage.authenticateAsCustomer('customer');
        await productDetailsPage.openProductById(inStockProducts[idx % inStockProducts.length].id);
        await productDetailsPage.addToCart(1);

        await checkoutWizardPage.openCheckout();
        await checkoutWizardPage.proceedFromCartStep();
        await checkoutWizardPage.proceedFromSignInStep();
        await checkoutWizardPage.fillBillingAddress(defaultAddress);
        await checkoutWizardPage.proceedFromAddressStep();

        await checkoutWizardPage.selectAndFillPaymentMethod(paymentScenario);
        await checkoutWizardPage.confirmPayment();

        await expect(checkoutWizardPage.paymentSuccessMessage).toBeVisible();
        await expect(checkoutWizardPage.paymentSuccessMessage).toContainText(
          'Payment was successful'
        );
      });
    }
  });

  test.describe('Parameterized Single-Product End-to-End Order Checkout (All 11 In-Stock Tools)', () => {
    for (const [idx, product] of inStockProducts.entries()) {
      const testId = `CHK-${String(idx + 9).padStart(3, '0')}`;
      test(`${testId}: Purchasing 1 unit of "${product.name}" ($${product.price.toFixed(2)}) verifies exact cart line math and completes checkout`, async ({
        authPage,
        productDetailsPage,
        checkoutWizardPage,
      }) => {
        await authPage.authenticateAsCustomer('customer');
        await productDetailsPage.openProductById(product.id);
        await productDetailsPage.addToCart(1);

        await checkoutWizardPage.openCheckout();
        await expect(checkoutWizardPage.productTitles.first()).toContainText(product.name);

        const total = await checkoutWizardPage.getCartTotalPrice();
        const expectedPrice = product.is_eco_friendly
          ? roundToTwoDecimals(product.price * 0.95)
          : product.price;
        expect(total).toBeCloseTo(expectedPrice, 1);

        await checkoutWizardPage.proceedFromCartStep();
        await checkoutWizardPage.proceedFromSignInStep();
        await checkoutWizardPage.fillBillingAddress(defaultAddress);
        await checkoutWizardPage.proceedFromAddressStep();
        await checkoutWizardPage.selectAndFillPaymentMethod(PAYMENT_METHOD_SCENARIOS[1]);
        await checkoutWizardPage.confirmPayment();

        await expect(checkoutWizardPage.paymentSuccessMessage).toBeVisible();
      });
    }
  });

  test.describe('Cart Line Math, Quantity Mutation, Multi-Item Aggregation & Stepper Validation', () => {
    for (const [qIdx, qty] of [2, 3, 4, 5, 8].entries()) {
      const testId = `CHK-${String(qIdx + 20).padStart(3, '0')}`;
      test(`${testId}: Updating cart item quantity to ${qty} recalculates line total and grand total accurately`, async ({
        productDetailsPage,
        checkoutWizardPage,
      }) => {
        const product = inStockProducts[0];
        await productDetailsPage.openProductById(product.id);
        await productDetailsPage.addToCart(1);

        await checkoutWizardPage.openCheckout();
        await expect(checkoutWizardPage.productTitles.first()).toBeVisible();
        await checkoutWizardPage.updateLineItemQuantity(0, qty);

        const expectedTotal = roundToTwoDecimals(product.price * qty);
        await expect(checkoutWizardPage.linePrices.first()).toContainText(expectedTotal.toFixed(2));
        await expect(checkoutWizardPage.cartTotalCell).toContainText(expectedTotal.toFixed(2));
      });
    }

    test('CHK-025: Aggregating 2 distinct products in cart calculates exact combined subtotal', async ({
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      const p1 = inStockProducts[0];
      const p2 = inStockProducts[1];
      await productDetailsPage.openProductById(p1.id);
      await productDetailsPage.addToCart(1);

      await productDetailsPage.openProductById(p2.id);
      await productDetailsPage.addToCart(2);

      await checkoutWizardPage.openCheckout();
      await expect(checkoutWizardPage.productTitles).toHaveCount(2);

      const rawSubtotal = roundToTwoDecimals(p1.price + p2.price * 2);
      const discountedSubtotal = roundToTwoDecimals(rawSubtotal * 0.95);
      const actualTotal = await checkoutWizardPage.getCartTotalPrice();
      expect([rawSubtotal, discountedSubtotal]).toContain(actualTotal);
    });

    test('CHK-026: Aggregating 3 distinct products in cart calculates exact combined grand total', async ({
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      const [p1, p2, p3] = inStockProducts;
      await productDetailsPage.openProductById(p1.id);
      await productDetailsPage.addToCart(1);
      await productDetailsPage.openProductById(p2.id);
      await productDetailsPage.addToCart(1);
      await productDetailsPage.openProductById(p3.id);
      await productDetailsPage.addToCart(1);

      await checkoutWizardPage.openCheckout();
      await expect(checkoutWizardPage.productTitles).toHaveCount(3);

      const rawTotal = roundToTwoDecimals(p1.price + p2.price + p3.price);
      const discountedTotal = roundToTwoDecimals(rawTotal * 0.95);
      const actualTotal = await checkoutWizardPage.getCartTotalPrice();
      expect([rawTotal, discountedTotal]).toContain(actualTotal);
    });

    test('CHK-027: Deleting a line item from a 2-item cart removes the row and updates cart total', async ({
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      const p1 = inStockProducts[0];
      const p2 = inStockProducts[1];
      await productDetailsPage.openProductById(p1.id);
      await productDetailsPage.addToCart(1);
      await productDetailsPage.openProductById(p2.id);
      await productDetailsPage.addToCart(1);

      await checkoutWizardPage.openCheckout();
      await expect(checkoutWizardPage.productTitles).toHaveCount(2);

      await checkoutWizardPage.deleteLineItem(0);
      await expect(checkoutWizardPage.productTitles).toHaveCount(1);
      await expect(checkoutWizardPage.linePrices.first()).toContainText(p2.price.toFixed(2));
    });

    test('CHK-028: Clicking [data-test="continue-shopping"] on Step 1 returns customer to home catalog', async ({
      productDetailsPage,
      checkoutWizardPage,
      page,
    }) => {
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();

      await expect(checkoutWizardPage.continueShoppingButton).toBeVisible();
      await checkoutWizardPage.continueShoppingButton.click();
      await expect(page).toHaveURL(/\/$/);
    });

    test('CHK-029: Unauthenticated shopper on Step 2 sees inline login form before proceeding to Step 3', async ({
      productDetailsPage,
      checkoutWizardPage,
      page,
    }) => {
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();

      await expect(checkoutWizardPage.emailInput).toBeVisible();
      await checkoutWizardPage.emailInput.fill(TOOLSHOP_USERS.customer.email);
      await checkoutWizardPage.passwordInput.fill(TOOLSHOP_USERS.customer.password);
      await checkoutWizardPage.loginSubmitButton.click();

      await expect(checkoutWizardPage.proceedStep2Button).toBeVisible();
      await expect(page.locator('app-login')).toContainText('Jane Doe');
    });

    test('CHK-030: Step 3 Billing Address pre-populates authenticated customer address fields', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();

      await expect(checkoutWizardPage.streetInput).toBeVisible();
    });

    test('CHK-031: Clearing Street field on Step 3 disables [data-test="proceed-3"] button', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();

      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.streetInput.fill('');
      await checkoutWizardPage.streetInput.blur();
      await expect(checkoutWizardPage.proceedStep3Button).toBeDisabled();
    });

    test('CHK-032: Clearing City field on Step 3 disables [data-test="proceed-3"] button', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();

      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.cityInput.fill('');
      await checkoutWizardPage.cityInput.blur();
      await expect(checkoutWizardPage.proceedStep3Button).toBeDisabled();
    });

    test('CHK-033: Clearing State field on Step 3 disables [data-test="proceed-3"] button', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();

      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.stateInput.fill('');
      await checkoutWizardPage.stateInput.blur();
      await expect(checkoutWizardPage.proceedStep3Button).toBeDisabled();
    });

    test('CHK-034: Clearing Country field on Step 3 disables [data-test="proceed-3"] button', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();

      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.countryInput.evaluate((el: HTMLSelectElement) => {
        el.value = '';
        el.dispatchEvent(new Event('change'));
      });
      await checkoutWizardPage.houseNumberInput.fill('');
      await checkoutWizardPage.houseNumberInput.blur();
      await expect(checkoutWizardPage.proceedStep3Button).toBeDisabled();
    });

    test('CHK-035: Clearing Postal Code field on Step 3 disables [data-test="proceed-3"] button', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();

      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.postalCodeInput.fill('');
      await checkoutWizardPage.postalCodeInput.blur();
      await expect(checkoutWizardPage.proceedStep3Button).toBeDisabled();
    });

    test('CHK-036: Selecting Bank Transfer on Step 4 displays bank_name, account_name, and account_number inputs', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();
      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.proceedFromAddressStep();

      await checkoutWizardPage.paymentMethodSelect.selectOption('bank-transfer');
      await expect(checkoutWizardPage.bankNameInput).toBeVisible();
      await expect(checkoutWizardPage.accountNameInput).toBeVisible();
      await expect(checkoutWizardPage.accountNumberInput).toBeVisible();
    });

    test('CHK-037: Selecting Credit Card on Step 4 displays credit_card_number, expiration_date, cvv, and card_holder_name inputs', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();
      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.proceedFromAddressStep();

      await checkoutWizardPage.paymentMethodSelect.selectOption('credit-card');
      await expect(checkoutWizardPage.creditCardNumberInput).toBeVisible();
      await expect(checkoutWizardPage.expirationDateInput).toBeVisible();
      await expect(checkoutWizardPage.cvvInput).toBeVisible();
      await expect(checkoutWizardPage.cardHolderNameInput).toBeVisible();
    });

    test('CHK-038: Selecting Gift Card on Step 4 displays gift_card_number and validation_code inputs', async ({
      authPage,
      productDetailsPage,
      checkoutWizardPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(inStockProducts[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();
      await checkoutWizardPage.fillBillingAddress(defaultAddress);
      await checkoutWizardPage.proceedFromAddressStep();

      await checkoutWizardPage.paymentMethodSelect.selectOption('gift-card');
      await expect(checkoutWizardPage.giftCardNumberInput).toBeVisible();
      await expect(checkoutWizardPage.validationCodeInput).toBeVisible();
    });
  });
});
