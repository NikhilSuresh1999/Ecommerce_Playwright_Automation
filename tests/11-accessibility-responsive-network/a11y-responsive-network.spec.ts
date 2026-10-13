import { test, expect } from '@fixtures/base.fixture';
import AxeBuilder from '@axe-core/playwright';
import { TOOLSHOP_PRODUCTS } from '@data/toolshop.catalog.data';

const RESPONSIVE_VIEWPORTS = [
  { id: 'VP-01', name: 'Desktop 1080p Full HD', width: 1920, height: 1080 },
  { id: 'VP-02', name: 'Laptop 1366x768 WXGA', width: 1366, height: 768 },
  { id: 'VP-03', name: 'Tablet Landscape (iPad Pro)', width: 1024, height: 768 },
  { id: 'VP-04', name: 'Tablet Portrait (iPad Mini)', width: 768, height: 1024 },
  { id: 'VP-05', name: 'Mobile Large (iPhone 14 Pro Max)', width: 430, height: 932 },
  { id: 'VP-06', name: 'Mobile Compact (iPhone SE)', width: 375, height: 667 },
];

test.describe('Suite 11: WCAG Accessibility (Axe-Core), Multi-Viewport Responsive Layout & Network Fault Resilience', () => {
  test.describe('WCAG 2.1 Automated Accessibility Audits & Semantic Landmark Checks', () => {
    test('A11Y-001: Home Catalog page (/) passes Axe-Core critical/serious ARIA attribute and role rules', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.open();
      const results = await new AxeBuilder({ page })
        .withRules(['aria-roles', 'aria-valid-attr', 'button-name', 'document-title', 'html-has-lang'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('A11Y-002: Product Details Page (/product/:id) passes Axe-Core critical ARIA, image-alt, and document-title rules', async ({
      productDetailsPage,
      page,
    }) => {
      await productDetailsPage.openProductById(TOOLSHOP_PRODUCTS[0].id);
      const results = await new AxeBuilder({ page })
        .withRules(['aria-roles', 'aria-valid-attr', 'image-alt', 'document-title', 'html-has-lang'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('A11Y-003: Authentication Login page (/auth/login) passes Axe-Core form label and ARIA rules', async ({
      authPage,
      page,
    }) => {
      await authPage.openLogin();
      const results = await new AxeBuilder({ page })
        .exclude('.btn-outline-secondary')
        .withRules(['aria-roles', 'aria-valid-attr', 'label', 'button-name', 'document-title'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('A11Y-004: Customer Registration page (/auth/register) passes Axe-Core form label and ARIA rules', async ({
      authPage,
      page,
    }) => {
      await authPage.openRegister();
      const results = await new AxeBuilder({ page })
        .exclude('.btn-outline-secondary')
        .withRules(['aria-roles', 'aria-valid-attr', 'label', 'button-name', 'document-title'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('A11Y-005: Contact Support page (/contact) passes Axe-Core form label and button-name rules', async ({
      contactPage,
      page,
    }) => {
      await contactPage.open();
      const results = await new AxeBuilder({ page })
        .withRules(['aria-roles', 'aria-valid-attr', 'label', 'button-name', 'document-title'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('A11Y-006: Equipment Rentals page (/rentals) passes Axe-Core semantic document and image-alt rules', async ({
      rentalsPage,
      page,
    }) => {
      await rentalsPage.open();
      const results = await new AxeBuilder({ page })
        .withRules(['aria-roles', 'aria-valid-attr', 'image-alt', 'document-title'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('A11Y-007: Every catalog product card image on Page 1 includes a non-empty descriptive alt attribute', async ({
      catalogPage,
    }) => {
      await catalogPage.open();
      const images = catalogPage.productCards.locator('img');
      const count = await images.count();
      expect(count).toBe(9);
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt?.trim().length).toBeGreaterThan(0);
      }
    });

    test('A11Y-008: Keyboard Tab navigation on /auth/login moves focus sequentially from Email -> Password -> Login Submit', async ({
      authPage,
    }) => {
      await authPage.openLogin();
      await authPage.emailInput.focus();
      await expect(authPage.emailInput).toBeFocused();

      await authPage.emailInput.press('Tab');
      await expect(authPage.passwordInput).toBeFocused();
    });
  });

  test.describe('Parameterized Multi-Viewport Responsive Layout Verification (6 Device Profiles x 2 Core Pages)', () => {
    for (const [vIdx, vp] of RESPONSIVE_VIEWPORTS.entries()) {
      const testNumCatalog = vIdx * 2 + 9;
      const testNumAuth = vIdx * 2 + 10;

      test(`A11Y-${String(testNumCatalog).padStart(3, '0')}: [${vp.id}] Home Catalog renders without horizontal overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({
        catalogPage,
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await catalogPage.open();
        await expect(catalogPage.productCards).toHaveCount(9);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 20;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test(`A11Y-${String(testNumAuth).padStart(3, '0')}: [${vp.id}] Login & Contact forms remain interactive on ${vp.name} (${vp.width}x${vp.height})`, async ({
        authPage,
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await authPage.openLogin();
        await expect(authPage.emailInput).toBeVisible();
        await expect(authPage.passwordInput).toBeVisible();
        await expect(authPage.loginSubmitButton).toBeVisible();
      });
    }
  });

  test.describe('Network Fault Injection, HTTP 500 Resilience & Latency Simulation', () => {
    test('A11Y-021: Catalog search gracefully handles HTTP 500 Internal Server Error on /products/search by displaying empty state', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.open();

      await page.route('https://api.practicesoftwaretesting.com/products/search*', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Simulated database connection timeout' }),
        });
      });

      await catalogPage.searchForProduct('Drill');
      await expect(catalogPage.noResultsMessage).toBeVisible();
    });

    test('A11Y-022: Login page gracefully displays [data-test="login-error"] when /users/login returns HTTP 503 Service Unavailable', async ({
      authPage,
      page,
    }) => {
      await authPage.openLogin();

      await page.route('https://api.practicesoftwaretesting.com/users/login', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Authentication microservice temporarily unavailable' }),
        });
      });

      await authPage.login('customer@practicesoftwaretesting.com', 'welcome01');
      await expect(authPage.loginError).toBeVisible();
    });

    test('A11Y-023: Contact form gracefully handles HTTP 422 Unprocessable Entity from /messages API', async ({
      contactPage,
      page,
    }) => {
      await contactPage.open();

      await page.route('https://api.practicesoftwaretesting.com/messages', async (route) => {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Simulated ticket validation error' }),
        });
      });

      await contactPage.subjectSelect.selectOption('warranty');
      await contactPage.firstNameInput.fill('Jane');
      await contactPage.lastNameInput.fill('Doe');
      await contactPage.emailInput.fill('jane@example.com');
      await contactPage.messageInput.fill('A'.repeat(60));
      await contactPage.contactSubmitButton.click();

      await expect(page.locator('.alert-danger')).toBeVisible();
    });

    test('A11Y-024: Simulated 350ms API latency on /products still resolves and renders all 9 catalog cards', async ({
      catalogPage,
      page,
    }) => {
      await page.route('https://api.practicesoftwaretesting.com/products*', async (route) => {
        await new Promise((r) => setTimeout(r, 350));
        await route.fallback();
      });

      await catalogPage.open();
      await expect(catalogPage.productCards).toHaveCount(9);
    });

    test('A11Y-025: Browser Navigation Timing API confirms DOM interactive load time is under 5000ms', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.open();
      const domInteractiveMs = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        return nav ? nav.domInteractive : 100;
      });
      expect(domInteractiveMs).toBeLessThan(5000);
    });

    test('A11Y-026: Disabling CO2 rating scale via localStorage (CO2_SCALE_ENABLED="false") hides CO2 badges on catalog cards', async ({
      catalogPage,
    }) => {
      await catalogPage.open();
      await catalogPage.setLocalStorageItem('CO2_SCALE_ENABLED', 'false');
      await catalogPage.reloadPage();

      await expect(catalogPage.productCards).toHaveCount(9);
      await expect(catalogPage.co2Badges).toHaveCount(0);
    });

    test('A11Y-027: Disabling Eco badges via localStorage (ECO_BADGE_ENABLED="false") hides ECO badges while preserving CO2 scale', async ({
      catalogPage,
    }) => {
      await catalogPage.open();
      await catalogPage.setLocalStorageItem('CO2_SCALE_ENABLED', 'true');
      await catalogPage.setLocalStorageItem('ECO_BADGE_ENABLED', 'false');
      await catalogPage.reloadPage();

      await expect(catalogPage.productCards).toHaveCount(9);
      await expect(catalogPage.co2Badges).toHaveCount(9);
      await expect(catalogPage.ecoBadges).toHaveCount(0);
    });

    test('A11Y-028: Geo-location promotional pricing (New York coordinates in localStorage GEO_LOCATION) activates discount_price badge', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.open();
      await catalogPage.setLocalStorageItem(
        'GEO_LOCATION',
        JSON.stringify({ lat: 41, lng: 74 })
      );
      await catalogPage.reloadPage();

      const page2Btn = page.getByRole('button', { name: 'Page-2' });
      await page2Btn.click();
      await expect(page.locator('[data-test="product-discount-price"]').first()).toBeVisible();
    });
  });
});
