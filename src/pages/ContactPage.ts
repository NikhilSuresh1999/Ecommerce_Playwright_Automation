import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ContactTicketScenario } from '@data/toolshop.checkout.data';

export class ContactPage extends BasePage {
  public readonly firstNameInput: Locator;
  public readonly lastNameInput: Locator;
  public readonly emailInput: Locator;
  public readonly subjectSelect: Locator;
  public readonly messageInput: Locator;
  public readonly attachmentInput: Locator;
  public readonly contactSubmitButton: Locator;

  // Validation error locators
  public readonly firstNameError: Locator;
  public readonly lastNameError: Locator;
  public readonly emailError: Locator;
  public readonly subjectError: Locator;
  public readonly messageError: Locator;
  public readonly attachmentError: Locator;
  public readonly successAlert: Locator;

  constructor(page: Page) {
    super(page, 'ContactPage');
    this.firstNameInput = page.locator('[data-test="first-name"]');
    this.lastNameInput = page.locator('[data-test="last-name"]');
    this.emailInput = page.locator('[data-test="email"]');
    this.subjectSelect = page.locator('[data-test="subject"]');
    this.messageInput = page.locator('[data-test="message"]');
    this.attachmentInput = page.locator('[data-test="attachment"]');
    this.contactSubmitButton = page.locator('[data-test="contact-submit"]');

    this.firstNameError = page.locator('[data-test="first-name-error"]');
    this.lastNameError = page.locator('[data-test="last-name-error"]');
    this.emailError = page.locator('[data-test="email-error"]');
    this.subjectError = page.locator('[data-test="subject-error"]');
    this.messageError = page.locator('[data-test="message-error"]');
    this.attachmentError = page.locator('[data-test="attachment-error"]');
    this.successAlert = page.locator('.alert-success');
  }

  public async open(): Promise<void> {
    await this.navigateTo('/contact');
    await expect(this.contactSubmitButton).toBeVisible();
  }

  public async fillContactForm(ticket: ContactTicketScenario): Promise<void> {
    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(ticket.firstName);
      await this.lastNameInput.fill(ticket.lastName);
      await this.emailInput.fill(ticket.email);
    }
    await this.subjectSelect.selectOption(ticket.subjectValue);
    await this.messageInput.fill(ticket.message);
  }

  public async submitContactTicket(ticket: ContactTicketScenario): Promise<void> {
    await this.fillContactForm(ticket);
    await this.contactSubmitButton.click();
  }
}

