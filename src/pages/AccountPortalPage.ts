import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountPortalPage extends BasePage {
  public readonly pageTitle: Locator;
  public readonly navFavoritesLink: Locator;
  public readonly navProfileLink: Locator;
  public readonly navInvoicesLink: Locator;
  public readonly navMessagesLink: Locator;

  // Profile fields
  public readonly firstNameInput: Locator;
  public readonly lastNameInput: Locator;
  public readonly emailInput: Locator;
  public readonly phoneInput: Locator;
  public readonly streetInput: Locator;
  public readonly postalCodeInput: Locator;
  public readonly cityInput: Locator;
  public readonly stateInput: Locator;
  public readonly countryInput: Locator;
  public readonly updateProfileSubmit: Locator;
  public readonly currentPasswordInput: Locator;
  public readonly newPasswordInput: Locator;
  public readonly newPasswordConfirmInput: Locator;
  public readonly changePasswordSubmit: Locator;

  // Favorites cards
  public readonly favoriteCards: Locator;
  public readonly deleteFavoriteButtons: Locator;

  // Invoices table
  public readonly invoiceRows: Locator;
  public readonly invoiceNumberCells: Locator;
  public readonly invoiceTotalCells: Locator;

  constructor(page: Page) {
    super(page, 'AccountPortalPage');
    this.pageTitle = page.locator('[data-test="page-title"]');
    this.navFavoritesLink = page.locator('[data-test="nav-favorites"]');
    this.navProfileLink = page.locator('[data-test="nav-profile"]');
    this.navInvoicesLink = page.locator('[data-test="nav-invoices"]');
    this.navMessagesLink = page.locator('[data-test="nav-messages"]');

    this.firstNameInput = page.locator('[data-test="first-name"]');
    this.lastNameInput = page.locator('[data-test="last-name"]');
    this.emailInput = page.locator('[data-test="email"]');
    this.phoneInput = page.locator('[data-test="phone"]');
    this.streetInput = page.locator('[data-test="street"]');
    this.postalCodeInput = page.locator('[data-test="postal_code"]');
    this.cityInput = page.locator('[data-test="city"]');
    this.stateInput = page.locator('[data-test="state"]');
    this.countryInput = page.locator('[data-test="country"]');
    this.updateProfileSubmit = page.locator('[data-test="update-profile-submit"]');
    this.currentPasswordInput = page.locator('[data-test="current-password"]');
    this.newPasswordInput = page.locator('[data-test="new-password"]');
    this.newPasswordConfirmInput = page.locator('[data-test="new-password-confirm"]');
    this.changePasswordSubmit = page.locator('[data-test="change-password-submit"]');

    this.favoriteCards = page.locator('[data-test^="favorite-"]');
    this.deleteFavoriteButtons = page.locator('[data-test="delete"]');

    this.invoiceRows = page.locator('table tbody tr');
    this.invoiceNumberCells = page.locator('table tbody tr td:nth-child(1)');
    this.invoiceTotalCells = page.locator('table tbody tr td:nth-child(4)');
  }

  public async openDashboard(): Promise<void> {
    await this.navigateTo('/account');
    await expect(this.pageTitle).toBeVisible();
  }

  public async openProfile(): Promise<void> {
    await this.navigateTo('/account/profile');
    await expect(this.firstNameInput).toBeVisible();
  }

  public async openFavorites(): Promise<void> {
    await this.navigateTo('/account/favorites');
    await expect(this.pageTitle).toBeVisible();
  }

  public async openInvoices(): Promise<void> {
    await this.navigateTo('/account/invoices');
    await expect(this.pageTitle).toBeVisible();
    await expect(this.invoiceRows.first()).toBeVisible();
  }

  public async openMessages(): Promise<void> {
    await this.navigateTo('/account/messages');
    await expect(this.pageTitle).toBeVisible();
  }
}
