import { test, expect } from '@fixtures/base.fixture';
import { SECURITY_PAYLOADS, SecurityHelper } from '@utils/security.helper';
import { generateToolshopJwt, TOOLSHOP_USERS } from '@data/toolshop.users.data';

test.describe('Suite 10: OWASP Security Hardening, XSS/SQLi Sanitization, JWT Tampering & RBAC Route Guards', () => {
  test.describe('Parameterized XSS, SQLi & Injection Sanitization in Catalog Search & Login (13 Payloads)', () => {
    for (const [idx, secPayload] of SECURITY_PAYLOADS.entries()) {
      const testId = `SEC-${String(idx + 1).padStart(3, '0')}`;
      test(`${testId}: [${secPayload.id} - ${secPayload.category}] "${secPayload.label}" in catalog search and login inputs is neutralized without script execution`, async ({
        catalogPage,
        authPage,
        page,
      }) => {
        await catalogPage.open();
        await catalogPage.searchForProduct(secPayload.payload);
        expect(await SecurityHelper.verifyNoXssExecution(page)).toBe(true);

        await authPage.openLogin();
        await authPage.login(secPayload.payload, secPayload.payload);
        expect(await SecurityHelper.verifyNoXssExecution(page)).toBe(true);

        const token = await authPage.getLocalStorageItem('auth-token');
        expect(token).toBeNull();
      });
    }
  });

  test.describe('Unauthenticated Route Guard Enforcement & RBAC Privilege Escalation Prevention', () => {
    const protectedCustomerRoutes = [
      '/account',
      '/account/profile',
      '/account/favorites',
      '/account/invoices',
      '/account/messages',
    ];

    for (const [rIdx, routePath] of protectedCustomerRoutes.entries()) {
      const testId = `SEC-${String(rIdx + 14).padStart(3, '0')}`;
      test(`${testId}: Unauthenticated direct navigation to "${routePath}" is blocked by AuthGuard and redirected to /auth/login`, async ({
        authPage,
        page,
      }) => {
        await authPage.navigateTo(routePath);
        await expect(page).toHaveURL(/\/auth\/login/);
      });
    }

    const protectedAdminRoutes = [
      '/admin/dashboard',
      '/admin/products',
      '/admin/orders',
      '/admin/users',
    ];

    for (const [aIdx, adminRoute] of protectedAdminRoutes.entries()) {
      const testId = `SEC-${String(aIdx + 19).padStart(3, '0')}`;
      test(`${testId}: Standard customer (role="user") attempting privilege escalation to "${adminRoute}" is blocked by AdminAuthGuard`, async ({
        authPage,
        page,
      }) => {
        await authPage.authenticateAsCustomer('customer');
        await authPage.navigateTo(adminRoute);
        await expect(page).toHaveURL(/\/auth\/login/);
      });
    }
  });

  test.describe('JWT Token Expiration, Tampering & Contact Form Injection Defense', () => {
    test('SEC-023: Expired JWT token in localStorage is rejected by AuthGuard when navigating to /account', async ({
      authPage,
      page,
    }) => {
      const expiredToken = generateToolshopJwt({
        sub: TOOLSHOP_USERS.customer.id,
        role: 'user',
        expiresInSeconds: -3600,
      });
      await authPage.navigateTo('/');
      await authPage.setLocalStorageItem('auth-token', expiredToken);

      await authPage.navigateTo('/account');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('SEC-024: Malformed/corrupted JWT token string in localStorage does not crash SPA and redirects to /auth/login', async ({
      authPage,
      page,
    }) => {
      await authPage.navigateTo('/');
      const tamperedJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0YW1wZXJlZC11c2VyIiwicm9sZSI6InVzZXIiLCJleHAiOjF9.tampered_signature';
      await authPage.setLocalStorageItem('auth-token', tamperedJwt);

      await authPage.navigateTo('/account');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('SEC-025: Injecting XSS payload into Contact Support ticket message field is sanitized without DOM execution', async ({
      contactPage,
      page,
    }) => {
      await contactPage.open();
      await contactPage.firstNameInput.fill('<script>window.__xss_triggered=true</script>');
      await contactPage.lastNameInput.fill('<img src=x onerror="window.__xss_triggered=true">');
      await contactPage.emailInput.fill('sec.audit@example.com');
      await contactPage.subjectSelect.selectOption('webmaster');
      await contactPage.messageInput.fill(
        '<script>window.__xss_triggered = true;</script> Security audit payload testing minimum 50 character length requirement.'
      );
      await contactPage.contactSubmitButton.click();

      await expect(contactPage.successAlert).toBeVisible();
      expect(await SecurityHelper.verifyNoXssExecution(page)).toBe(true);
    });

    test('SEC-026: Purging session state clears localStorage auth-token and sessionStorage cart_id', async ({
      authPage,
      productDetailsPage,
      page,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById('01JTOOLSHOPPROD00000000001');
      await productDetailsPage.addToCart(1);

      await SecurityHelper.purgeSessionState(page);
      const token = await authPage.getLocalStorageItem('auth-token');
      const cartId = await authPage.getSessionStorageItem('cart_id');
      expect(token).toBeNull();
      expect(cartId).toBeNull();
    });
  });
});
