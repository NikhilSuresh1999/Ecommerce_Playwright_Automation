import { Page, Route } from '@playwright/test';
import {
  TOOLSHOP_PRODUCTS,
  TOOLSHOP_RENTALS,
  TOOLSHOP_BRANDS,
  TOOLSHOP_CATEGORIES_TREE,
  ToolshopProduct,
} from '@data/toolshop.catalog.data';
import { TOOLSHOP_USERS, generateToolshopJwt, ToolshopUserAccount } from '@data/toolshop.users.data';
import { MathHelper } from '@utils/math.helper';

export interface CartItemRecord {
  id: string;
  quantity: number;
  discount_percentage: number | null;
  cart_id: string;
  product_id: string;
  product: ToolshopProduct;
}

export interface CartRecord {
  id: string;
  additional_discount_percentage: number | null;
  lat: number | null;
  lng: number | null;
  cart_items: CartItemRecord[];
}

export interface FavoriteRecord {
  id: string;
  product_id: string;
  user_id: string;
  product: ToolshopProduct;
}

export interface InvoiceRecord {
  id: string;
  user_id: string;
  invoice_date: string;
  invoice_number: string;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_postal_code: string;
  subtotal: number;
  total: number;
  payment_method: string;
  payment?: {
    id: string;
    payment_method: string;
    payment_details: Record<string, string>;
  };
  status: string;
  invoicelines: Array<{
    id: string;
    invoice_id: string;
    product_id: string;
    unit_price: number;
    quantity: number;
    product: ToolshopProduct;
  }>;
}

export interface MessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  reply: Array<{ id: string; message: string; created_at: string }>;
}

/**
 * Deterministic Toolshop v5.0 REST API Engine & Playwright Route Interceptor.
 * Serves 100% schema-authentic responses to the real Angular 18 frontend at https://practicesoftwaretesting.com
 * and provides direct contract testing methods for Suite 12.
 */
export class ToolshopApiEngine {
  private products: ToolshopProduct[];
  private rentals: ToolshopProduct[];
  private carts = new Map<string, CartRecord>();
  private favorites: FavoriteRecord[] = [];
  private invoices: InvoiceRecord[] = [];
  private messages: MessageRecord[] = [];
  private users: Map<string, ToolshopUserAccount>;

  constructor() {
    this.products = TOOLSHOP_PRODUCTS.map((p) => ({ ...p }));
    this.rentals = TOOLSHOP_RENTALS.map((r) => ({ ...r }));
    this.users = new Map(
      Object.values(TOOLSHOP_USERS).map((u) => [u.email.toLowerCase(), { ...u, address: { ...u.address } }])
    );
    this.seedDefaults();
  }

