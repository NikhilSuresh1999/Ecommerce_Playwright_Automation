export interface PaymentMethodScenario {
  scenarioId: string;
  methodValue:
    | 'bank-transfer'
    | 'cash-on-delivery'
    | 'credit-card'
    | 'buy-now-pay-later'
    | 'gift-card';
  displayName: string;
  fields: Record<string, string>;
}

export interface ContactTicketScenario {
  ticketId: string;
  subjectValue:
    | 'customer-service'
    | 'webmaster'
    | 'return'
    | 'payments'
    | 'warranty'
    | 'status-of-order';
  subjectLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface LanguageLocaleScenario {
  localeCode: 'en' | 'de' | 'es' | 'fr' | 'nl' | 'tr';
  testId: 'lang-en' | 'lang-de' | 'lang-es' | 'lang-fr' | 'lang-nl' | 'lang-tr';
  languageName: string;
  expectedButtonLabel: string;
}

export const PAYMENT_METHOD_SCENARIOS: PaymentMethodScenario[] = [
  {
    scenarioId: 'PAY-01',
    methodValue: 'bank-transfer',
    displayName: 'Bank Transfer',
    fields: {
      bank_name: 'Global Enterprise Bank',
      account_name: 'Jane Doe',
      account_number: '9876543210',
    },
  },
  {
    scenarioId: 'PAY-02',
    methodValue: 'cash-on-delivery',
    displayName: 'Cash on Delivery',
    fields: {},
  },
  {
    scenarioId: 'PAY-03',
    methodValue: 'credit-card',
    displayName: 'Credit Card',
    fields: {
      credit_card_number: '1111-2222-3333-4444',
      expiration_date: '12/2029',
      cvv: '789',
      card_holder_name: 'Jane Doe',
    },
  },
  {
    scenarioId: 'PAY-04',
    methodValue: 'buy-now-pay-later',
    displayName: 'Buy Now Pay Later (3 Monthly Installments)',
    fields: {
      monthly_installments: '3',
    },
  },
  {
    scenarioId: 'PAY-05',
    methodValue: 'buy-now-pay-later',
    displayName: 'Buy Now Pay Later (6 Monthly Installments)',
    fields: {
      monthly_installments: '6',
    },
  },
  {
    scenarioId: 'PAY-06',
    methodValue: 'buy-now-pay-later',
    displayName: 'Buy Now Pay Later (9 Monthly Installments)',
    fields: {
      monthly_installments: '9',
    },
  },
  {
    scenarioId: 'PAY-07',
    methodValue: 'buy-now-pay-later',
    displayName: 'Buy Now Pay Later (12 Monthly Installments)',
    fields: {
      monthly_installments: '12',
    },
  },
  {
    scenarioId: 'PAY-08',
    methodValue: 'gift-card',
    displayName: 'Enterprise Gift Card',
    fields: {
      gift_card_number: 'GC2026ENTERPRISE99',
      validation_code: 'VAL9988',
    },
  },
];

export const CONTACT_TICKET_SCENARIOS: ContactTicketScenario[] = [
  {
    ticketId: 'TKT-01',
    subjectValue: 'customer-service',
    subjectLabel: 'Customer service',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    message:
      'Hello Toolshop Support, I would like to inquire about bulk enterprise pricing for 50 units of the Cordless Drill 24V for our construction division.',
  },
  {
    ticketId: 'TKT-02',
    subjectValue: 'webmaster',
    subjectLabel: 'Webmaster',
    firstName: 'Jordan',
    lastName: 'Taylor',
    email: 'jordan.taylor@example.com',
    message:
      'Reporting a technical suggestion regarding the high-resolution product specification sheet PDF download link on the Bolt Cutters product page.',
  },
  {
    ticketId: 'TKT-03',
    subjectValue: 'return',
    subjectLabel: 'Return',
    firstName: 'Oliver',
    lastName: 'Sterling',
    email: 'oliver.sterling@example.co.uk',
    message:
      'Requesting a return merchandise authorization (RMA) for invoice INV-20260001 as we ordered the 180mm Pliers instead of the 200mm Combination Pliers.',
  },
  {
    ticketId: 'TKT-04',
    subjectValue: 'payments',
    subjectLabel: 'Payments',
    firstName: 'Chloe',
    lastName: 'Tremblay',
    email: 'chloe.tremblay@example.ca',
    message:
      'Could you please confirm whether our wire transfer payment under reference GEB-9876543210 has been reconciled with our corporate account?',
  },
  {
    ticketId: 'TKT-05',
    subjectValue: 'warranty',
    subjectLabel: 'Warranty',
    firstName: 'Lukas',
    lastName: 'Weber',
    email: 'lukas.weber@example.de',
    message:
      'Submitting a 5-year manufacturer warranty claim for our ForgeFlex Claw Hammer purchased last quarter under corporate procurement order PO-8821.',
  },
  {
    ticketId: 'TKT-06',
    subjectValue: 'status-of-order',
    subjectLabel: 'Status of my order',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@example.in',
    message:
      'Checking the dispatch and freight tracking status for our recent heavy equipment rental and power tool order scheduled for Monday morning delivery.',
  },
];

export const LANGUAGE_LOCALE_SCENARIOS: LanguageLocaleScenario[] = [
  {
    localeCode: 'en',
    testId: 'lang-en',
    languageName: 'English',
    expectedButtonLabel: 'EN',
  },
  {
    localeCode: 'de',
    testId: 'lang-de',
    languageName: 'German (Deutsch)',
    expectedButtonLabel: 'DE',
  },
  {
    localeCode: 'es',
    testId: 'lang-es',
    languageName: 'Spanish (Español)',
    expectedButtonLabel: 'ES',
  },
  {
    localeCode: 'fr',
    testId: 'lang-fr',
    languageName: 'French (Français)',
    expectedButtonLabel: 'FR',
  },
  {
    localeCode: 'nl',
    testId: 'lang-nl',
    languageName: 'Dutch (Nederlands)',
    expectedButtonLabel: 'NL',
  },
  {
    localeCode: 'tr',
    testId: 'lang-tr',
    languageName: 'Turkish (Türkçe)',
    expectedButtonLabel: 'TR',
  },
];

