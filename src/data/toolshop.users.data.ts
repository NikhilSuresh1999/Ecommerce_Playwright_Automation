import { EnvConfig } from '@config/env.config';

export interface ToolshopUserAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone: string;
  dob: string;
  enabled: boolean;
  failed_login_attempts: number;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

export interface NegativeLoginScenario {
  caseId: string;
  description: string;
  email: string;
  password: string;
  expectedErrorField: 'email-error' | 'password-error' | 'login-error';
  expectedMessageSubstring: string;
}

export interface RegistrationCustomerProfile {
  profileId: string;
  label: string;
  firstName: string;
  lastName: string;
  dob: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  password: string;
}

export const TOOLSHOP_USERS: Record<string, ToolshopUserAccount> = {
  customer: {
    id: '01JUSERCUSTOMER00000000001',
    first_name: 'Jane',
    last_name: 'Doe',
    email: EnvConfig.credentials.customerEmail,
    password: EnvConfig.credentials.password,
    role: 'user',
    phone: '0123456789',
    dob: '1990-05-15',
    enabled: true,
    failed_login_attempts: 0,
    address: {
      street: 'Test street 98',
      city: 'Vienna',
      state: 'Vienna',
      country: 'AT',
      postal_code: '1010',
    },
  },
  customer2: {
    id: '01JUSERCUSTOMER00000000002',
    first_name: 'Jack',
    last_name: 'Howe',
    email: EnvConfig.credentials.customerSecondaryEmail,
    password: EnvConfig.credentials.password,
    role: 'user',
    phone: '0987654321',
    dob: '1988-11-20',
    enabled: true,
    failed_login_attempts: 0,
    address: {
      street: 'Market Street 450',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94105',
    },
  },
  admin: {
    id: '01JUSERADMIN00000000000001',
    first_name: 'John',
    last_name: 'Doe',
    email: EnvConfig.credentials.adminEmail,
    password: EnvConfig.credentials.password,
    role: 'admin',
    phone: '0112233445',
    dob: '1985-01-10',
    enabled: true,
    failed_login_attempts: 0,
    address: {
      street: 'Admin Plaza 1',
      city: 'Amsterdam',
      state: 'North Holland',
      country: 'NL',
      postal_code: '1012 JS',
    },
  },
  locked: {
    id: '01JUSERLOCKED0000000000003',
    first_name: 'Locked',
    last_name: 'Account',
    email: 'locked@practicesoftwaretesting.com',
    password: EnvConfig.credentials.password,
    role: 'user',
    phone: '0555666777',
    dob: '1992-03-12',
    enabled: false,
    failed_login_attempts: 5,
    address: {
      street: 'Blocked Way 403',
      city: 'London',
      state: 'Greater London',
      country: 'GB',
      postal_code: 'SW1A 1AA',
    },
  },
};

/**
 * Generates a valid Base64URL-encoded JWT token matching Toolshop v5's JwtHelperService decoder
 */
export function generateToolshopJwt(options: {
  sub: string;
  role: 'user' | 'admin';
  expiresInSeconds?: number;
}): string {
  const toBase64Url = (obj: Record<string, unknown>): string =>
    Buffer.from(JSON.stringify(obj), 'utf-8')
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + (options.expiresInSeconds ?? 7200);

  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = toBase64Url({
    iss: 'https://api.practicesoftwaretesting.com',
    iat: nowSec,
    exp: expSec,
    nbf: nowSec - 10,
    jti: `jwt-${Date.now()}`,
    sub: options.sub,
    role: options.role,
  });
  const signature = 'enterprise_toolshop_v5_signature_verified';

  return `${header}.${payload}.${signature}`;
}

