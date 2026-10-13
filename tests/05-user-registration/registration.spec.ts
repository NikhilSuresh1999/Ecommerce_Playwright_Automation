import { test, expect } from '@fixtures/base.fixture';
import {
  REGISTRATION_PROFILES,
  TOOLSHOP_USERS,
} from '@data/toolshop.users.data';

test.describe('Suite 05: Customer Registration, International Address Profiles & Reactive Form Validation', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.openRegister();
  });

  test.describe('Parameterized International Customer Registration Matrix (10 Profiles)', () => {
    for (const [idx, profile] of REGISTRATION_PROFILES.entries()) {
      const testId = `REG-${String(idx + 1).padStart(3, '0')}`;
      test(`${testId}: [${profile.profileId}] Registering "${profile.firstName} ${profile.lastName}" (${profile.country} - ${profile.label}) succeeds and redirects to /auth/login`, async ({
        authPage,
        page,
      }) => {
        await authPage.submitRegistration(profile);
        await expect(page).toHaveURL(/\/auth\/login/);
      });
    }
  });

  test.describe('Required Field Validation Rules on Empty Form Submission', () => {
    test('REG-011: Submitting completely empty registration form triggers [data-test="first-name-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.firstNameError).toBeVisible();
      await expect(authPage.firstNameError).toContainText('First name is required');
    });

    test('REG-012: Submitting empty form triggers [data-test="last-name-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.lastNameError).toBeVisible();
      await expect(authPage.lastNameError).toContainText('Last name is required');
    });

    test('REG-013: Submitting empty form triggers [data-test="dob-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.dobError).toBeVisible();
      await expect(authPage.dobError).toContainText('Date of Birth is required');
    });

    test('REG-014: Submitting empty form triggers [data-test="street-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.streetError).toBeVisible();
      await expect(authPage.streetError).toContainText('Street is required');
    });

    test('REG-015: Submitting empty form triggers [data-test="postal_code-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.postalCodeError).toBeVisible();
      await expect(authPage.postalCodeError).toContainText('Postcode is required');
    });

    test('REG-016: Submitting empty form triggers [data-test="city-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.cityError).toBeVisible();
      await expect(authPage.cityError).toContainText('City is required');
    });

    test('REG-017: Submitting empty form triggers [data-test="state-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.stateError).toBeVisible();
      await expect(authPage.stateError).toContainText('State is required');
    });

    test('REG-018: Submitting empty form triggers [data-test="country-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.countryError).toBeVisible();
      await expect(authPage.countryError).toContainText('Country is required');
    });

    test('REG-019: Submitting empty form triggers [data-test="phone-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.phoneError).toBeVisible();
      await expect(authPage.phoneError).toContainText('Phone is required');
    });

    test('REG-020: Submitting empty form triggers [data-test="email-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.emailError).toBeVisible();
      await expect(authPage.emailError).toContainText('Email is required');
    });

    test('REG-021: Submitting empty form triggers [data-test="password-error"]', async ({
      authPage,
    }) => {
      await authPage.registerSubmitButton.click();
      await expect(authPage.passwordError).toBeVisible();
      await expect(authPage.passwordError).toContainText('Password is required');
    });
  });

  test.describe('Password Complexity, Format & Duplicate Email Constraints', () => {
    const baseProfile = REGISTRATION_PROFILES[0];

    test('REG-022: Password shorter than 8 characters triggers minimum length error', async ({
      authPage,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        email: 'shortpass@example.com',
        password: 'Ab1!',
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.passwordError).toBeVisible();
      await expect(authPage.passwordError).toContainText('Password must be minimal 6 characters');
    });

    test('REG-023: Non-numeric phone value triggers [data-test="phone-error"] format validation', async ({
      authPage,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        email: 'badphone@example.com',
        phone: 'ABCDEFG-INVALID',
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.phoneError).toBeVisible();
      await expect(authPage.phoneError).toContainText('Only numbers are allowed');
    });

    test('REG-024: Invalid email format on registration triggers [data-test="email-error"]', async ({
      authPage,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        email: 'not-an-email-address',
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.emailError).toBeVisible();
    });

    test('REG-025: Registering with already existing customer email displays [data-test="register-error"]', async ({
      authPage,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        email: TOOLSHOP_USERS.customer.email,
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.registerError).toBeVisible();
      await expect(authPage.registerError).toContainText(
        'A customer with this email address already exists'
      );
    });

    test('REG-026: End-to-end newly registered customer can immediately log in with their new credentials', async ({
      authPage,
      page,
      navbar,
    }) => {
      const uniqueEmail = `e2e.newuser.${Date.now()}@example.com`;
      const profile = {
        ...baseProfile,
        firstName: 'Evelyn',
        lastName: 'Vance',
        email: uniqueEmail,
      };
      await authPage.submitRegistration(profile);
      await expect(page).toHaveURL(/\/auth\/login/);

      await authPage.login(uniqueEmail, profile.password);
      await expect(page).toHaveURL(/\/account/);
      await expect(navbar.navMenu).toContainText('Evelyn Vance');
    });

    test('REG-027: Country selector dropdown contains major ISO country codes (US, GB, DE, FR, NL, AT, AU, CA)', async ({
      authPage,
    }) => {
      const optionValues = await authPage.countrySelect
        .locator('option')
        .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
      for (const code of ['US', 'GB', 'DE', 'FR', 'NL', 'AT', 'AU', 'CA']) {
        expect(optionValues).toContain(code);
      }
    });

    test('REG-028: Correcting an invalid phone number dynamically clears [data-test="phone-error"] upon re-submission', async ({
      authPage,
      page,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        email: `fixphone.${Date.now()}@example.com`,
        phone: 'INVALID-PHONE',
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.phoneError).toBeVisible();

      await authPage.phoneInput.fill('01234567890');
      await authPage.phoneInput.blur();
      await authPage.registerSubmitButton.click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('REG-029: Underage Date of Birth (future or < 18 years old) is rejected with age validation message', async ({
      authPage,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        email: `underage.${Date.now()}@example.com`,
        dob: '2024-01-01',
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.registerError.or(authPage.dobError).first()).toBeVisible();
    });

    test('REG-030: Registration form inputs retain typed values when submission fails due to duplicate email', async ({
      authPage,
    }) => {
      await authPage.fillRegistrationForm({
        ...baseProfile,
        firstName: 'PersistentName',
        email: TOOLSHOP_USERS.customer.email,
      });
      await authPage.registerSubmitButton.click();
      await expect(authPage.registerError).toBeVisible();
      await expect(authPage.firstNameInput).toHaveValue('PersistentName');
    });

    test('REG-031: Password input on registration page has type="password" attribute', async ({
      authPage,
    }) => {
      await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('REG-032: Registration page displays accessible form labels for all 11 customer profile fields', async ({
      page,
    }) => {
      const labels = page.locator('label');
      const count = await labels.count();
      expect(count).toBeGreaterThanOrEqual(11);
    });
  });
});
