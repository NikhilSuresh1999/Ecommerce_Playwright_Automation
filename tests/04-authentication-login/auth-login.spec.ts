import { test, expect } from '@fixtures/base.fixture';
import {
  TOOLSHOP_USERS,
  NEGATIVE_LOGIN_SCENARIOS,
} from '@data/toolshop.users.data';

test.describe('Suite 04: Authentication, JWT Session Management, Brute-Force Lockout & Password Reset', () => {
  test.describe('Positive Role-Based Authentication Flows', () => {
    test('AUTH-001: Customer account (Jane Doe) logs in, receives JWT token, and redirects to /account', async ({
      authPage,
      navbar,
      page,
    }) => {
      const customer = TOOLSHOP_USERS.customer;
      await authPage.openLogin();
      await authPage.login(customer.email, customer.password);

      await expect(page).toHaveURL(/\/account/);
      await expect(navbar.navMenu).toContainText(`${customer.first_name} ${customer.last_name}`);

      const token = await authPage.getLocalStorageItem('auth-token');
      expect(token).toBeTruthy();
      expect(token?.split('.').length).toBe(3);
    });

    test('AUTH-002: Secondary customer account (Jack Howe) logs in and displays full name in navbar menu', async ({
      authPage,
      navbar,
      page,
    }) => {
      const customer2 = TOOLSHOP_USERS.customer2;
      await authPage.openLogin();
      await authPage.login(customer2.email, customer2.password);

      await expect(page).toHaveURL(/\/account/);
      await expect(navbar.navMenu).toContainText(`${customer2.first_name} ${customer2.last_name}`);
    });

    test('AUTH-003: Administrator account (John Doe) logs in with admin role claim in JWT payload', async ({
      authPage,
      navbar,
    }) => {
      const admin = TOOLSHOP_USERS.admin;
      await authPage.openLogin();
      await authPage.login(admin.email, admin.password);

      await expect(navbar.navMenu).toContainText(`${admin.first_name} ${admin.last_name}`);
      const token = await authPage.getLocalStorageItem('auth-token');
      expect(token).toBeTruthy();
      const payloadJson = JSON.parse(
        Buffer.from(token!.split('.')[1], 'base64url').toString('utf-8')
      );
      expect(payloadJson.role).toBe('admin');
    });
  });

  test.describe('Parameterized Negative Login Validation Matrix (16 Scenarios)', () => {
    for (const [idx, scenario] of NEGATIVE_LOGIN_SCENARIOS.entries()) {
      const testId = `AUTH-${String(idx + 4).padStart(3, '0')}`;
      test(`${testId}: [${scenario.caseId}] ${scenario.description} triggers [${scenario.expectedErrorField}]`, async ({
        authPage,
        page,
      }) => {
        await authPage.openLogin();
        await authPage.login(scenario.email, scenario.password);

        const errorLocator = page.locator(`[data-test="${scenario.expectedErrorField}"]`);
        await expect(errorLocator).toBeVisible();
        await expect(errorLocator).toContainText(scenario.expectedMessageSubstring);

        const token = await authPage.getLocalStorageItem('auth-token');
        expect(token).toBeNull();
      });
    }
  });

  test.describe('Account Lockout, Session Lifecycle & Password Recovery', () => {
    test('AUTH-020: Locked user account (locked@practicesoftwaretesting.com) is rejected with HTTP 423 lockout alert', async ({
      authPage,
    }) => {
      const locked = TOOLSHOP_USERS.locked;
      await authPage.openLogin();
      await authPage.login(locked.email, locked.password);

      await expect(authPage.loginError).toBeVisible();
      await expect(authPage.loginError).toContainText('Account locked');
    });

    test('AUTH-021: Consecutive failed password attempts on valid customer account trigger brute-force lockout', async ({
      authPage,
    }) => {
      const customer2 = TOOLSHOP_USERS.customer2;
      await authPage.openLogin();

      for (let attempt = 1; attempt <= 4; attempt++) {
        await authPage.login(customer2.email, `WrongPassAttempt${attempt}!`);
        await expect(authPage.loginError).toBeVisible();
      }

      await expect(authPage.loginError).toContainText('Account locked');
    });

    test('AUTH-022: Signing out via [data-test="nav-sign-out"] purges JWT token and restores Sign In link', async ({
      authPage,
      navbar,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await authPage.navigateTo('/account');
      await expect(navbar.navMenu).toBeVisible();

      await navbar.signOut();
      await expect(navbar.navSignIn).toBeVisible();
      const token = await authPage.getLocalStorageItem('auth-token');
      expect(token).toBeNull();
    });

    test('AUTH-023: Clicking [data-test="register-link"] on login page navigates to /auth/register', async ({
      authPage,
      page,
    }) => {
      await authPage.openLogin();
      await authPage.registerLink.click();
      await expect(page).toHaveURL(/\/auth\/register/);
      await expect(authPage.firstNameInput).toBeVisible();
    });

    test('AUTH-024: Clicking [data-test="forgot-password-link"] on login page navigates to /auth/forgot-password', async ({
      authPage,
      page,
    }) => {
      await authPage.openLogin();
      await authPage.forgotPasswordLink.click();
      await expect(page).toHaveURL(/\/auth\/forgot-password/);
      await expect(authPage.forgotPasswordSubmitButton).toBeVisible();
    });

    test('AUTH-025: Submitting registered email on /auth/forgot-password displays reset confirmation alert', async ({
      authPage,
    }) => {
      await authPage.openForgotPassword();
      await authPage.submitForgotPassword(TOOLSHOP_USERS.customer.email);
      await expect(authPage.forgotPasswordSuccessAlert).toBeVisible();
    });

    test('AUTH-026: Submitting empty email on /auth/forgot-password displays [data-test="email-error"]', async ({
      authPage,
    }) => {
      await authPage.openForgotPassword();
      await authPage.submitForgotPassword('');
      await expect(authPage.emailError).toBeVisible();
      await expect(authPage.emailError).toContainText('Email is required');
    });

    test('AUTH-027: Submitting malformed email on /auth/forgot-password displays format validation error', async ({
      authPage,
    }) => {
      await authPage.openForgotPassword();
      await authPage.submitForgotPassword('invalid-reset-email');
      await expect(authPage.emailError).toBeVisible();
      await expect(authPage.emailError).toHaveClass(/alert-danger/);
    });

    test('AUTH-028: Password input on /auth/login enforces type="password" masking by default', async ({
      authPage,
    }) => {
      await authPage.openLogin();
      await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('AUTH-029: JWT token issued on login contains valid Base64URL header, sub, role, iat, and exp claims', async ({
      authPage,
    }) => {
      const token = await authPage.authenticateAsCustomer('customer');
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));

      expect(header.alg).toBe('HS256');
      expect(payload.sub).toBe(TOOLSHOP_USERS.customer.id);
      expect(payload.role).toBe('user');
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    test('AUTH-030: Reloading browser tab on /account preserves authenticated customer session', async ({
      authPage,
      navbar,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await authPage.navigateTo('/account');
      await expect(navbar.navMenu).toContainText('Jane Doe');

      await authPage.reloadPage();
      await expect(navbar.navMenu).toContainText('Jane Doe');
    });

    test('AUTH-031: Pressing Enter key inside password input submits login form and authenticates user', async ({
      authPage,
      page,
    }) => {
      const customer = TOOLSHOP_USERS.customer;
      await authPage.openLogin();
      await authPage.emailInput.fill(customer.email);
      await authPage.passwordInput.fill(customer.password);
      await authPage.passwordInput.press('Enter');

      await expect(page).toHaveURL(/\/account/);
    });

    test('AUTH-032: Case-insensitive email address login (UPPERCASE email) succeeds seamlessly', async ({
      authPage,
      page,
    }) => {
      const customer = TOOLSHOP_USERS.customer;
      await authPage.openLogin();
      await authPage.login(customer.email.toUpperCase(), customer.password);

      await expect(page).toHaveURL(/\/account/);
    });

    test('AUTH-033: Unauthenticated direct access to /account redirects user to /auth/login', async ({
      authPage,
      page,
    }) => {
      await authPage.navigateTo('/account');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('AUTH-034: Unauthenticated direct access to /account/invoices redirects user to /auth/login', async ({
      authPage,
      page,
    }) => {
      await authPage.navigateTo('/account/invoices');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
