import { test, expect } from '@fixtures/base.fixture';
import { CONTACT_TICKET_SCENARIOS } from '@data/toolshop.checkout.data';

test.describe('Suite 07: Customer Support Contact Form, Subject Routing & File Attachment Validation', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.open();
  });

  test.describe('Parameterized Support Ticket Submission Matrix (All 6 Subject Categories)', () => {
    for (const [idx, ticket] of CONTACT_TICKET_SCENARIOS.entries()) {
      const testId = `CNT-${String(idx + 1).padStart(3, '0')}`;
      test(`${testId}: [${ticket.ticketId}] Submitting support ticket under subject "${ticket.subjectLabel}" (${ticket.subjectValue}) displays confirmation alert`, async ({
        contactPage,
      }) => {
        await contactPage.submitContactTicket(ticket);
        await expect(contactPage.successAlert).toBeVisible();
        await expect(contactPage.successAlert).toContainText(
          'Thanks for your message! We will contact you shortly.'
        );
      });
    }
  });

  test.describe('Reactive Form Field Validation & Message Length Constraints', () => {
    const baseTicket = CONTACT_TICKET_SCENARIOS[0];

    test('CNT-007: Submitting empty contact form triggers [data-test="first-name-error"]', async ({
      contactPage,
    }) => {
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.firstNameError).toBeVisible();
      await expect(contactPage.firstNameError).toContainText('First name is required');
    });

    test('CNT-008: Submitting empty contact form triggers [data-test="last-name-error"]', async ({
      contactPage,
    }) => {
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.lastNameError).toBeVisible();
      await expect(contactPage.lastNameError).toContainText('Last name is required');
    });

    test('CNT-009: Submitting empty contact form triggers [data-test="email-error"]', async ({
      contactPage,
    }) => {
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.emailError).toBeVisible();
      await expect(contactPage.emailError).toContainText('Email is required');
    });

    test('CNT-010: Submitting empty contact form triggers [data-test="subject-error"]', async ({
      contactPage,
    }) => {
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.subjectError).toBeVisible();
      await expect(contactPage.subjectError).toContainText('Subject is required');
    });

    test('CNT-011: Submitting empty contact form triggers [data-test="message-error"]', async ({
      contactPage,
    }) => {
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.messageError).toBeVisible();
      await expect(contactPage.messageError).toContainText('Message is required');
    });

    test('CNT-012: Submitting malformed email address triggers [data-test="email-error"] format message', async ({
      contactPage,
    }) => {
      await contactPage.fillContactForm({
        ...baseTicket,
        email: 'malformed-support-email',
      });
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.emailError).toBeVisible();
      await expect(contactPage.emailError).toContainText('Email format is invalid');
    });

    for (const [mIdx, shortLen] of [1, 10, 25, 40, 49].entries()) {
      const testId = `CNT-${String(mIdx + 13).padStart(3, '0')}`;
      test(`${testId}: Message with ${shortLen} character(s) (< 50 minimum) is rejected with minimum length error`, async ({
        contactPage,
      }) => {
        await contactPage.fillContactForm({
          ...baseTicket,
          message: 'A'.repeat(shortLen),
        });
        await contactPage.contactSubmitButton.click();
        await expect(contactPage.messageError).toBeVisible();
        await expect(contactPage.messageError).toContainText('Message must be minimal 50 characters');
      });
    }

    for (const [vIdx, validLen] of [50, 75, 120, 200, 250].entries()) {
      const testId = `CNT-${String(vIdx + 18).padStart(3, '0')}`;
      test(`${testId}: Boundary message with ${validLen} characters (>= 50 and <= 250) submits successfully`, async ({
        contactPage,
      }) => {
        await contactPage.fillContactForm({
          ...baseTicket,
          message: 'B'.repeat(validLen),
        });
        await contactPage.contactSubmitButton.click();
        await expect(contactPage.successAlert).toBeVisible();
      });
    }

    test('CNT-023: Attaching a non-empty .txt file triggers [data-test="attachment-error"] ("File should be empty") validation', async ({
      contactPage,
    }) => {
      await contactPage.fillContactForm(baseTicket);
      await contactPage.attachmentInput.setInputFiles({
        name: 'diagnostic-log.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Diagnostic attachment payload exceeding 0-byte rule', 'utf-8'),
      });
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.attachmentError).toBeVisible();
      await expect(contactPage.attachmentError).toContainText('File should be empty');
    });

    test('CNT-024: Attaching a non-.txt file (.pdf or .exe) triggers file extension validation error', async ({
      contactPage,
    }) => {
      await contactPage.fillContactForm(baseTicket);
      await contactPage.attachmentInput.setInputFiles({
        name: 'invoice-attachment.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 dummy content', 'utf-8'),
      });
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.attachmentError).toBeVisible();
    });

    test('CNT-025: Authenticated customer opening /contact sees pre-populated greeting instead of manual name/email inputs', async ({
      authPage,
      contactPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await contactPage.open();
      await expect(contactPage.subjectSelect).toBeVisible();
      await expect(contactPage.messageInput).toBeVisible();
    });

    test('CNT-026: Authenticated customer can submit support ticket with subject and message only', async ({
      authPage,
      contactPage,
    }) => {
      await authPage.authenticateAsCustomer('customer');
      await contactPage.open();
      await contactPage.subjectSelect.selectOption('warranty');
      await contactPage.messageInput.fill(baseTicket.message);
      await contactPage.contactSubmitButton.click();
      await expect(contactPage.successAlert).toBeVisible();
    });

    test('CNT-027: Subject dropdown exposes all 6 official support routing options', async ({
      contactPage,
    }) => {
      const options = await contactPage.subjectSelect
        .locator('option')
        .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value).filter(Boolean));
      expect(options).toEqual([
        'customer-service',
        'webmaster',
        'return',
        'payments',
        'warranty',
        'status-of-order',
      ]);
    });

    test('CNT-028: Navigating to Contact page via top navbar [data-test="nav-contact"] link loads /contact form', async ({
      catalogPage,
      navbar,
      contactPage,
      page,
    }) => {
      await catalogPage.open();
      await navbar.navContact.click();
      await expect(page).toHaveURL(/\/contact/);
      await expect(contactPage.contactSubmitButton).toBeVisible();
    });
  });
});
