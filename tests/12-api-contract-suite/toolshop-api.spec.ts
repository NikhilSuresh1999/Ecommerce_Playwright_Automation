import { test, expect } from '@fixtures/base.fixture';
import {
  ProductSchema,
  PaginatedProductListSchema,
  BrandSchema,
  CategorySchema,
  CartSchema,
  AuthLoginResponseSchema,
  InvoiceSchema,
} from '@api/schemas/toolshop.schema';
import {
  TOOLSHOP_PRODUCTS,
  TOOLSHOP_RENTALS,
  TOOLSHOP_BRANDS,
} from '@data/toolshop.catalog.data';
import { TOOLSHOP_USERS } from '@data/toolshop.users.data';
import { PAYMENT_METHOD_SCENARIOS } from '@data/toolshop.checkout.data';
import { z } from 'zod';

test.describe('Suite 12: REST API Contract Validation (Zod Schemas), Query Engine & Microservice State Lifecycle', () => {
  test.describe('Parameterized Product Schema Contract Validation (All 12 Catalog Products)', () => {
    for (const [idx, product] of TOOLSHOP_PRODUCTS.entries()) {
      const testId = `API-${String(idx + 1).padStart(3, '0')}`;
      test(`${testId}: GET /products/${product.id} ("${product.name}") conforms strictly to ProductSchema and ProductSpecSchema`, async ({
        apiEngine,
      }) => {
        const fetched = apiEngine.getProductById(product.id);
        expect(fetched).toBeDefined();

        const parsed = ProductSchema.safeParse(fetched);
        expect(parsed.success).toBe(true);
        expect(fetched?.specs.length).toBe(5);
      });
    }
  });

  test.describe('Catalog Query Engine, Pagination, Filtering & Rental Contracts', () => {
    test('API-013: QUERY /products (page=1) returns PaginatedProductListSchema with 9 items and total=12', async ({
      apiEngine,
    }) => {
      const res = apiEngine.queryProducts({ page: 1 });
      const parsed = PaginatedProductListSchema.safeParse(res);
      expect(parsed.success).toBe(true);
      expect(res.data.length).toBe(9);
      expect(res.total).toBe(12);
      expect(res.last_page).toBe(2);
    });

    test('API-014: QUERY /products (page=2) returns remaining 3 items with current_page=2', async ({
      apiEngine,
    }) => {
      const res = apiEngine.queryProducts({ page: 2 });
      const parsed = PaginatedProductListSchema.safeParse(res);
      expect(parsed.success).toBe(true);
      expect(res.data.length).toBe(3);
      expect(res.current_page).toBe(2);
    });

    test('API-015: QUERY /products (is_rental="true") returns all 3 heavy equipment rental contracts', async ({
      apiEngine,
    }) => {
      const res = apiEngine.queryProducts({ is_rental: 'true' });
      const parsed = PaginatedProductListSchema.safeParse(res);
      expect(parsed.success).toBe(true);
      expect(res.data.length).toBe(TOOLSHOP_RENTALS.length);
      expect(res.data.every((r) => r.is_rental)).toBe(true);
    });

    test('API-016: QUERY /products (eco_friendly="true") returns only eco-certified products', async ({
      apiEngine,
    }) => {
      const res = apiEngine.queryProducts({ eco_friendly: 'true' });
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((p) => p.is_eco_friendly)).toBe(true);
    });

    test('API-017: QUERY /products (between="price,10,20") filters products strictly within price range [$10, $20]', async ({
      apiEngine,
    }) => {
      const res = apiEngine.queryProducts({ between: 'price,10,20' });
      expect(res.data.length).toBeGreaterThan(0);
      for (const item of res.data) {
        expect(item.price).toBeGreaterThanOrEqual(10);
        expect(item.price).toBeLessThanOrEqual(20);
      }
    });

    test('API-018: GET /brands contract validates against z.array(BrandSchema)', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.open();
      const brands = await page.evaluate(async () => {
        const res = await fetch('https://api.practicesoftwaretesting.com/brands');
        return res.json();
      });
      const parsed = z.array(BrandSchema).safeParse(brands);
      expect(parsed.success).toBe(true);
      expect(brands.length).toBe(TOOLSHOP_BRANDS.length);
    });

    test('API-019: GET /categories/tree contract validates recursive CategorySchema tree', async ({
      catalogPage,
      page,
    }) => {
      await catalogPage.open();
      const categories = await page.evaluate(async () => {
        const res = await fetch('https://api.practicesoftwaretesting.com/categories/tree');
        return res.json();
      });
      const parsed = z.array(CategorySchema).safeParse(categories);
      expect(parsed.success).toBe(true);
      expect(categories.length).toBe(3);
    });

    test('API-020: GET /products/:id/related returns related products from same parent category', async ({
      apiEngine,
    }) => {
      const related = apiEngine.getRelatedProducts(TOOLSHOP_PRODUCTS[0].id);
      const parsed = z.array(ProductSchema).safeParse(related);
      expect(parsed.success).toBe(true);
      expect(related.every((p) => p.id !== TOOLSHOP_PRODUCTS[0].id)).toBe(true);
    });
  });

  test.describe('Shopping Cart, Authentication, Payment Validation & Invoice Microservice Contracts', () => {
    test('API-021: POST /carts creates new cart session and validates against CartSchema', async ({
      apiEngine,
    }) => {
      const cart = apiEngine.createCart();
      const parsed = CartSchema.safeParse(cart);
      expect(parsed.success).toBe(true);
      expect(cart.cart_items).toEqual([]);
    });

    test('API-022: Adding product to cart and updating quantity validates against CartSchema', async ({
      apiEngine,
    }) => {
      const cart = apiEngine.createCart();
      apiEngine.addItemToCart(cart.id, TOOLSHOP_PRODUCTS[0].id, 2);
      const updated = apiEngine.updateCartItemQuantity(cart.id, TOOLSHOP_PRODUCTS[0].id, 5);

      const parsed = CartSchema.safeParse(updated);
      expect(parsed.success).toBe(true);
      expect(updated?.cart_items[0].quantity).toBe(5);
    });

    test('API-023: Removing item from cart empties cart_items array cleanly', async ({
      apiEngine,
    }) => {
      const cart = apiEngine.createCart();
      apiEngine.addItemToCart(cart.id, TOOLSHOP_PRODUCTS[0].id, 1);
      expect(apiEngine.getCart(cart.id)?.cart_items.length).toBe(1);

      apiEngine.removeCartItem(cart.id, TOOLSHOP_PRODUCTS[0].id);
      expect(apiEngine.getCart(cart.id)?.cart_items.length).toBe(0);
    });

    test('API-024: POST /users/login with valid customer credentials validates against AuthLoginResponseSchema (HTTP 200)', async ({
      apiEngine,
    }) => {
      const res = apiEngine.loginUser(
        TOOLSHOP_USERS.customer.email,
        TOOLSHOP_USERS.customer.password
      );
      expect(res.status).toBe(200);
      const parsed = AuthLoginResponseSchema.safeParse(res.body);
      expect(parsed.success).toBe(true);
    });

    test('API-025: POST /users/login with wrong password returns HTTP 401 Unauthorized', async ({
      apiEngine,
    }) => {
      const res = apiEngine.loginUser(TOOLSHOP_USERS.customer.email, 'WrongPassword99!');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    test('API-026: POST /users/login with locked account returns HTTP 423 Locked', async ({
      apiEngine,
    }) => {
      const res = apiEngine.loginUser(
        TOOLSHOP_USERS.locked.email,
        TOOLSHOP_USERS.locked.password
      );
      expect(res.status).toBe(423);
      expect(String(res.body.error)).toContain('Account locked');
    });

    test('API-027: POST /users/register creates new customer record with HTTP 201 Created', async ({
      apiEngine,
    }) => {
      const res = apiEngine.registerUser({
        first_name: 'Marcus',
        last_name: 'Vance',
        email: `marcus.vance.${Date.now()}@example.com`,
        password: 'SecurePassword99!@',
        phone: '0123456789',
        dob: '1991-06-15',
      });
      expect(res.status).toBe(201);
      expect(res.body.first_name).toBe('Marcus');
    });

    test('API-028: POST /users/register with duplicate email returns HTTP 422 Unprocessable Entity', async ({
      apiEngine,
    }) => {
      const res = apiEngine.registerUser({
        first_name: 'Jane',
        last_name: 'Duplicate',
        email: TOOLSHOP_USERS.customer.email,
        password: 'SecurePassword99!@',
      });
      expect(res.status).toBe(422);
    });

    for (const [pIdx, paymentScenario] of PAYMENT_METHOD_SCENARIOS.entries()) {
      const testId = `API-${String(pIdx + 29).padStart(3, '0')}`;
      test(`${testId}: POST /payment/check for [${paymentScenario.scenarioId}] (${paymentScenario.methodValue}) returns HTTP 200 "Payment was successful"`, async ({
        apiEngine,
      }) => {
        const res = apiEngine.validatePayment({
          payment_method: paymentScenario.methodValue,
          payment_details: paymentScenario.fields,
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Payment was successful');
      });
    }

    test('API-037: POST /invoices creates invoice record conforming to InvoiceSchema', async ({
      apiEngine,
    }) => {
      const inv = apiEngine.createInvoice({
        billing_street: 'Ringstrasse 10',
        billing_city: 'Vienna',
        billing_state: 'Vienna',
        billing_country: 'AT',
        billing_postal_code: '1010',
        payment_method: 'credit-card',
        total: 114.95,
      });
      const parsed = InvoiceSchema.safeParse(inv);
      expect(parsed.success).toBe(true);
    });

    test('API-038: POST /messages enforces 50-character minimum length rule (HTTP 422 on short message, HTTP 200 on valid)', async ({
      apiEngine,
    }) => {
      const shortRes = apiEngine.createMessage({
        subject: 'warranty',
        message: 'Too short message',
      });
      expect(shortRes.status).toBe(422);

      const validRes = apiEngine.createMessage({
        subject: 'warranty',
        message: 'Valid enterprise support inquiry message exceeding fifty characters in total length.',
      });
      expect(validRes.status).toBe(200);
    });
  });
});