  private seedDefaults(): void {
    this.favorites = [
      {
        id: '01JFAVDEFAULT0000000000001',
        product_id: this.products[0].id,
        user_id: TOOLSHOP_USERS.customer.id,
        product: this.products[0],
      },
      {
        id: '01JFAVDEFAULT0000000000002',
        product_id: this.products[9].id,
        user_id: TOOLSHOP_USERS.customer.id,
        product: this.products[9],
      },
    ];

    this.invoices = [
      {
        id: '01JINVDEFAULT0000000000001',
        user_id: TOOLSHOP_USERS.customer.id,
        invoice_date: '2026-10-01 14:22:10',
        invoice_number: 'INV-20260001',
        billing_street: 'Test street 98',
        billing_city: 'Vienna',
        billing_state: 'Vienna',
        billing_country: 'AT',
        billing_postal_code: '1010',
        subtotal: 80.69,
        total: 80.69,
        payment_method: 'credit-card',
        payment: {
          id: '01JPAYDEFAULT0000000000001',
          payment_method: 'credit-card',
          payment_details: {
            credit_card_number: '1111-2222-3333-4444',
            expiration_date: '12/2029',
            cvv: '123',
            card_holder_name: 'Jane Doe',
          },
        },
        status: 'COMPLETED',
        invoicelines: [
          {
            id: '01JINVLINE0000000000000001',
            invoice_id: '01JINVDEFAULT0000000000001',
            product_id: this.products[0].id,
            unit_price: this.products[0].price,
            quantity: 1,
            product: this.products[0],
          },
          {
            id: '01JINVLINE0000000000000002',
            invoice_id: '01JINVDEFAULT0000000000001',
            product_id: this.products[9].id,
            unit_price: this.products[9].price,
            quantity: 1,
            product: this.products[9],
          },
        ],
      },
      {
        id: '01JINVDEFAULT0000000000002',
        user_id: TOOLSHOP_USERS.customer.id,
        invoice_date: '2026-10-05 09:15:00',
        invoice_number: 'INV-20260002',
        billing_street: 'Test street 98',
        billing_city: 'Vienna',
        billing_state: 'Vienna',
        billing_country: 'AT',
        billing_postal_code: '1010',
        subtotal: 48.41,
        total: 48.41,
        payment_method: 'bank-transfer',
        payment: {
          id: '01JPAYDEFAULT0000000000002',
          payment_method: 'bank-transfer',
          payment_details: {
            bank_name: 'Global First Hardware Bank',
            account_name: 'Jane Doe',
            account_number: 'AT89370400440532013000',
          },
        },
        status: 'AWAITING_FULFILLMENT',
        invoicelines: [
          {
            id: '01JINVLINE0000000000000003',
            invoice_id: '01JINVDEFAULT0000000000002',
            product_id: this.products[2].id,
            unit_price: this.products[2].price,
            quantity: 1,
            product: this.products[2],
          },
        ],
      },
    ];

    this.messages = [
      {
        id: '01JMSGDEFAULT0000000000001',
        name: 'Jane Doe',
        email: 'customer@practicesoftwaretesting.com',
        subject: 'warranty',
        message:
          'Requesting warranty coverage confirmation for our ForgeFlex Combination Pliers purchased under INV-20260001.',
        status: 'NEW',
        created_at: '2026-10-08 11:30:00',
        reply: [],
      },
    ];
  }

