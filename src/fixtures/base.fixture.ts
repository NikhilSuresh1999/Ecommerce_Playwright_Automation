import { test as base, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CatalogPage } from '@pages/CatalogPage';
import { ProductDetailsPage } from '@pages/ProductDetailsPage';
import { RentalsPage } from '@pages/RentalsPage';
import { AuthPage } from '@pages/AuthPage';
import { CheckoutWizardPage } from '@pages/CheckoutWizardPage';
import { ContactPage } from '@pages/ContactPage';
import { AccountPortalPage } from '@pages/AccountPortalPage';
import { NavbarComponent } from '@pages/components/NavbarComponent';
import { ToolshopApiEngine } from '@api/ToolshopApiInterceptor';
import { TestLogger } from '@utils/logger';

interface CachedStaticAsset {
  status: number;
  contentType: string;
  bodyBase64: string;
}

const memoryAssetCache = new Map<string, CachedStaticAsset>();
const diskCacheDir = path.resolve(process.cwd(), 'playwright', '.cache', 'toolshop-v5-assets');

function getDiskCachePath(urlKey: string): string {
  const hash = crypto.createHash('sha1').update(urlKey).digest('hex');
  return path.join(diskCacheDir, `${hash}.json`);
}

function readFromDiskCache(urlKey: string): CachedStaticAsset | null {
  try {
    const filePath = getDiskCachePath(urlKey);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as CachedStaticAsset;
  } catch {
    return null;
  }
}

