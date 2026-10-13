import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NavbarComponent extends BasePage {
  public readonly notificationBar: Locator;
  public readonly navHome: Locator;
  public readonly navCategories: Locator;
  public readonly navHandTools: Locator;
  public readonly navPowerTools: Locator;
  public readonly navOther: Locator;
  public readonly navSpecialTools: Locator;
  public readonly navRentals: Locator;
  public readonly navContact: Locator;
  public readonly navSignIn: Locator;
  public readonly navMenu: Locator;
  public readonly navMyAccount: Locator;
  public readonly navMyProfile: Locator;
  public readonly navMyInvoices: Locator;
  public readonly navMyFavorites: Locator;
  public readonly navMyMessages: Locator;
  public readonly navSignOut: Locator;
  public readonly navCart: Locator;
  public readonly cartQuantityBadge: Locator;
  public readonly languageSelect: Locator;
  public readonly chatToggle: Locator;
  public readonly chatWindow: Locator;
  public readonly chatInput: Locator;
  public readonly chatSend: Locator;
  public readonly chatClose: Locator;
  public readonly liveActivityToggle: Locator;
  public readonly liveActivityWindow: Locator;
  public readonly liveActivityClose: Locator;
  public readonly footerExplore: Locator;
  public readonly footerCourses: Locator;
  public readonly footerSpector: Locator;
  public readonly footerGithub: Locator;

  constructor(page: Page) {
    super(page, 'NavbarComponent');
    this.notificationBar = page.locator('[data-test="notification-bar"]');
    this.navHome = page.locator('[data-test="nav-home"]');
    this.navCategories = page.locator('[data-test="nav-categories"]');
    this.navHandTools = page.locator('[data-test="nav-hand-tools"]');
    this.navPowerTools = page.locator('[data-test="nav-power-tools"]');
    this.navOther = page.locator('[data-test="nav-other"]');
    this.navSpecialTools = page.locator('[data-test="nav-special-tools"]');
    this.navRentals = page.locator('[data-test="nav-rentals"]');
    this.navContact = page.locator('[data-test="nav-contact"]');
    this.navSignIn = page.locator('[data-test="nav-sign-in"]');
    this.navMenu = page.locator('[data-test="nav-menu"]');
    this.navMyAccount = page.locator('[data-test="nav-my-account"]');
    this.navMyProfile = page.locator('[data-test="nav-my-profile"]');
    this.navMyInvoices = page.locator('[data-test="nav-my-invoices"]');
    this.navMyFavorites = page.locator('[data-test="nav-my-favorites"]');
    this.navMyMessages = page.locator('[data-test="nav-my-messages"]');
    this.navSignOut = page.locator('[data-test="nav-sign-out"]');
    this.navCart = page.locator('[data-test="nav-cart"]');
    this.cartQuantityBadge = page.locator('[data-test="cart-quantity"]');
    this.languageSelect = page.locator('[data-test="language-select"]');
    this.chatToggle = page.locator('[data-test="chat-toggle"]');
    this.chatWindow = page.locator('[data-test="chat-window"]');
    this.chatInput = page.locator('[data-test="chat-input"]');
    this.chatSend = page.locator('[data-test="chat-send"]');
    this.chatClose = page.locator('[data-test="chat-close"]');
    this.liveActivityToggle = page.locator('[data-test="live-activity-toggle"]');
    this.liveActivityWindow = page.locator('[data-test="live-activity-window"]');
    this.liveActivityClose = page.locator('[data-test="live-activity-close"]');
    this.footerExplore = page.locator('[data-test="footer-explore"]');
    this.footerCourses = page.locator('[data-test="footer-learn-courses"]');
    this.footerSpector = page.locator('[data-test="footer-learn-spector"]');
    this.footerGithub = page.locator('[data-test="footer-learn-github"]');
  }

  public async selectCategoryFromDropdown(
    target: 'hand-tools' | 'power-tools' | 'other' | 'special-tools' | 'rentals'
  ): Promise<void> {
    await this.navCategories.click();
    const map: Record<string, Locator> = {
      'hand-tools': this.navHandTools,
      'power-tools': this.navPowerTools,
      other: this.navOther,
      'special-tools': this.navSpecialTools,
      rentals: this.navRentals,
    };
    await map[target].click();
  }

  public async switchLanguage(
    langTestId: 'lang-en' | 'lang-de' | 'lang-es' | 'lang-fr' | 'lang-nl' | 'lang-tr' | 'lang-el'
  ): Promise<void> {
    await this.languageSelect.click();
    await this.page.locator(`[data-test="${langTestId}"]`).click();
  }

  public async getCartQuantityCount(): Promise<number> {
    if (!(await this.cartQuantityBadge.isVisible())) {
      return 0;
    }
    const raw = await this.cartQuantityBadge.textContent();
    return Number(raw?.trim() || 0);
  }

  public async signOut(): Promise<void> {
    await this.navMenu.click();
    await expect(this.navSignOut).toBeVisible();
    await this.navSignOut.click();
  }
}