  private getCorsHeaders(): Record<string, string> {
    return {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, QUERY, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, Accept, X-Requested-With',
      'content-type': 'application/json; charset=utf-8',
      'x-request-id': `toolshop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      'x-content-type-options': 'nosniff',
    };
  }

  public queryProducts(params: {
    page?: number | string;
    q?: string;
    sort?: string;
    between?: string;
    by_category?: string;
    by_category_slug?: string;
    by_brand?: string;
    eco_friendly?: string | boolean;
    is_rental?: string | boolean;
  }): {
    current_page: number;
    data: ToolshopProduct[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  } {
    const isRental = params.is_rental === true || params.is_rental === 'true';
    let list = isRental ? [...this.rentals] : [...this.products];

    if (params.q) {
      const q = params.q.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (params.eco_friendly === true || params.eco_friendly === 'true') {
      list = list.filter((p) => p.is_eco_friendly);
    }

    if (params.by_category) {
      const catIds = params.by_category.split(',').map((s) => s.trim());
      list = list.filter(
        (p) =>
          catIds.includes(p.category.id) ||
          (p.category.parent_id && catIds.includes(p.category.parent_id))
      );
    }

    if (params.by_category_slug) {
      const slug = params.by_category_slug.trim().toLowerCase();
      const rootCat = TOOLSHOP_CATEGORIES_TREE.find((c) => c.slug === slug);
      if (rootCat) {
        const subIds = new Set((rootCat.sub_categories || []).map((sc) => sc.id));
        list = list.filter(
          (p) => p.category.parent_id === rootCat.id || subIds.has(p.category.id)
        );
      } else {
        list = list.filter((p) => p.category.slug.toLowerCase() === slug);
      }
    }

    if (params.by_brand) {
      const brandIds = params.by_brand.split(',').map((s) => s.trim());
      list = list.filter((p) => brandIds.includes(p.brand.id));
    }

    if (params.between) {
      const parts = params.between.split(',');
      if (parts.length === 3 && parts[0] === 'price') {
        const min = parseFloat(parts[1]);
        const max = parseFloat(parts[2]);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          list = list.filter((p) => p.price >= min && p.price <= max);
        }
      }
    }

    if (params.sort) {
      const [field, direction] = params.sort.split(',');
      const dir = direction === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        if (field === 'name') {
          return a.name.localeCompare(b.name) * dir;
        }
        if (field === 'price') {
          return (a.price - b.price) * dir;
        }
        if (field === 'co2_rating') {
          return a.co2_rating.localeCompare(b.co2_rating) * dir;
        }
        return 0;
      });
    }

    const page = Math.max(1, Number(params.page || 1));
    const perPage = 9;
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const startIdx = (page - 1) * perPage;
    const pagedData = list.slice(startIdx, startIdx + perPage);

    return {
      current_page: page,
      data: pagedData,
      from: pagedData.length > 0 ? startIdx + 1 : null,
      last_page: lastPage,
      per_page: perPage,
      to: pagedData.length > 0 ? startIdx + pagedData.length : null,
      total,
    };
  }

  public getProductById(id: string): ToolshopProduct | undefined {
    return (
      this.products.find((p) => p.id === id) ||
      this.rentals.find((r) => r.id === id)
    );
  }

  public getRelatedProducts(id: string): ToolshopProduct[] {
    const current = this.getProductById(id);
    if (!current) return this.products.slice(0, 3);
    const sameCategory = this.products.filter(
      (p) => p.id !== id && p.category.parent_id === current.category.parent_id
    );
    return sameCategory.slice(0, 3);
  }

  public createCart(): CartRecord {
    const id = `01JCART${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const cart: CartRecord = {
      id,
      additional_discount_percentage: null,
      lat: null,
      lng: null,
      cart_items: [],
    };
    this.carts.set(id, cart);
    return cart;
  }

  public getCart(cartId: string): CartRecord | undefined {
    return this.carts.get(cartId);
  }

  public addItemToCart(cartId: string, productId: string, quantity: number): CartRecord {
    let cart = this.carts.get(cartId);
    if (!cart) {
      cart = {
        id: cartId,
        additional_discount_percentage: null,
        lat: null,
        lng: null,
        cart_items: [],
      };
      this.carts.set(cartId, cart);
    }

    const product = this.getProductById(productId) ?? this.products[0];
    const existing = cart.cart_items.find((ci) => ci.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.cart_items.push({
        id: `01JCARTITEM${Date.now()}${cart.cart_items.length}`,
        quantity,
        discount_percentage: null,
        cart_id: cartId,
        product_id: product.id,
        product,
      });
    }
    return cart;
  }

  public updateCartItemQuantity(
    cartId: string,
    productId: string,
    quantity: number
  ): CartRecord | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;
    const item = cart.cart_items.find((ci) => ci.product_id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    return cart;
  }

  public removeCartItem(cartId: string, productId: string): boolean {
    const cart = this.carts.get(cartId);
    if (!cart) return false;
    cart.cart_items = cart.cart_items.filter((ci) => ci.product_id !== productId);
    return true;
  }

  public loginUser(
    email?: string,
    password?: string
  ): { status: number; body: Record<string, unknown> } {
    if (!email || !password) {
      return {
        status: 400,
        body: { error: 'Email and password are required' },
      };
    }

    const account = this.users.get(email.trim().toLowerCase());
    if (!account) {
      return {
        status: 401,
        body: { error: 'Invalid email or password' },
      };
    }

    if (!account.enabled) {
      return {
        status: 423,
        body: { error: 'Account locked, too many failed attempts. Please contact the administrator.' },
      };
    }

    if (account.password !== password) {
      account.failed_login_attempts += 1;
      if (account.failed_login_attempts >= 4) {
        account.enabled = false;
        return {
          status: 423,
          body: { error: 'Account locked, too many failed attempts. Please contact the administrator.' },
        };
      }
      return {
        status: 401,
        body: { error: 'Invalid email or password' },
      };
    }

    account.failed_login_attempts = 0;

    const token = generateToolshopJwt({
      sub: account.id,
      role: account.role,
      expiresInSeconds: 7200,
    });

    return {
      status: 200,
      body: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 7200,
      },
    };
  }

  public registerUser(payload: Record<string, unknown>): {
    status: number;
    body: Record<string, unknown>;
  } {
    const email = String(payload.email || '').trim().toLowerCase();
    if (!email || !payload.first_name || !payload.last_name || !payload.password) {
      return {
        status: 422,
        body: { error: 'Missing required registration fields' },
      };
    }

    if (this.users.has(email)) {
      return {
        status: 422,
        body: {
          email: ['A customer with this email address already exists.'],
        },
      };
    }

    if (payload.dob && String(payload.dob) > '2009-01-01') {
      return {
        status: 422,
        body: {
          dob: ['Customer must be at least 18 years old.'],
        },
      };
    }

    const rawAddress = (payload.address as Record<string, string>) || {};
    const newAccount: ToolshopUserAccount = {
      id: `01JUSERREG${Date.now()}`,
      first_name: String(payload.first_name),
      last_name: String(payload.last_name),
      email,
      password: String(payload.password),
      role: 'user',
      phone: String(payload.phone || '0123456789'),
      dob: String(payload.dob || '1990-01-01'),
      enabled: true,
      failed_login_attempts: 0,
      address: {
        street: rawAddress.street || String(payload.street || '100 Main St'),
        city: rawAddress.city || String(payload.city || 'San Francisco'),
        state: rawAddress.state || String(payload.state || 'CA'),
        country: rawAddress.country || String(payload.country || 'US'),
        postal_code: rawAddress.postal_code || String(payload.postal_code || '94105'),
      },
    };

    this.users.set(email, newAccount);
    return {
      status: 201,
      body: {
        id: newAccount.id,
        first_name: newAccount.first_name,
        last_name: newAccount.last_name,
        email: newAccount.email,
        phone: newAccount.phone,
        dob: newAccount.dob,
        address: newAccount.address,
      },
    };
  }

  public validatePayment(payload: {
    payment_method?: string;
    payment_details?: Record<string, string>;
  }): { status: number; body: { message: string } } {
    if (!payload.payment_method) {
      return {
        status: 400,
        body: { message: 'Payment method is required' },
      };
    }
    return {
      status: 200,
      body: { message: 'Payment was successful' },
    };
  }

  public createInvoice(payload: Record<string, unknown>): InvoiceRecord {
    const invNum = `INV-2026${String(this.invoices.length + 1001)}`;
    const method = String(payload.payment_method || 'credit-card');
    const newInv: InvoiceRecord = {
      id: `01JINV${Date.now()}`,
      user_id: String(payload.user_id || TOOLSHOP_USERS.customer.id),
      invoice_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      invoice_number: invNum,
      billing_street: String(payload.billing_street || 'Test street 98'),
      billing_city: String(payload.billing_city || 'Vienna'),
      billing_state: String(payload.billing_state || 'Vienna'),
      billing_country: String(payload.billing_country || 'AT'),
      billing_postal_code: String(payload.billing_postal_code || '1010'),
      subtotal: MathHelper.roundToTwoDecimals(Number(payload.total || 25.0)),
      total: MathHelper.roundToTwoDecimals(Number(payload.total || 25.0)),
      payment_method: method,
      payment: {
        id: `01JPAY${Date.now()}`,
        payment_method: method,
        payment_details: (payload.payment_details as Record<string, string>) || {},
      },
      status: 'COMPLETED',
      invoicelines: [
        {
          id: `01JINVLINE${Date.now()}`,
          invoice_id: invNum,
          product_id: this.products[0].id,
          unit_price: this.products[0].price,
          quantity: 1,
          product: this.products[0],
        },
      ],
    };
    this.invoices.unshift(newInv);
    return newInv;
  }

  public createMessage(payload: Record<string, unknown>): {
    status: number;
    body: MessageRecord | { error: string };
  } {
    const subject = String(payload.subject || '');
    const message = String(payload.message || '');
    if (!subject || message.length < 50) {
      return {
        status: 422,
        body: { error: 'Subject is required and message must be at least 50 characters' },
      };
    }
    const record: MessageRecord = {
      id: `01JMSG${Date.now()}`,
      name: `${payload.first_name || 'Customer'} ${payload.last_name || ''}`.trim(),
      email: String(payload.email || 'customer@practicesoftwaretesting.com'),
      subject,
      message,
      status: 'NEW',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      reply: [],
    };
    this.messages.unshift(record);
    return {
      status: 200,
      body: record,
    };
  }

  public getFavorites(): FavoriteRecord[] {
    return this.favorites;
  }

  public getInvoices(): InvoiceRecord[] {
    return this.invoices;
  }

  public getMessages(): MessageRecord[] {
    return this.messages;
  }

  private decodeValidJwt(authHeader?: string): { sub: string; role: string; exp: number } | null {
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return null;
    }
    const token = authHeader.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    try {
      const decoded = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      ) as { sub?: string; role?: string; exp?: number };
      if (!decoded || !decoded.sub) {
        return null;
      }
      const nowSec = Math.floor(Date.now() / 1000);
      if (typeof decoded.exp === 'number' && decoded.exp < nowSec) {
        return null;
      }
      return {
        sub: decoded.sub,
        role: decoded.role || 'user',
        exp: decoded.exp || nowSec + 7200,
      };
    } catch {
      return null;
    }
  }

  /**
   * Attaches Playwright route interceptor for all https://api.practicesoftwaretesting.com/** requests
   */
  public async attachToPage(page: Page): Promise<void> {
    await page.route('https://api.practicesoftwaretesting.com/**', async (route: Route) => {
      const req = route.request();
      const method = req.method().toUpperCase();
      const url = new URL(req.url());
      const pathname = url.pathname.replace(/\/+$/, '') || '/';
      const headers = this.getCorsHeaders();

      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers });
        return;
      }

      let bodyJson: Record<string, unknown> = {};
      try {
        const rawPost = req.postData();
        if (rawPost && rawPost.trim().startsWith('{')) {
          bodyJson = JSON.parse(rawPost) as Record<string, unknown>;
        }
      } catch {
        // Ignore non-JSON body (e.g. multipart FormData)
      }

      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((v, k) => {
        queryParams[k] = v;
      });
      const mergedParams = { ...queryParams, ...bodyJson };

      // 0. GraphQL endpoint (used by /comparison table)
      if (pathname === '/graphql' && method === 'POST') {
        const queryStr = String(bodyJson.query || '');
        const data: Record<string, unknown> = {};
        const regex = /(\w+):\s*product\(\s*id:\s*"([^"]+)"\s*\)/g;
        let match = regex.exec(queryStr);
        while (match !== null) {
          const alias = match[1];
          const prodId = match[2];
          const prod = this.getProductById(prodId);
          if (prod) {
            data[alias] = prod;
          }
          match = regex.exec(queryStr);
        }
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ data }),
        });
        return;
      }

      // 1. Brands
      if (pathname === '/brands' && method === 'GET') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(TOOLSHOP_BRANDS),
        });
        return;
      }

      // 2. Categories
      if ((pathname === '/categories/tree' || pathname === '/categories') && method === 'GET') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(TOOLSHOP_CATEGORIES_TREE),
        });
        return;
      }

      // 3. Product Specs Names
      if (pathname === '/product-specs/names' && method === 'GET') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify([
            { name: 'Handle Material', values: ['Bi-component', 'Recycled TPR', 'FSC Certified Beechwood'] },
            { name: 'Material', values: ['Chrome Vanadium Steel', 'Carbon Steel', 'Drop-Forged Steel'] },
          ]),
        });
        return;
      }

      // 4. Products List & Search (QUERY or GET)
      if (
        (pathname === '/products' || pathname === '/products/search') &&
        (method === 'QUERY' || method === 'GET')
      ) {
        const result = this.queryProducts(mergedParams);
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(result),
        });
        return;
      }

      // 5. Related Products
      const relatedMatch = pathname.match(/^\/products\/([^/]+)\/related$/);
      if (relatedMatch && method === 'GET') {
        const related = this.getRelatedProducts(relatedMatch[1]);
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(related),
        });
        return;
      }

      // 6. Single Product by ID
      const productMatch = pathname.match(/^\/products\/([^/]+)$/);
      if (productMatch && method === 'GET') {
        const prod = this.getProductById(productMatch[1]);
        if (!prod) {
          await route.fulfill({
            status: 404,
            headers,
            body: JSON.stringify({ message: 'Requested item not found' }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(prod),
        });
        return;
      }

      // 7. Carts endpoints
      if (pathname === '/carts' && method === 'POST') {
        const cart = this.createCart();
        await route.fulfill({
          status: 201,
          headers,
          body: JSON.stringify({ id: cart.id }),
        });
        return;
      }

      const cartQtyMatch = pathname.match(/^\/carts\/([^/]+)\/product\/quantity$/);
      if (cartQtyMatch && method === 'PUT') {
        this.updateCartItemQuantity(
          cartQtyMatch[1],
          String(bodyJson.product_id),
          Number(bodyJson.quantity || 1)
        );
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ result: 'item added or updated' }),
        });
        return;
      }

      const cartDeleteProductMatch = pathname.match(/^\/carts\/([^/]+)\/product\/([^/]+)$/);
      if (cartDeleteProductMatch && method === 'DELETE') {
        this.removeCartItem(cartDeleteProductMatch[1], cartDeleteProductMatch[2]);
        await route.fulfill({ status: 204, headers });
        return;
      }

      const cartIdMatch = pathname.match(/^\/carts\/([^/]+)$/);
      if (cartIdMatch) {
        const cartId = cartIdMatch[1];
        if (method === 'POST') {
          this.addItemToCart(
            cartId,
            String(bodyJson.product_id),
            Number(bodyJson.quantity || 1)
          );
          await route.fulfill({
            status: 200,
            headers,
            body: JSON.stringify({ result: 'item added or updated' }),
          });
          return;
        }
        if (method === 'GET') {
          const cart = this.getCart(cartId) ?? {
            id: cartId,
            additional_discount_percentage: null,
            lat: null,
            lng: null,
            cart_items: [],
          };
          await route.fulfill({
            status: 200,
            headers,
            body: JSON.stringify(cart),
          });
          return;
        }
        if (method === 'DELETE') {
          this.carts.delete(cartId);
          await route.fulfill({ status: 204, headers });
          return;
        }
      }

      // 8. Users & Authentication
      if (pathname === '/users/login' && method === 'POST') {
        const res = this.loginUser(
          String(bodyJson.email || ''),
          String(bodyJson.password || '')
        );
        await route.fulfill({
          status: res.status,
          headers,
          body: JSON.stringify(res.body),
        });
        return;
      }

      if (pathname === '/users/register' && method === 'POST') {
        const res = this.registerUser(bodyJson);
        await route.fulfill({
          status: res.status,
          headers,
          body: JSON.stringify(res.body),
        });
        return;
      }

      if (pathname === '/users/forgot-password' && method === 'POST') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ result: 'success' }),
        });
        return;
      }

      if (pathname === '/users/refresh' && method === 'GET') {
        const validClaims = this.decodeValidJwt(req.headers()['authorization']);
        if (!validClaims) {
          await route.fulfill({
            status: 401,
            headers,
            body: JSON.stringify({ message: 'Unauthenticated.' }),
          });
          return;
        }
        const token = generateToolshopJwt({
          sub: validClaims.sub,
          role: validClaims.role === 'admin' ? 'admin' : 'user',
          expiresInSeconds: 7200,
        });
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ access_token: token }),
        });
        return;
      }

      if (pathname === '/users/me' && method === 'GET') {
        const validClaims = this.decodeValidJwt(req.headers()['authorization']);
        if (!validClaims) {
          await route.fulfill({
            status: 401,
            headers,
            body: JSON.stringify({ message: 'Unauthenticated.' }),
          });
          return;
        }
        const foundById = Array.from(this.users.values()).find((u) => u.id === validClaims.sub);
        const targetUser = foundById ?? this.users.get(TOOLSHOP_USERS.customer.email)!;
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({
            id: targetUser.id,
            first_name: targetUser.first_name,
            last_name: targetUser.last_name,
            email: targetUser.email,
            phone: targetUser.phone,
            dob: targetUser.dob,
            address: {
              ...targetUser.address,
              house_number: '98',
            },
          }),
        });
        return;
      }

      if (pathname.startsWith('/users/') && method === 'PUT') {
        const customer = this.users.get(TOOLSHOP_USERS.customer.email)!;
        if (bodyJson.first_name) customer.first_name = String(bodyJson.first_name);
        if (bodyJson.last_name) customer.last_name = String(bodyJson.last_name);
        if (bodyJson.phone) customer.phone = String(bodyJson.phone);
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      if (pathname === '/users/change-password' && method === 'POST') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      // 9. Payment Check & Invoices
      if (pathname === '/payment/check' && method === 'POST') {
        const res = this.validatePayment(bodyJson);
        if (res.status === 200) {
          this.createInvoice(bodyJson);
        }
        await route.fulfill({
          status: res.status,
          headers,
          body: JSON.stringify(res.body),
        });
        return;
      }

      if ((pathname === '/invoices' || pathname === '/invoices/guest') && method === 'POST') {
        const inv = this.createInvoice(bodyJson);
        await route.fulfill({
          status: 201,
          headers,
          body: JSON.stringify(inv),
        });
        return;
      }

      if (pathname === '/invoices' && method === 'GET') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({
            current_page: 1,
            data: this.invoices,
            from: 1,
            last_page: 1,
            per_page: 15,
            to: this.invoices.length,
            total: this.invoices.length,
          }),
        });
        return;
      }

      const invoiceIdMatch = pathname.match(/^\/invoices\/([^/]+)$/);
      if (invoiceIdMatch && method === 'GET') {
        const inv = this.invoices.find((i) => i.id === invoiceIdMatch[1]) ?? this.invoices[0];
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(inv),
        });
        return;
      }

      // 10. Favorites
      if (pathname === '/favorites' && method === 'GET') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(this.favorites),
        });
        return;
      }

      if (pathname === '/favorites' && method === 'POST') {
        const prodId = String(bodyJson.product_id || this.products[0].id);
        const prod = this.getProductById(prodId) ?? this.products[0];
        const exists = this.favorites.find((f) => f.product_id === prodId);
        if (exists) {
          await route.fulfill({
            status: 422,
            headers,
            body: JSON.stringify({ message: 'Duplicate Entry' }),
          });
          return;
        }
        const fav: FavoriteRecord = {
          id: `01JFAV${Date.now()}`,
          product_id: prod.id,
          user_id: TOOLSHOP_USERS.customer.id,
          product: prod,
        };
        this.favorites.push(fav);
        await route.fulfill({
          status: 201,
          headers,
          body: JSON.stringify(fav),
        });
        return;
      }

      const favDeleteMatch = pathname.match(/^\/favorites\/([^/]+)$/);
      if (favDeleteMatch && method === 'DELETE') {
        this.favorites = this.favorites.filter((f) => f.id !== favDeleteMatch[1]);
        await route.fulfill({ status: 204, headers });
        return;
      }

      // 11. Contact Support Messages
      if (pathname === '/messages' && method === 'POST') {
        const res = this.createMessage(bodyJson);
        await route.fulfill({
          status: res.status,
          headers,
          body: JSON.stringify(res.body),
        });
        return;
      }

      if (pathname.match(/^\/messages\/[^/]+\/attach-file$/) && method === 'POST') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      if (pathname === '/messages' && method === 'GET') {
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify({
            current_page: 1,
            data: this.messages,
            from: 1,
            last_page: 1,
            per_page: 15,
            to: this.messages.length,
            total: this.messages.length,
          }),
        });
        return;
      }

      const msgIdMatch = pathname.match(/^\/messages\/([^/]+)$/);
      if (msgIdMatch && method === 'GET') {
        const msg = this.messages.find((m) => m.id === msgIdMatch[1]) ?? this.messages[0];
        await route.fulfill({
          status: 200,
          headers,
          body: JSON.stringify(msg),
        });
        return;
      }

      if (pathname.includes('postcode')) {
        await route.fulfill({
          status: 404,
          headers,
          body: JSON.stringify({ message: 'Postcode lookup disabled in deterministic test mode' }),
        });
        return;
      }

      // Default fallback for any other API endpoint (e.g. TOTP setup, live sales-stream)
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          data: [],
        }),
      });
    });
  }
}