export const NEGATIVE_LOGIN_SCENARIOS: NegativeLoginScenario[] = [
  {
    caseId: 'AUTH-NEG-01',
    description: 'Both email and password fields empty',
    email: '',
    password: '',
    expectedErrorField: 'email-error',
    expectedMessageSubstring: 'Email is required',
  },
  {
    caseId: 'AUTH-NEG-02',
    description: 'Valid email with empty password',
    email: 'customer@practicesoftwaretesting.com',
    password: '',
    expectedErrorField: 'password-error',
    expectedMessageSubstring: 'Password is required',
  },
  {
    caseId: 'AUTH-NEG-03',
    description: 'Empty email with valid password',
    email: '',
    password: 'welcome01',
    expectedErrorField: 'email-error',
    expectedMessageSubstring: 'Email is required',
  },
  {
    caseId: 'AUTH-NEG-04',
    description: 'Malformed email missing @ symbol',
    email: 'invalid-email-format.com',
    password: 'welcome01',
    expectedErrorField: 'email-error',
    expectedMessageSubstring: 'Email format is invalid',
  },
  {
    caseId: 'AUTH-NEG-05',
    description: 'Malformed email missing domain name',
    email: 'user@',
    password: 'welcome01',
    expectedErrorField: 'email-error',
    expectedMessageSubstring: 'Email format is invalid',
  },
  {
    caseId: 'AUTH-NEG-06',
    description: 'Password shorter than minimum length (2 chars)',
    email: 'customer@practicesoftwaretesting.com',
    password: 'ab',
    expectedErrorField: 'password-error',
    expectedMessageSubstring: 'Password length is invalid',
  },
  {
    caseId: 'AUTH-NEG-07',
    description: 'Password exceeding maximum 40-character limit',
    email: 'customer@practicesoftwaretesting.com',
    password: 'P'.repeat(45),
    expectedErrorField: 'password-error',
    expectedMessageSubstring: 'Password length is invalid',
  },
  {
    caseId: 'AUTH-NEG-08',
    description: 'Valid customer email with wrong password',
    email: 'customer@practicesoftwaretesting.com',
    password: 'WrongPassword99!',
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Invalid email or password',
  },
  {
    caseId: 'AUTH-NEG-09',
    description: 'Unregistered email address with valid password',
    email: 'unknown.engineer@practicesoftwaretesting.com',
    password: 'welcome01',
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Invalid email or password',
  },
  {
    caseId: 'AUTH-NEG-10',
    description: 'Locked customer account denied authentication',
    email: 'locked@practicesoftwaretesting.com',
    password: 'welcome01',
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Account locked, too many failed attempts',
  },
  {
    caseId: 'AUTH-NEG-11',
    description: 'Uppercase password (case-sensitivity enforcement)',
    email: 'customer@practicesoftwaretesting.com',
    password: 'WELCOME01',
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Invalid email or password',
  },
  {
    caseId: 'AUTH-NEG-12',
    description: 'Password with trailing space',
    email: 'customer@practicesoftwaretesting.com',
    password: 'welcome01 ',
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Invalid email or password',
  },
  {
    caseId: 'AUTH-NEG-13',
    description: 'SQL injection payload in email field',
    email: "' OR 1=1--@example.com",
    password: 'welcome01',
    expectedErrorField: 'email-error',
    expectedMessageSubstring: 'Email format is invalid',
  },
  {
    caseId: 'AUTH-NEG-14',
    description: 'SQL injection tautology in password field',
    email: 'customer@practicesoftwaretesting.com',
    password: "' OR '1'='1",
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Invalid email or password',
  },
  {
    caseId: 'AUTH-NEG-15',
    description: 'XSS script tag in email field',
    email: '<script>alert(1)</script>@test.com',
    password: 'welcome01',
    expectedErrorField: 'email-error',
    expectedMessageSubstring: 'Email format is invalid',
  },
  {
    caseId: 'AUTH-NEG-16',
    description: 'Admin email with customer wrong password',
    email: 'admin@practicesoftwaretesting.com',
    password: 'wrongadminpass',
    expectedErrorField: 'login-error',
    expectedMessageSubstring: 'Invalid email or password',
  },
];

