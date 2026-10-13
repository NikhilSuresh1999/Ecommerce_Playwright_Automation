import { Page, Locator, expect } from '@playwright/test';
import { EnvConfig } from '@config/env.config';
import { TestLogger } from '@utils/logger';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: TestLogger;

  constructor(page: Page, pageName = 'BasePage') {
    this.page = page;
    this.logger = new TestLogger(pageName);
  }

  public async navigateTo(pathOrUrl = '/'): Promise<void> {
    const targetUrl = pathOrUrl.startsWith('http')
      ? pathOrUrl
      : `${EnvConfig.baseUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
    this.logger.step(`Navigating to ${targetUrl}`);
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  public getCurrentUrl(): string {
    return this.page.url();
  }

  public async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  public async verifyUrlContains(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  public async reloadPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  public async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => window.localStorage.getItem(k), key);
  }

  public async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ k, v }) => window.localStorage.setItem(k, v), {
      k: key,
      v: value,
    });
  }

  public async getSessionStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => window.sessionStorage.getItem(k), key);
  }

  protected async getTrimmedText(locator: Locator): Promise<string> {
    await locator.first().waitFor({ state: 'visible' });
    const text = await locator.first().textContent();
    return (text ?? '').trim();
  }
}

