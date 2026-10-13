import { test, expect } from '@fixtures/base.fixture';
import { TOOLSHOP_USERS } from '@data/toolshop.users.data';
import { TOOLSHOP_PRODUCTS } from '@data/toolshop.catalog.data';

test.describe('Suite 08: Customer Account Portal, Profile Management, Favorites Wishlist & Invoices', () => {
  const customer = TOOLSHOP_USERS.customer;

  test.beforeEach(async ({ authPage }) => {
    await authPage.authenticateAsCustomer('customer');
  });

  test.describe('Account Portal Dashboard & Sub-Navigation', () => {
    test('ACC-001: Account dashboard (/account) renders page title and all 4 portal navigation links', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openDashboard();
      await expect(accountPortalPage.pageTitle).toContainText('My account');
      await expect(accountPortalPage.navFavoritesLink).toBeVisible();
      await expect(accountPortalPage.navProfileLink).toBeVisible();
      await expect(accountPortalPage.navInvoicesLink).toBeVisible();
      await expect(accountPortalPage.navMessagesLink).toBeVisible();
    });

    test('ACC-002: Clicking [data-test="nav-favorites"] on /account navigates to /account/favorites', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openDashboard();
      await accountPortalPage.navFavoritesLink.click();
      await expect(page).toHaveURL(/\/account\/favorites/);
      await expect(accountPortalPage.pageTitle).toContainText('Favorites');
    });

    test('ACC-003: Clicking [data-test="nav-profile"] on /account navigates to /account/profile', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openDashboard();
      await accountPortalPage.navProfileLink.click();
      await expect(page).toHaveURL(/\/account\/profile/);
      await expect(accountPortalPage.firstNameInput).toBeVisible();
    });

    test('ACC-004: Clicking [data-test="nav-invoices"] on /account navigates to /account/invoices', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openDashboard();
      await accountPortalPage.navInvoicesLink.click();
      await expect(page).toHaveURL(/\/account\/invoices/);
      await expect(accountPortalPage.pageTitle).toContainText('Invoices');
    });

    test('ACC-005: Clicking [data-test="nav-messages"] on /account navigates to /account/messages', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openDashboard();
      await accountPortalPage.navMessagesLink.click();
      await expect(page).toHaveURL(/\/account\/messages/);
      await expect(accountPortalPage.pageTitle).toContainText('Messages');
    });
  });

  test.describe('Customer Profile Inspection, Address Mutation & Password Change', () => {
    test('ACC-006: Profile page (/account/profile) pre-populates customer first name and last name', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openProfile();
      await expect(accountPortalPage.firstNameInput).toHaveValue(customer.first_name);
      await expect(accountPortalPage.lastNameInput).toHaveValue(customer.last_name);
    });

    test('ACC-007: Profile page pre-populates customer email address and phone number', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openProfile();
      await expect(accountPortalPage.emailInput).toHaveValue(customer.email);
      await expect(accountPortalPage.phoneInput).toHaveValue(customer.phone);
    });

    test('ACC-008: Profile page pre-populates customer street, postal code, city, state, and country', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openProfile();
      await expect(accountPortalPage.streetInput).toHaveValue(customer.address.street);
      await expect(accountPortalPage.postalCodeInput).toHaveValue(customer.address.postal_code);
      await expect(accountPortalPage.cityInput).toHaveValue(customer.address.city);
      await expect(accountPortalPage.stateInput).toHaveValue(customer.address.state);
      await expect(accountPortalPage.countryInput).toHaveValue(customer.address.country);
    });

    test('ACC-009: Updating customer phone number on /account/profile persists and displays success alert', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openProfile();
      await accountPortalPage.phoneInput.fill('0199887766');
      await accountPortalPage.updateProfileSubmit.click();
      await expect(page.locator('.alert-success')).toBeVisible();
    });

    test('ACC-010: Updating customer street address on /account/profile persists and displays success alert', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openProfile();
      await accountPortalPage.streetInput.fill('Ringstrasse 42');
      await accountPortalPage.updateProfileSubmit.click();
      await expect(page.locator('.alert-success')).toBeVisible();
    });

    test('ACC-011: Updating customer city and postal code on /account/profile succeeds', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openProfile();
      await accountPortalPage.cityInput.fill('Salzburg');
      await accountPortalPage.postalCodeInput.fill('5020');
      await accountPortalPage.updateProfileSubmit.click();
      await expect(page.locator('.alert-success')).toBeVisible();
    });

    test('ACC-012: Profile page renders Change Password section with current, new, and confirm password inputs', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openProfile();
      await expect(accountPortalPage.currentPasswordInput).toBeVisible();
      await expect(accountPortalPage.newPasswordInput).toBeVisible();
      await expect(accountPortalPage.newPasswordConfirmInput).toBeVisible();
      await expect(accountPortalPage.changePasswordSubmit).toBeVisible();
    });

    test('ACC-013: Password inputs on /account/profile enforce type="password" masking', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openProfile();
      await expect(accountPortalPage.currentPasswordInput).toHaveAttribute('type', 'password');
      await expect(accountPortalPage.newPasswordInput).toHaveAttribute('type', 'password');
      await expect(accountPortalPage.newPasswordConfirmInput).toHaveAttribute('type', 'password');
    });

    test('ACC-014: Secondary customer (Jack Howe) sees his own isolated profile data on /account/profile', async ({
      authPage,
      accountPortalPage,
    }) => {
      await authPage.authenticateAsCustomer('customer2');
      await accountPortalPage.openProfile();
      await expect(accountPortalPage.firstNameInput).toHaveValue(TOOLSHOP_USERS.customer2.first_name);
      await expect(accountPortalPage.lastNameInput).toHaveValue(TOOLSHOP_USERS.customer2.last_name);
      await expect(accountPortalPage.cityInput).toHaveValue(TOOLSHOP_USERS.customer2.address.city);
    });
  });

  test.describe('Favorites Wishlist Management (/account/favorites)', () => {
    test('ACC-015: Favorites page renders seeded wishlist product cards', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openFavorites();
      await expect(accountPortalPage.favoriteCards).toHaveCount(2);
    });

    test('ACC-016: Each favorite card displays product name and description', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openFavorites();
      const firstCard = accountPortalPage.favoriteCards.first();
      await expect(firstCard.locator('[data-test="product-name"]')).toHaveText(
        TOOLSHOP_PRODUCTS[0].name
      );
      await expect(firstCard.locator('[data-test="product-description"]')).toBeVisible();
    });

    test('ACC-017: Clicking [data-test="delete"] on a favorite card removes it from the wishlist', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openFavorites();
      await expect(accountPortalPage.favoriteCards).toHaveCount(2);

      await accountPortalPage.deleteFavoriteButtons.first().click();
      await expect(accountPortalPage.favoriteCards).toHaveCount(1);
    });

    test('ACC-018: Adding a new product to favorites from PDP appends it to /account/favorites', async ({
      productDetailsPage,
      accountPortalPage,
    }) => {
      await productDetailsPage.openProductById(TOOLSHOP_PRODUCTS[2].id);
      await productDetailsPage.addToFavoritesBtn.click();
      await expect(productDetailsPage.toastAlert.first()).toBeVisible();

      await accountPortalPage.openFavorites();
      await expect(accountPortalPage.favoriteCards).toHaveCount(3);
    });

    test('ACC-019: Deleting all favorites from /account/favorites displays empty wishlist message', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openFavorites();
      await accountPortalPage.deleteFavoriteButtons.first().click();
      await expect(accountPortalPage.favoriteCards).toHaveCount(1);

      await accountPortalPage.deleteFavoriteButtons.first().click();
      await expect(accountPortalPage.favoriteCards).toHaveCount(0);
      await expect(page.locator('app-favorites')).toContainText('There are no favorites yet');
    });
  });

  test.describe('Order Invoices & Support Ticket History (/account/invoices & /account/messages)', () => {
    test('ACC-020: Invoices page (/account/invoices) lists customer historical invoices with invoice numbers and totals', async ({
      accountPortalPage,
    }) => {
      await accountPortalPage.openInvoices();
      await expect(accountPortalPage.invoiceNumberCells.first()).toHaveText('INV-20260001');
      await expect(accountPortalPage.invoiceTotalCells.first()).toContainText('$80.69');
    });

    test('ACC-021: Clicking Details on an invoice row opens /account/invoices/:id with full billing and line item breakdown', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openInvoices();
      const firstDetailsLink = page.locator('table tbody tr a').first();
      await firstDetailsLink.click();

      await expect(page).toHaveURL(/\/account\/invoices\//);
      await expect(page.locator('[data-test="invoice-number"]')).toHaveValue('INV-20260001');
      await expect(page.locator('[data-test="street"]')).toHaveValue('Test street 98');
      await expect(page.locator('[data-test="city"]')).toHaveValue('Vienna');
    });

    test('ACC-022: Invoice detail page renders Download PDF button ([data-test="download-invoice"])', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openInvoices();
      await page.locator('table tbody tr a').first().click();
      await expect(page.locator('[data-test="download-invoice"]')).toBeVisible();
    });

    test('ACC-023: Completing a new checkout order adds a new invoice record to /account/invoices', async ({
      productDetailsPage,
      checkoutWizardPage,
      accountPortalPage,
    }) => {
      await productDetailsPage.openProductById(TOOLSHOP_PRODUCTS[0].id);
      await productDetailsPage.addToCart(1);
      await checkoutWizardPage.openCheckout();
      await checkoutWizardPage.proceedFromCartStep();
      await checkoutWizardPage.proceedFromSignInStep();
      await checkoutWizardPage.fillBillingAddress(customer.address);
      await checkoutWizardPage.proceedFromAddressStep();
      await checkoutWizardPage.paymentMethodSelect.selectOption('cash-on-delivery');
      await checkoutWizardPage.confirmPayment();
      await expect(checkoutWizardPage.paymentSuccessMessage).toBeVisible();

      await accountPortalPage.openInvoices();
      const count = await accountPortalPage.invoiceNumberCells.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('ACC-024: Messages page (/account/messages) displays customer support ticket history table', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openMessages();
      const rows = page.locator('table tbody tr');
      await expect(rows.first()).toBeVisible();
      await expect(rows.first()).toContainText('warranty');
    });

    test('ACC-025: Clicking Details on a support message opens /account/messages/:id conversation thread', async ({
      accountPortalPage,
      page,
    }) => {
      await accountPortalPage.openMessages();
      await page.locator('table tbody tr a').first().click();
      await expect(page).toHaveURL(/\/account\/messages\//);
      await expect(page.locator('[data-test="message"]')).toBeVisible();
      await expect(page.locator('[data-test="reply-submit"]')).toBeVisible();
    });

    test('ACC-026: Top navbar user menu ([data-test="nav-menu"]) exposes quick links to My Account, Favorites, Profile, Invoices, and Messages', async ({
      accountPortalPage,
      navbar,
    }) => {
      await accountPortalPage.openDashboard();
      await navbar.navMenu.click();
      await expect(navbar.navMyAccount).toBeVisible();
      await expect(navbar.navMyProfile).toBeVisible();
      await expect(navbar.navMyInvoices).toBeVisible();
      await expect(navbar.navMyFavorites).toBeVisible();
      await expect(navbar.navMyMessages).toBeVisible();
    });
  });
});