export const REGISTRATION_PROFILES: RegistrationCustomerProfile[] = [
  {
    profileId: 'REG-01',
    label: 'US Enterprise Customer (California)',
    firstName: 'Alex',
    lastName: 'Morgan',
    dob: '1991-04-12',
    street: '500 Howard Street',
    postalCode: '94105',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    phone: '4155550199',
    email: 'alex.morgan.qa1@example.com',
    password: 'StrongPassword123!@#',
  },
  {
    profileId: 'REG-02',
    label: 'UK Commercial Buyer (London)',
    firstName: 'Oliver',
    lastName: 'Sterling',
    dob: '1987-09-23',
    street: '10 Downing Way',
    postalCode: 'SW1A 1AA',
    city: 'London',
    state: 'Greater London',
    country: 'GB',
    phone: '02079460192',
    email: 'oliver.sterling.qa2@example.co.uk',
    password: 'SterlingSecure99$!',
  },
  {
    profileId: 'REG-03',
    label: 'German Industrial Contractor (Berlin)',
    firstName: 'Lukas',
    lastName: 'Weber',
    dob: '1984-02-18',
    street: 'Friedrichstrasse 120',
    postalCode: '10117',
    city: 'Berlin',
    state: 'Berlin',
    country: 'DE',
    phone: '03012345678',
    email: 'lukas.weber.qa3@example.de',
    password: 'BerlinTools2026!#',
  },
  {
    profileId: 'REG-04',
    label: 'Canadian Construction Manager (Toronto)',
    firstName: 'Chloe',
    lastName: 'Tremblay',
    dob: '1993-07-30',
    street: '200 Bay Street',
    postalCode: 'M5J 2J2',
    city: 'Toronto',
    state: 'Ontario',
    country: 'CA',
    phone: '4165550144',
    email: 'chloe.tremblay.qa4@example.ca',
    password: 'MapleLeafPro88!@',
  },
  {
    profileId: 'REG-05',
    label: 'Indian Engineering Lead (Bengaluru)',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dob: '1995-11-05',
    street: 'MG Road 42',
    postalCode: '560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'IN',
    phone: '9876543210',
    email: 'aarav.sharma.qa5@example.in',
    password: 'BengaluruTech77$%',
  },
  {
    profileId: 'REG-06',
    label: 'French Workshop Director (Paris)',
    firstName: 'Camille',
    lastName: 'Laurent',
    dob: '1989-06-14',
    street: '25 Rue de Rivoli',
    postalCode: '75004',
    city: 'Paris',
    state: 'Ile-de-France',
    country: 'FR',
    phone: '0142685500',
    email: 'camille.laurent.qa6@example.fr',
    password: 'ParisAtelier66!@',
  },
  {
    profileId: 'REG-07',
    label: 'Dutch Logistics Coordinator (Amsterdam)',
    firstName: 'Sander',
    lastName: 'De Vries',
    dob: '1986-12-01',
    street: 'Keizersgracht 100',
    postalCode: '1015 CV',
    city: 'Amsterdam',
    state: 'Noord-Holland',
    country: 'NL',
    phone: '0205551234',
    email: 'sander.devries.qa7@example.nl',
    password: 'HollandCargo55#$',
  },
  {
    profileId: 'REG-08',
    label: 'Australian Site Supervisor (Sydney)',
    firstName: 'Lachlan',
    lastName: 'Kerr',
    dob: '1990-08-19',
    street: '100 George Street',
    postalCode: '2000',
    city: 'Sydney',
    state: 'NSW',
    country: 'AU',
    phone: '0298765432',
    email: 'lachlan.kerr.qa8@example.com.au',
    password: 'SydneyHarbour44!@',
  },
  {
    profileId: 'REG-09',
    label: 'Hyphenated Double-Barreled Surname',
    firstName: 'Eleanor',
    lastName: 'Vance-Sterling',
    dob: '1992-03-25',
    street: '742 Evergreen Terrace',
    postalCode: '60601',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    phone: '3125550188',
    email: 'eleanor.vance.qa9@example.com',
    password: 'VanceSterling33!#',
  },
  {
    profileId: 'REG-10',
    label: 'Surname with Apostrophe Character',
    firstName: 'Liam',
    lastName: "O'Connor",
    dob: '1985-10-10',
    street: '15 Grafton Street',
    postalCode: 'D02 VF65',
    city: 'Dublin',
    state: 'Leinster',
    country: 'IE',
    phone: '0167788990',
    email: 'liam.oconnor.qa10@example.ie',
    password: 'EmeraldIsle22!@',
  },
];

