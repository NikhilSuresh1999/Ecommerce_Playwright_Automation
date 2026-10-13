import { test, expect } from '@fixtures/base.fixture';
import {
  TOOLSHOP_PRODUCTS,
  TOOLSHOP_BRANDS,
  TOOLSHOP_CATEGORIES_TREE,
} from '@data/toolshop.catalog.data';

test.describe('Suite 01: Product Catalog, Multi-Faceted Filtering, Sorting & Search Engine', () => {
  test.beforeEach(async ({ catalogPage }) => {
    await catalogPage.open();
  });

  test.describe('Catalog Grid & Pagination Verification', () => {
    test('CAT-001: Home catalog page renders initial paginated grid of 9 hardware products', async ({
      catalogPage,
    }) => {
      await expect(catalogPage.productCards).toHaveCount(9);
      const names = await catalogPage.getVisibleProductNames();
      expect(names.length).toBe(9);
      expect(names[0]).toBe(TOOLSHOP_PRODUCTS[0].name);
    });

    test('CAT-002: Navigating to Page 2 displays the remaining 3 catalog products', async ({
      catalogPage,
      page,
    }) => {
      const page2Button = page.getByRole('button', { name: 'Page-2' });
      await expect(page2Button).toBeVisible();
      await page2Button.click();

      await expect(catalogPage.productCards).toHaveCount(3);
      const names = await catalogPage.getVisibleProductNames();
      expect(names).toEqual(TOOLSHOP_PRODUCTS.slice(9, 12).map((p) => p.name));
    });

    test('CAT-003: Out-of-stock product displays [data-test="out-of-stock"] badge on catalog card', async ({
      catalogPage,
    }) => {
      const outOfStockProduct = TOOLSHOP_PRODUCTS.find((p) => !p.in_stock)!;
      const card = catalogPage.getProductCardById(outOfStockProduct.id);
      await expect(card).toBeVisible();
      await expect(card.locator('[data-test="out-of-stock"]')).toBeVisible();
      await expect(card.locator('[data-test="out-of-stock"]')).toContainText('Out of stock');
    });

    test('CAT-004: Eco-friendly products display [data-test="eco-badge"] on catalog cards', async ({
      catalogPage,
    }) => {
      const ecoProductsPage1 = TOOLSHOP_PRODUCTS.slice(0, 9).filter((p) => p.is_eco_friendly);
      for (const product of ecoProductsPage1) {
        const card = catalogPage.getProductCardById(product.id);
        await expect(card.locator('[data-test="eco-badge"]')).toBeVisible();
      }
    });

    test('CAT-005: Every catalog card renders a valid CO2 rating badge (A-E) with active highlight', async ({
      catalogPage,
    }) => {
      const page1Products = TOOLSHOP_PRODUCTS.slice(0, 9);
      for (const product of page1Products) {
        const card = catalogPage.getProductCardById(product.id);
        const co2Badge = card.locator('[data-test="co2-rating-badge"]');
        await expect(co2Badge).toBeVisible();
        const activeLetter = co2Badge.locator('.co2-letter.active');
        await expect(activeLetter).toHaveText(product.co2_rating);
      }
    });
  });

  test.describe('Multi-Criteria Sorting Engine', () => {
    test('CAT-006: Sort by Name (A - Z) orders catalog alphabetically ascending', async ({
      catalogPage,
    }) => {
      await catalogPage.selectSortOption('name,asc');
      const expectedFirst = [...TOOLSHOP_PRODUCTS].sort((a, b) => a.name.localeCompare(b.name))[0];
      await expect(catalogPage.productNames.first()).toHaveText(expectedFirst.name);

      const visibleNames = await catalogPage.getVisibleProductNames();
      const sortedCopy = [...visibleNames].sort((a, b) => a.localeCompare(b));
      expect(visibleNames).toEqual(sortedCopy);
    });

    test('CAT-007: Sort by Name (Z - A) orders catalog alphabetically descending', async ({
      catalogPage,
    }) => {
      await catalogPage.selectSortOption('name,desc');
      const expectedFirst = [...TOOLSHOP_PRODUCTS].sort((a, b) => b.name.localeCompare(a.name))[0];
      await expect(catalogPage.productNames.first()).toHaveText(expectedFirst.name);

      const visibleNames = await catalogPage.getVisibleProductNames();
      const sortedCopy = [...visibleNames].sort((a, b) => b.localeCompare(a));
      expect(visibleNames).toEqual(sortedCopy);
    });

    test('CAT-008: Sort by Price (Low - High) orders catalog by ascending price', async ({
      catalogPage,
    }) => {
      await catalogPage.selectSortOption('price,asc');
      const expectedFirst = [...TOOLSHOP_PRODUCTS].sort((a, b) => a.price - b.price)[0];
      await expect(catalogPage.productNames.first()).toHaveText(expectedFirst.name);

      const prices = await catalogPage.getVisibleProductPrices();
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    test('CAT-009: Sort by Price (High - Low) orders catalog by descending price', async ({
      catalogPage,
    }) => {
      await catalogPage.selectSortOption('price,desc');
      const expectedFirst = [...TOOLSHOP_PRODUCTS].sort((a, b) => b.price - a.price)[0];
      await expect(catalogPage.productNames.first()).toHaveText(expectedFirst.name);

      const prices = await catalogPage.getVisibleProductPrices();
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    test('CAT-010: Sort by CO2 Rating (A - E) places eco-optimal tools first', async ({
      catalogPage,
    }) => {
      await catalogPage.selectSortOption('co2_rating,asc');
      const firstActiveLetter = catalogPage.productCards
        .first()
        .locator('[data-test="co2-rating-badge"] .co2-letter.active');
      await expect(firstActiveLetter).toHaveText('A');
    });

    test('CAT-011: Sort by CO2 Rating (E - A) places highest CO2 rating tools first', async ({
      catalogPage,
    }) => {
      await catalogPage.selectSortOption('co2_rating,desc');
      const firstActiveLetter = catalogPage.productCards
        .first()
        .locator('[data-test="co2-rating-badge"] .co2-letter.active');
      await expect(firstActiveLetter).toHaveText('E');
    });
  });

  test.describe('Parameterized Product Search Verification (All 12 Catalog Tools)', () => {
    for (const [index, product] of TOOLSHOP_PRODUCTS.entries()) {
      const testId = `CAT-${String(index + 12).padStart(3, '0')}`;
      test(`${testId}: Searching for "${product.name}" returns matching product card with $${product.price.toFixed(2)}`, async ({
        catalogPage,
      }) => {
        await catalogPage.searchForProduct(product.name);
        await expect(catalogPage.searchCaption).toContainText(product.name);
        const matchingCard = catalogPage.getProductCardById(product.id);
        await expect(matchingCard).toBeVisible();
        await expect(matchingCard.locator('[data-test="product-name"]')).toHaveText(product.name);
        await expect(matchingCard.locator('[data-test="product-price"]')).toContainText(
          product.price.toFixed(2)
        );
      });
    }

    test('CAT-024: Searching with case-insensitive partial keyword "pliers" returns all 2 pliers tools', async ({
      catalogPage,
    }) => {
      const expectedPliersCount = TOOLSHOP_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes('pliers')
      ).length;
      await catalogPage.searchForProduct('pliers');
      await expect(catalogPage.productCards).toHaveCount(expectedPliersCount);
      const names = await catalogPage.getVisibleProductNames();
      for (const name of names) {
        expect(name.toLowerCase()).toContain('pliers');
      }
    });

    test('CAT-025: Searching for non-existent tool displays [data-test="no-results"] empty state', async ({
      catalogPage,
    }) => {
      await catalogPage.searchForProduct('QuantumPlasmaCutter9999');
      await expect(catalogPage.noResultsMessage).toBeVisible();
      await expect(catalogPage.productCards).toHaveCount(0);
    });

    test('CAT-026: Clicking [data-test="search-reset"] clears search filter and restores full catalog', async ({
      catalogPage,
    }) => {
      await catalogPage.searchForProduct('Thor Hammer');
      await expect(catalogPage.productCards).toHaveCount(1);

      await catalogPage.resetSearch();
      await expect(catalogPage.productCards).toHaveCount(9);
    });
  });

  test.describe('Faceted Brand, Category & Sustainability Filtering', () => {
    for (const [bIdx, brand] of TOOLSHOP_BRANDS.entries()) {
      const testNum = 27 + bIdx;
      test(`CAT-0${testNum}: Filtering by brand "${brand.name}" displays only ${brand.name} products`, async ({
        catalogPage,
      }) => {
        const expectedCount = TOOLSHOP_PRODUCTS.filter((p) => p.brand.id === brand.id).length;
        await catalogPage.toggleBrandFilter(brand.id);
        await expect(catalogPage.productCards).toHaveCount(Math.min(expectedCount, 9));
      });
    }

    test('CAT-029: Filtering by Eco-Friendly checkbox displays exclusively eco-certified products', async ({
      catalogPage,
    }) => {
      const expectedEcoProducts = TOOLSHOP_PRODUCTS.filter((p) => p.is_eco_friendly);
      await catalogPage.toggleEcoFriendlyFilter();
      await expect(catalogPage.productCards).toHaveCount(expectedEcoProducts.length);

      const badgeCount = await catalogPage.ecoBadges.count();
      expect(badgeCount).toBe(expectedEcoProducts.length);
    });

    const populatedSubCategories = TOOLSHOP_CATEGORIES_TREE.flatMap(
      (root) => root.sub_categories ?? []
    ).filter((sub) => TOOLSHOP_PRODUCTS.some((p) => p.category.id === sub.id));

    for (const [sIdx, subCat] of populatedSubCategories.entries()) {
      const testNum = 30 + sIdx;
      test(`CAT-0${testNum}: Filtering by subcategory "${subCat.name}" filters grid accurately`, async ({
        catalogPage,
      }) => {
        const expectedProducts = TOOLSHOP_PRODUCTS.filter((p) => p.category.id === subCat.id);
        await catalogPage.toggleCategoryFilter(subCat.id);
        await expect(catalogPage.productCards).toHaveCount(expectedProducts.length);
        const visibleNames = await catalogPage.getVisibleProductNames();
        expect(visibleNames.sort()).toEqual(expectedProducts.map((p) => p.name).sort());
      });
    }

    test('CAT-039: Filtering by Root Category "Power Tools" aggregates all child subcategory products', async ({
      catalogPage,
    }) => {
      const powerToolsRoot = TOOLSHOP_CATEGORIES_TREE.find((c) => c.slug === 'power-tools')!;
      const childIds = new Set((powerToolsRoot.sub_categories ?? []).map((s) => s.id));
      const expectedProducts = TOOLSHOP_PRODUCTS.filter((p) => childIds.has(p.category.id));

      await catalogPage.toggleCategoryFilter(powerToolsRoot.id);
      await expect(catalogPage.productCards).toHaveCount(expectedProducts.length);
    });

    test('CAT-040: Combining Brand filter + Sort by Price (High - Low) applies compound query parameters', async ({
      catalogPage,
    }) => {
      const forgeFlex = TOOLSHOP_BRANDS[0];
      await catalogPage.toggleBrandFilter(forgeFlex.id);
      await catalogPage.selectSortOption('price,desc');

      const expectedSorted = TOOLSHOP_PRODUCTS.filter((p) => p.brand.id === forgeFlex.id).sort(
        (a, b) => b.price - a.price
      );
      await expect(catalogPage.productNames.first()).toHaveText(expectedSorted[0].name);
    });
  });
});
