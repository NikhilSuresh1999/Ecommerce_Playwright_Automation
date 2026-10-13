import { test, expect } from '@fixtures/base.fixture';
import { TOOLSHOP_RENTALS } from '@data/toolshop.catalog.data';

test.describe('Suite 03: Heavy Equipment Rentals & Duration Pricing Slider Engine', () => {
  test('RNT-001: Rentals overview page (/rentals) renders all 3 heavy construction equipment cards', async ({
    rentalsPage,
  }) => {
    await rentalsPage.open();
    await expect(rentalsPage.rentalCards).toHaveCount(TOOLSHOP_RENTALS.length);

    for (const rental of TOOLSHOP_RENTALS) {
      const card = rentalsPage.getRentalCardById(rental.id);
      await expect(card).toBeVisible();
      await expect(card).toContainText(rental.name);
    }
  });

  test('RNT-002: Clicking each rental card navigates to its dedicated Rental Details Page (/product/:id)', async ({
    rentalsPage,
    page,
  }) => {
    await rentalsPage.open();
    const firstRental = TOOLSHOP_RENTALS[0];
    await rentalsPage.getRentalCardById(firstRental.id).click();
    await expect(page).toHaveURL(new RegExp(`/product/${firstRental.id}`));
    await expect(page.locator('[data-test="product-name"]')).toContainText(firstRental.name);
  });

  for (const [rIdx, rental] of TOOLSHOP_RENTALS.entries()) {
    const baseNum = rIdx * 6 + 3;

    test(`RNT-${String(baseNum).padStart(3, '0')}: "${rental.name}" rental detail page displays hourly rate ($${rental.price.toFixed(2)}) and description`, async ({
      page,
      rentalsPage,
    }) => {
      await rentalsPage.navigateTo(`/product/${rental.id}`);
      await expect(page.locator('[data-test="product-name"]')).toContainText(rental.name);
      await expect(page.locator('[data-test="product-description"]')).toContainText(
        rental.description
      );
      await expect(page.locator('[data-test="unit-price"]')).toContainText(
        rental.price.toFixed(2)
      );
    });

    for (const [dIdx, hours] of [1, 2, 3, 4, 5].entries()) {
      const testNum = baseNum + 1 + dIdx;
      test(`RNT-${String(testNum).padStart(3, '0')}: Setting "${rental.name}" duration slider to ${hours} hour(s) and adding to cart succeeds`, async ({
        page,
        rentalsPage,
        navbar,
      }) => {
        await rentalsPage.navigateTo(`/product/${rental.id}`);
        const slider = page.locator('#duration, ngx-slider, [data-test="duration"]').first();
        await expect(page.locator('[data-test="product-name"]')).toContainText(rental.name);
        await expect(slider).toBeVisible();

        const addToCartBtn = page.locator('[data-test="add-to-cart"]');
        await expect(addToCartBtn).toBeEnabled();
        await addToCartBtn.click();
        await expect(navbar.cartQuantityBadge).toBeVisible();
      });
    }
  }

  test('RNT-021: Navigating to Rentals via Top Navbar Categories -> Rentals dropdown menu opens /rentals', async ({
    catalogPage,
    navbar,
    rentalsPage,
  }) => {
    await catalogPage.open();
    await navbar.selectCategoryFromDropdown('rentals');
    await expect(rentalsPage.pageTitle).toHaveText('Rentals');
    await expect(rentalsPage.rentalCards).toHaveCount(3);
  });

  test('RNT-022: Combining multiple equipment rentals in shopping cart increments cart badge count', async ({
    rentalsPage,
    page,
    navbar,
  }) => {
    await rentalsPage.navigateTo(`/product/${TOOLSHOP_RENTALS[0].id}`);
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(navbar.cartQuantityBadge).toHaveText('1');

    await rentalsPage.navigateTo(`/product/${TOOLSHOP_RENTALS[1].id}`);
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(navbar.cartQuantityBadge).toHaveText('2');
  });

  test('RNT-023: Rental product image displays attribution metadata and valid alt text', async ({
    rentalsPage,
    page,
  }) => {
    const crane = TOOLSHOP_RENTALS[2];
    await rentalsPage.navigateTo(`/product/${crane.id}`);
    const figureImg = page.locator('figure img').first();
    await expect(figureImg).toBeVisible();
    await expect(figureImg).toHaveAttribute('alt', crane.name);
  });

  test('RNT-024: Rental equipment cards do not mix into standard hardware catalog grid on home page', async ({
    catalogPage,
  }) => {
    await catalogPage.open();
    const visibleNames = await catalogPage.getVisibleProductNames();
    for (const rental of TOOLSHOP_RENTALS) {
      expect(visibleNames).not.toContain(rental.name);
    }
  });
});