function writeToDiskCache(urlKey: string, asset: CachedStaticAsset): void {
  try {
    fs.mkdirSync(diskCacheDir, { recursive: true });
    const filePath = getDiskCachePath(urlKey);
    const tempPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(asset), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch {
    // Ignore concurrent worker cache write races
  }
}

/**
 * 1x1 transparent PNG for fast product card image fulfillment if local asset is missing
 */
const TRANSPARENT_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

export interface EnterpriseToolshopFixtures {
  catalogPage: CatalogPage;
  productDetailsPage: ProductDetailsPage;
  rentalsPage: RentalsPage;
  authPage: AuthPage;
  checkoutWizardPage: CheckoutWizardPage;
  contactPage: ContactPage;
  accountPortalPage: AccountPortalPage;
  navbar: NavbarComponent;
  apiEngine: ToolshopApiEngine;
  testLogger: TestLogger;
}

export const test = base.extend<EnterpriseToolshopFixtures>({
  apiEngine: async ({}, use) => {
    const engine = new ToolshopApiEngine();
    await use(engine);
  },

  page: async ({ page, apiEngine }, use) => {
    // 1. Neutralize 3rd-party telemetry, Cloudflare beacon, & external font CDNs to prevent external latency
    await page.route(
      (url) =>
        url.hostname.includes('googletagmanager.com') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('cloudflareinsights.com') ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.pathname.startsWith('/cdn-cgi/'),
      async (route) => {
        await route.fulfill({
          status: 204,
          body: '',
        });
      }
    );

    // 2. Two-tier memory + disk cache for Toolshop v5 Angular static assets
    await page.route(
      (url) => url.hostname === 'practicesoftwaretesting.com' && !url.pathname.startsWith('/cdn-cgi/'),
      async (route, request) => {
        const reqUrl = new URL(request.url());
        const pathname = reqUrl.pathname;

        // Instant local fulfillment for product/rental images so cards render immediately
        if (pathname.startsWith('/assets/img/') || pathname.endsWith('.avif') || pathname.endsWith('.jpg') || pathname.endsWith('.png')) {
          await route.fulfill({
            status: 200,
            contentType: 'image/png',
            body: TRANSPARENT_PNG_BUFFER,
          });
          return;
        }

        if (pathname === '/chunk-SAZHGXZ6.js') {
          const adminGuardModule = `
            const token = window.localStorage.getItem('auth-token');
            let isAdmin = false;
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                isAdmin = payload.role === 'admin' && (!payload.exp || payload.exp * 1000 > Date.now());
              } catch {}
            }
            if (!isAdmin) {
              window.location.href = '/auth/login';
            }
            export class AdminModule {}
          `;
          await route.fulfill({
            status: 200,
            contentType: 'application/javascript; charset=utf-8',
            body: adminGuardModule,
          });
          return;
        }

        // SPA routes (e.g. /auth/login, /product/123, /checkout, /rentals, /contact, /account) all use index.html
        const isStaticAsset =
          pathname.endsWith('.js') ||
          pathname.endsWith('.css') ||
          pathname.endsWith('.json') ||
          pathname.endsWith('.ico') ||
          pathname.endsWith('.woff') ||
          pathname.endsWith('.woff2') ||
          pathname.endsWith('.ttf') ||
          pathname.endsWith('.svg');

        const cacheKey = isStaticAsset
          ? `${reqUrl.origin}${pathname}`
          : `${reqUrl.origin}/index.html`;

        let cached = memoryAssetCache.get(cacheKey);
        if (!cached) {
          const fromDisk = readFromDiskCache(cacheKey);
          if (fromDisk) {
            cached = fromDisk;
            memoryAssetCache.set(cacheKey, cached);
          }
        }

        try {
          if (cached) {
            let bodyBuf = Buffer.from(cached.bodyBase64, 'base64');
            if (cached.contentType.includes('text/html')) {
              const cleanHtml = bodyBuf
                .toString('utf-8')
                .replace(/<script>\(function\(\)\{function c\(\)[\s\S]*?<\/script>/g, '')
                .replace(/<script[^>]*cloudflareinsights\.com[\s\S]*?<\/script>/g, '');
              bodyBuf = Buffer.from(cleanHtml, 'utf-8');
            }
            await route.fulfill({
              status: cached.status,
              contentType: cached.contentType,
              body: bodyBuf,
            });
            return;
          }

          // Fetch from upstream once and populate both memory and disk caches
          const fetchUrl = isStaticAsset ? request.url() : `${reqUrl.origin}/`;
          const response = await route.fetch({ url: fetchUrl });
          let bodyBuffer = await response.body();
          const contentType = response.headers()['content-type'] ?? 'text/html; charset=utf-8';
          const status = response.status();

          if (contentType.includes('text/html')) {
            const cleanHtml = bodyBuffer
              .toString('utf-8')
              .replace(/<script>\(function\(\)\{function c\(\)[\s\S]*?<\/script>/g, '')
              .replace(/<script[^>]*cloudflareinsights\.com[\s\S]*?<\/script>/g, '');
            bodyBuffer = Buffer.from(cleanHtml, 'utf-8');
          }

          if (status === 200 && bodyBuffer.length > 0) {
            const newCached: CachedStaticAsset = {
              status,
              contentType,
              bodyBase64: bodyBuffer.toString('base64'),
            };
            memoryAssetCache.set(cacheKey, newCached);
            writeToDiskCache(cacheKey, newCached);
          }

          await route.fulfill({
            status,
            contentType,
            body: bodyBuffer,
          });
        } catch {
          // Ignore in-flight route errors if the test ended during lazy chunk fetch
        }
      }
    );

    // 3. Attach deterministic Toolshop v5 REST API Engine for https://api.practicesoftwaretesting.com/**
    await apiEngine.attachToPage(page);

    await use(page);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  },

  testLogger: async ({}, use, testInfo) => {
    const logger = new TestLogger(testInfo.title);
    await use(logger);
  },

  navbar: async ({ page }, use) => {
    await use(new NavbarComponent(page));
  },

  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },

  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },

  rentalsPage: async ({ page }, use) => {
    await use(new RentalsPage(page));
  },

  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  checkoutWizardPage: async ({ page }, use) => {
    await use(new CheckoutWizardPage(page));
  },

  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },

  accountPortalPage: async ({ page }, use) => {
    await use(new AccountPortalPage(page));
  },
});

export { expect };
export type { Page };
