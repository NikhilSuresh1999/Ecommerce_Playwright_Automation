import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import {
  RegistrationCustomerProfile,
  TOOLSHOP_USERS,
  generateToolshopJwt,
} from '@data/toolshop.users.data';

export class AuthPage extends BasePage {
  // Login form locators
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly loginSubmitButton: Locator;
  public readonly emailError: Locator;
  public readonly passwordError: Locator;
  public readonly loginError: Locator;
  public readonly registerLink: Locator;
  public readonly forgotPasswordLink: Locator;

  // Registration form locators
  public readonly firstNameInput: Locator;
  public readonly lastNameInput: Locator;
  public readonly dobInput: Locator;
  public readonly streetInput: Locator;
  public readonly postalCodeInput: Locator;
  public readonly houseNumberInput: Locator;
  public readonly cityInput: Locator;
  public readonly stateInput: Locator;
  public readonly countrySelect: Locator;
  public readonly phoneInput: Locator;
  public readonly registerSubmitButton: Locator;

  // Registration validation locators
  public readonly firstNameError: Locator;
  public readonly lastNameError: Locator;
  public readonly dobError: Locator;
  public readonly streetError: Locator;
  public readonly postalCodeError: Locator;
  public readonly cityError: Locator;
  public readonly stateError: Locator;
  public readonly countryError: Locator;
  public readonly phoneError: Locator;
  public readonly registerError: Locator;

  // Forgot Password locators
  public readonly forgotPasswordSubmitButton: Locator;
  public readonly forgotPasswordSuccessAlert: Locator;

  constructor(page: Page) {
    super(page, 'AuthPage');
    this.emailInput = page.locator('[data-test="email"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginSubmitButton = page.locator('[data-test="login-submit"]');
    this.emailError = page.locator('[data-test="email-error"]');
    this.passwordError = page.locator('[data-test="password-error"]');
    this.loginError = page.locator('[data-test="login-error"]');
    this.registerLink = page.locator('[data-test="register-link"]');
    this.forgotPasswordLink = page.locator('[data-test="forgot-password-link"]');

    this.firstNameInput = page.locator('[data-test="first-name"]');
    this.lastNameInput = page.locator('[data-test="last-name"]');
    this.dobInput = page.locator('[data-test="dob"]');
    this.streetInput = page.locator('[data-test="street"]');
    this.postalCodeInput = page.locator('[data-test="postal_code"]');
    this.houseNumberInput = page.locator('[data-test="house_number"]');
    this.cityInput = page.locator('[data-test="city"]');
    this.stateInput = page.locator('[data-test="state"]');
    this.countrySelect = page.locator('[data-test="country"]');
    this.phoneInput = page.locator('[data-test="phone"]');
    this.registerSubmitButton = page.locator('[data-test="register-submit"]');

    this.firstNameError = page.locator('[data-test="first-name-error"]');
    this.lastNameError = page.locator('[data-test="last-name-error"]');
    this.dobError = page.locator('[data-test="dob-error"]');
    this.streetError = page.locator('[data-test="street-error"]');
    this.postalCodeError = page.locator('[data-test="postal_code-error"]');
    this.cityError = page.locator('[data-test="city-error"]');
    this.stateError = page.locator('[data-test="state-error"]');
    this.countryError = page.locator('[data-test="country-error"]');
    this.phoneError = page.locator('[data-test="phone-error"]');
    this.registerError = page.locator('[data-test="register-error"]');

    this.forgotPasswordSubmitButton = page.locator('[data-test="forgot-password-submit"]');
    this.forgotPasswordSuccessAlert = page.locator('.alert-success');
  }

  public async openLogin(): Promise<void> {
    await this.navigateTo('/auth/login');
    await expect(this.emailInput).toBeVisible();
  }

  public async openRegister(): Promise<void> {
    await this.navigateTo('/auth/register');
    await expect(this.firstNameInput).toBeVisible();
  }

  public async openForgotPassword(): Promise<void> {
    await this.navigateTo('/auth/forgot-password');
    await expect(this.emailInput).toBeVisible();
  }

  public async login(email: string, password: string): Promise<void> {
    this.logger.step(`Submitting login for email: ${email}`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginSubmitButton.click();
  }

  public async fillRegistrationForm(profile: RegistrationCustomerProfile): Promise<void> {
    await this.firstNameInput.fill(profile.firstName);
    await this.lastNameInput.fill(profile.lastName);
    await this.dobInput.fill(profile.dob);
    if (profile.country) {
      await this.countrySelect.selectOption(profile.country);
    }
    await this.postalCodeInput.fill(profile.postalCode);
    if ((await this.houseNumberInput.count()) > 0) {
      await this.houseNumberInput.fill('98');
    }
    await this.streetInput.fill(profile.street);
    await this.cityInput.fill(profile.city);
    await this.stateInput.fill(profile.state);
    await this.phoneInput.fill(profile.phone);
    await this.emailInput.fill(profile.email);
    await this.passwordInput.fill(profile.password);
    await this.passwordInput.blur();
  }

  public async submitRegistration(profile: RegistrationCustomerProfile): Promise<void> {
    await this.fillRegistrationForm(profile);
    await this.registerSubmitButton.click();
  }

  public async submitForgotPassword(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.forgotPasswordSubmitButton.click();
  }

  /**
   * Fast JWT injection into localStorage for authenticated workflow suites
   */
  public async authenticateAsCustomer(
    userKey: 'customer' | 'customer2' = 'customer'
  ): Promise<string> {
    const user = TOOLSHOP_USERS[userKey];
    const token = generateToolshopJwt({ sub: user.id, role: user.role });
    await this.navigateTo('/');
    await this.setLocalStorageItem('auth-token', token);
    return token;
  }

  public async authenticateAsAdmin(): Promise<string> {
    const admin = TOOLSHOP_USERS.admin;
    const token = generateToolshopJwt({ sub: admin.id, role: 'admin' });
    await this.navigateTo('/');
    await this.setLocalStorageItem('auth-token', token);
    return token;
  }
}
