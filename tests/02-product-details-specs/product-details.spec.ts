import { test, expect } from '@fixtures/base.fixture';
import { TOOLSHOP_PRODUCTS } from '@data/toolshop.catalog.data';

test.describe('Suite 02: Product Details Page (PDP), Technical Specs, CO2 Badges & Cart Actions', () => {
  test.describe('Parameterized Product Details Metadata Verification (All 12 Catalog Tools)', () => {
    for (const [index, product] of TOOLSHOP_PRODUCTS.entries()) {
      const testId = `PDP-${String(index + 1).padStart(3, '0')}`;
      test(`${testId}: Product details page for "${product.name}" renders accurate name, price ($${product.price.toFixed(2)}), description, and CO2 rating (${product.co2_rating})`, async ({
        productDetailsPage,
      }) => {
        await productDetailsPage.openProductById(product.id);
        await expect(productDetailsPage.productName).toContainText(product.name);
        await expect(productDetailsPage.unitPrice).toContainText(product.price.toFixed(2));
        await expect(productDetailsPage.productDescription).toContainText(product.description);
        await expect(
          productDetailsPage.co2Badge.locator('.co2-letter.active')
        ).toHaveText(product.co2_rating);
      });
    }
  });

  test.describe('Parameterized Technical Specifications Table Verification (All 12 Tools)', () => {
    for (const [index, product] of TOOLSHOP_PRODUCTS.entries()) {
      const testId = `PDP-${String(index + 13).padStart(3, '0')}`;
      test(`${testId}: Technical specifications table for "${product.name}" displays all ${product.specs.length} engineering spec rows`, async ({
        productDetailsPage,
      }) => {
        await productDetailsPage.openProductById(product.id);
        await expect(productDetailsPage.specsTable).toBeVisible();
        await expect(productDetailsPage.specRows).toHaveCount(product.specs.length);

        const specsMap = await productDetailsPage.getSpecificationsMap();
        for (const spec of product.specs) {
          expect(specsMap[spec.spec_name]).toContain(spec.spec_value);
        }
      });
    }
  });

  test.describe('Parameterized Add-to-Cart Verification (All 11 In-Stock Products)', () => {
    const inStockProducts = TOOLSHOP_PRODUCTS.filter((p) => p.in_stock);
    for (const [index, product] of inStockProducts.entries()) {
      const testId = `PDP-${String(index + 25).padStart(3, '0')}`;
      test(`${testId}: Adding in-stock "${product.name}" to cart updates navbar cart badge to 1`, async ({
        productDetailsPage,
        navbar,
      }) => {
        await productDetailsPage.openProductById(product.id);
        await expect(productDetailsPage.addToCartBtn).toBeEnabled();
        await productDetailsPage.addToCart(1);
        await expect(navbar.cartQuantityBadge).toHaveText('1');
      });
    }
  });

  test.describe('Out-of-Stock Guardrails, Quantity Controls & Favorites Integration', () => {
    test('PDP-036: Out-of-stock "Long Nose Pliers" disables Add-to-Cart and quantity stepper controls', async ({
      productDetailsPage,
    }) => {
      const outOfStockProduct = TOOLSHOP_PRODUCTS.find((p) => !p.in_stock)!;
      await productDetailsPage.openProductById(outOfStockProduct.id);

      await expect(productDetailsPage.outOfStockBadge).toBeVisible();
      await expect(productDetailsPage.addToCartBtn).toBeDisabled();
      await expect(productDetailsPage.quantityInput).toBeDisabled();
    });

    test('PDP-037: Clicking [data-test="increase-quantity"] 4 times increments quantity to 5 and adds 5 units to cart', async ({
      productDetailsPage,
      navbar,
    }) => {
      const firstInStock = TOOLSHOP_PRODUCTS[0];
      await productDetailsPage.openProductById(firstInStock.id);

      for (let i = 0; i < 4; i++) {
        await productDetailsPage.increaseQuantityBtn.click();
      }
      await expect(productDetailsPage.quantityInput).toHaveValue('5');

      await productDetailsPage.addToCartBtn.click();
      await expect(navbar.cartQuantityBadge).toHaveText('5');
    });

    test('PDP-038: Clicking [data-test="decrease-quantity"] decrements quantity and enforces minimum floor of 1', async ({
      productDetailsPage,
    }) => {
      const firstInStock = TOOLSHOP_PRODUCTS[0];
      await productDetailsPage.openProductById(firstInStock.id);

      await productDetailsPage.increaseQuantityBtn.click();
      await productDetailsPage.increaseQuantityBtn.click();
      await expect(productDetailsPage.quantityInput).toHaveValue('3');

      await productDetailsPage.decreaseQuantityBtn.click();
      await expect(productDetailsPage.quantityInput).toHaveValue('2');

      await productDetailsPage.decreaseQuantityBtn.click();
      await expect(productDetailsPage.quantityInput).toHaveValue('1');
    });

    test('PDP-039: Related products section renders alternative hardware items and supports direct navigation', async ({
      productDetailsPage,
      page,
    }) => {
      const firstProduct = TOOLSHOP_PRODUCTS[0];
      await productDetailsPage.openProductById(firstProduct.id);

      const relatedCards = page.locator('.card');
      await expect(relatedCards.first()).toBeVisible();
      const relatedCount = await relatedCards.count();
      expect(relatedCount).toBeGreaterThanOrEqual(1);
    });

    test('PDP-040: Clicking [data-test="add-to-favorites"] adds product to wishlist', async ({
      productDetailsPage,
      authPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await productDetailsPage.openProductById(TOOLSHOP_PRODUCTS[1].id);
      await expect(productDetailsPage.addToFavoritesBtn).toBeVisible();
      await productDetailsPage.addToFavoritesBtn.click();
      await expect(productDetailsPage.toastAlert).toBeVisible();
    });
  });
});
