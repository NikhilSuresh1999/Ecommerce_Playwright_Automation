import { test, expect } from '@fixtures/base.fixture';
import { LANGUAGE_LOCALE_SCENARIOS } from '@data/toolshop.checkout.data';
import { TOOLSHOP_PRODUCTS } from '@data/toolshop.catalog.data';

test.describe('Suite 09: Global Navigation, Multi-Language (i18n) Switcher, Category Routes & Interactive Widgets', () => {
  test.beforeEach(async ({ catalogPage }) => {
    await catalogPage.open();
  });

  test.describe('Top Navigation Bar & Category Dropdown Routing', () => {
    test('NAV-001: Top navigation bar displays brand logo, Home, Categories, Contact, Sign In, and Language selector', async ({
      navbar,
    }) => {
      await expect(navbar.navHome).toBeVisible();
      await expect(navbar.navCategories).toBeVisible();
      await expect(navbar.navContact).toBeVisible();
      await expect(navbar.navSignIn).toBeVisible();
      await expect(navbar.languageSelect).toBeVisible();
    });

    test('NAV-002: Selecting "Hand Tools" from Categories dropdown navigates to /category/hand-tools and filters products', async ({
      navbar,
      catalogPage,
      page,
    }) => {
      await navbar.selectCategoryFromDropdown('hand-tools');
      await expect(page).toHaveURL(/\/category\/hand-tools/);
      await expect(catalogPage.pageTitle).toContainText('Category: Hand Tools');
      const count = await catalogPage.productCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('NAV-003: Selecting "Power Tools" from Categories dropdown navigates to /category/power-tools', async ({
      navbar,
      catalogPage,
      page,
    }) => {
      await navbar.selectCategoryFromDropdown('power-tools');
      await expect(page).toHaveURL(/\/category\/power-tools/);
      await expect(catalogPage.pageTitle).toContainText('Category: Power Tools');
      const count = await catalogPage.productCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('NAV-004: Selecting "Other" from Categories dropdown navigates to /category/other', async ({
      navbar,
      catalogPage,
      page,
    }) => {
      await navbar.selectCategoryFromDropdown('other');
      await expect(page).toHaveURL(/\/category\/other/);
      await expect(catalogPage.pageTitle).toContainText('Category: Other');
      const count = await catalogPage.productCards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('NAV-005: Selecting "Special Tools" from Categories dropdown navigates to /category/special-tools', async ({
      navbar,
      page,
    }) => {
      await navbar.selectCategoryFromDropdown('special-tools');
      await expect(page).toHaveURL(/\/category\/special-tools/);
    });

    test('NAV-006: Selecting "Rentals" from Categories dropdown navigates to /rentals', async ({
      navbar,
      page,
    }) => {
      await navbar.selectCategoryFromDropdown('rentals');
      await expect(page).toHaveURL(/\/rentals/);
      await expect(page.locator('[data-test="page-title"]')).toContainText('Rentals');
    });

    test('NAV-007: Clicking [data-test="nav-contact"] navigates to /contact', async ({
      navbar,
      page,
    }) => {
      await navbar.navContact.click();
      await expect(page).toHaveURL(/\/contact/);
    });

    test('NAV-008: Clicking [data-test="nav-sign-in"] navigates to /auth/login', async ({
      navbar,
      page,
    }) => {
      await navbar.navSignIn.click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('NAV-009: Clicking [data-test="nav-home"] from another route returns user to home catalog (/)', async ({
      navbar,
      catalogPage,
      page,
    }) => {
      await navbar.navContact.click();
      await expect(page).toHaveURL(/\/contact/);

      await navbar.navHome.click();
      await expect(page).toHaveURL(/\/$/);
      await expect(catalogPage.productCards.first()).toBeVisible();
    });

    test('NAV-010: Clicking brand logo link in navbar returns user to home catalog (/)', async ({
      navbar,
      page,
    }) => {
      await navbar.navSignIn.click();
      await expect(page).toHaveURL(/\/auth\/login/);

      await page.locator('a.navbar-brand').click();
      await expect(page).toHaveURL(/\/$/);
    });
  });

  test.describe('Parameterized Multi-Language Internationalization (i18n) Switcher (6 Locales)', () => {
    for (const [idx, locale] of LANGUAGE_LOCALE_SCENARIOS.entries()) {
      const testNum1 = idx * 2 + 11;
      const testNum2 = idx * 2 + 12;

      test(`NAV-${String(testNum1).padStart(3, '0')}: Switching language to ${locale.languageName} ([data-test="${locale.testId}"]) updates navbar language badge to "${locale.expectedButtonLabel}"`, async ({
        navbar,
      }) => {
        await navbar.switchLanguage(locale.testId);
        await expect(navbar.languageSelect).toContainText(locale.expectedButtonLabel);
      });

      test(`NAV-${String(testNum2).padStart(3, '0')}: Selected language ${locale.languageName} (${locale.localeCode}) persists across navigation to /contact`, async ({
        navbar,
        page,
      }) => {
        await navbar.switchLanguage(locale.testId);
        await expect(navbar.languageSelect).toContainText(locale.expectedButtonLabel);

        await navbar.navContact.click();
        await expect(page).toHaveURL(/\/contact/);
        await expect(navbar.languageSelect).toContainText(locale.expectedButtonLabel);
      });
    }
  });

  test.describe('Footer Links, Notification Bar, Comparison Bar & Floating Widgets', () => {
    test('NAV-023: Top notification bar ([data-test="notification-bar"]) renders documentation and testing guide actions', async ({
      navbar,
    }) => {
      await expect(navbar.notificationBar).toBeVisible();
      await expect(navbar.notificationBar).toContainText('Documentation');
    });

    test('NAV-024: Footer section displays Privacy Policy link and navigates to /privacy on click', async ({
      page,
    }) => {
      const privacyLink = page.locator('a[href="/privacy"]');
      await expect(privacyLink).toBeVisible();
      await privacyLink.click();
      await expect(page).toHaveURL(/\/privacy/);
    });

    test('NAV-025: Footer learning section renders Courses, API Spector, and GitHub repository links', async ({
      navbar,
    }) => {
      await expect(navbar.footerExplore).toBeVisible();
      await expect(navbar.footerCourses).toBeVisible();
      await expect(navbar.footerSpector).toBeVisible();
      await expect(navbar.footerGithub).toBeVisible();
    });

    test('NAV-026: Clicking Compare button on a catalog card activates the bottom Product Comparison bar ([data-test="comparison-bar"])', async ({
      catalogPage,
      page,
    }) => {
      const firstCompareBtn = catalogPage.productCards.first().locator('[data-test="compare-btn"]');
      await firstCompareBtn.click();

      const comparisonBar = page.locator('[data-test="comparison-bar"]');
      await expect(comparisonBar).toBeVisible();
      await expect(page.locator('[data-test="compare-link"]')).toBeVisible();
    });

    test('NAV-027: Clicking [data-test="clear-comparison"] in comparison bar clears selected items and hides the bar', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.productCards.first().locator('[data-test="compare-btn"]').click();
      const comparisonBar = page.locator('[data-test="comparison-bar"]');
      await expect(comparisonBar).toBeVisible();

      await page.locator('[data-test="clear-comparison"]').click();
      await expect(comparisonBar).toBeHidden();
    });

    test('NAV-028: Selecting 2 products for comparison and clicking [data-test="compare-link"] opens /comparison table', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.productCards.nth(0).locator('[data-test="compare-btn"]').click();
      await catalogPage.productCards.nth(1).locator('[data-test="compare-btn"]').click();

      await page.locator('[data-test="compare-link"]').click();
      await expect(page).toHaveURL(/\/comparison/);
      await expect(page.locator('app-comparison')).toContainText(TOOLSHOP_PRODUCTS[0].name);
      await expect(page.locator('app-comparison')).toContainText(TOOLSHOP_PRODUCTS[1].name);
    });

    test('NAV-029: Clicking floating AI Chat toggle ([data-test="chat-toggle"]) opens interactive chat window', async ({
      navbar,
      page,
    }) => {
      await expect(navbar.chatToggle).toBeVisible();
      await navbar.chatToggle.click();
      await expect(navbar.chatWindow).toBeVisible();
      const firstActionBtn = page.locator('.action-btn').first();
      if (await firstActionBtn.isVisible()) {
        await firstActionBtn.click();
      }
      await expect(navbar.chatClose).toBeVisible();

      await navbar.chatClose.click();
      await expect(navbar.chatWindow).toBeHidden();
    });

    test('NAV-030: Clicking Live Shop Activity toggle ([data-test="live-activity-toggle"]) opens activity feed popup', async ({
      navbar,
    }) => {
      await expect(navbar.liveActivityToggle).toBeVisible();
      await navbar.liveActivityToggle.click();
      await expect(navbar.liveActivityWindow).toBeVisible();

      await navbar.liveActivityClose.click();
      await expect(navbar.liveActivityWindow).toBeHidden();
    });
  });
});
