import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export type TestEnvironment = 'qa' | 'staging' | 'prod';

export interface EnvironmentConfig {
  env: TestEnvironment;
  baseUrl: string;
  apiBaseUrl: string;
  credentials: {
    customerEmail: string;
    customerSecondaryEmail: string;
    adminEmail: string;
    password: string;
  };
  execution: {
    headless: boolean;
    workers: number;
    retries: number;
    enableAssetCache: boolean;
    defaultTimeoutMs: number;
    expectTimeoutMs: number;
  };
}

const ENV_URLS: Record<TestEnvironment, { baseUrl: string; apiBaseUrl: string }> = {
  qa: {
    baseUrl: 'https://practicesoftwaretesting.com',
    apiBaseUrl: 'https://api.practicesoftwaretesting.com',
  },
  staging: {
    baseUrl: 'https://practicesoftwaretesting.com',
    apiBaseUrl: 'https://api.practicesoftwaretesting.com',
  },
  prod: {
    baseUrl: 'https://practicesoftwaretesting.com',
    apiBaseUrl: 'https://api.practicesoftwaretesting.com',
  },
};

const currentEnv = (process.env.TEST_ENV || 'qa').toLowerCase() as TestEnvironment;
const resolvedEnv = ENV_URLS[currentEnv] ? currentEnv : 'qa';

export const EnvConfig: EnvironmentConfig = {
  env: resolvedEnv,
  baseUrl: process.env.BASE_URL || ENV_URLS[resolvedEnv].baseUrl,
  apiBaseUrl: process.env.API_BASE_URL || ENV_URLS[resolvedEnv].apiBaseUrl,
  credentials: {
    customerEmail: process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com',
    customerSecondaryEmail:
      process.env.CUSTOMER_SECONDARY_EMAIL || 'customer2@practicesoftwaretesting.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com',
    password: process.env.DEFAULT_PASSWORD || 'welcome01',
  },
  execution: {
    headless: process.env.HEADLESS !== 'false',
    workers: Number(process.env.WORKERS) || 6,
    retries: Number(process.env.RETRIES ?? 1),
    enableAssetCache: process.env.ENABLE_ASSET_CACHE !== 'false',
    defaultTimeoutMs: Number(process.env.DEFAULT_TIMEOUT_MS) || 30000,
    expectTimeoutMs: Number(process.env.EXPECT_TIMEOUT_MS) || 10000,
  },
};
