import { Page } from '@playwright/test';

export interface SecurityPayload {
  id: string;
  category: 'XSS' | 'SQLi' | 'HTML_INJECTION' | 'PATH_TRAVERSAL' | 'COMMAND_INJECTION' | 'BOUNDARY';
  label: string;
  payload: string;
}

export const SECURITY_PAYLOADS: SecurityPayload[] = [
  {
    id: 'SEC-001',
    category: 'XSS',
    label: 'Script tag injection',
    payload: '<script>window.__xss_triggered = true;</script>',
  },
  {
    id: 'SEC-002',
    category: 'XSS',
    label: 'Image onerror event handler XSS',
    payload: '<img src="x" onerror="window.__xss_triggered = true;" />',
  },
  {
    id: 'SEC-003',
    category: 'XSS',
    label: 'SVG onload XSS vector',
    payload: '<svg onload="window.__xss_triggered = true;"></svg>',
  },
  {
    id: 'SEC-004',
    category: 'XSS',
    label: 'JavaScript URI protocol handler',
    payload: 'javascript:window.__xss_triggered=true',
  },
  {
    id: 'SEC-005',
    category: 'SQLi',
    label: 'Classic tautology OR 1=1',
    payload: "' OR '1'='1' --",
  },
  {
    id: 'SEC-006',
    category: 'SQLi',
    label: 'Admin comment bypass',
    payload: "admin'--",
  },
  {
    id: 'SEC-007',
    category: 'SQLi',
    label: 'UNION SELECT extraction vector',
    payload: "' UNION SELECT null, username, password FROM users--",
  },
  {
    id: 'SEC-008',
    category: 'SQLi',
    label: 'Stacked query DROP TABLE vector',
    payload: "'; DROP TABLE users; --",
  },
  {
    id: 'SEC-009',
    category: 'HTML_INJECTION',
    label: 'Iframe injection vector',
    payload: '<iframe src="https://evil.example.com"></iframe>',
  },
  {
    id: 'SEC-010',
    category: 'PATH_TRAVERSAL',
    label: 'Dot-dot-slash traversal vector',
    payload: '../../../../etc/passwd',
  },
  {
    id: 'SEC-011',
    category: 'COMMAND_INJECTION',
    label: 'Shell pipe command vector',
    payload: '$(whoami) | cat /etc/passwd',
  },
  {
    id: 'SEC-012',
    category: 'BOUNDARY',
    label: 'Null byte & control characters',
    payload: 'user\u0000admin\r\nSet-Cookie: hacked=true',
  },
  {
    id: 'SEC-013',
    category: 'BOUNDARY',
    label: 'Unicode RTL override & emojis',
    payload: '\u202Estandard_user🚀🔥💻测试',
  },
];

export class SecurityHelper {
  /**
   * Verifies that no XSS payload executed in the page context
   */
  public static async verifyNoXssExecution(page: Page): Promise<boolean> {
    const xssTriggered = await page.evaluate(() => {
      return Boolean((window as unknown as Record<string, unknown>).__xss_triggered);
    });
    return !xssTriggered;
  }

  /**
   * Retrieves a specific cookie by name from the browser context
   */
  public static async getCookieValue(page: Page, cookieName: string): Promise<string | undefined> {
    const cookies = await page.context().cookies();
    const found = cookies.find((c) => c.name === cookieName);
    return found?.value;
  }

  /**
   * Deletes all cookies and clears localStorage & sessionStorage
   */
  public static async purgeSessionState(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        // Ignore if page is about:blank
      }
    });
  }
}

