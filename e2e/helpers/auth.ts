import type { BrowserContext, Page } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  role?: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

/**
 * Inject a session cookie so subsequent requests appear authenticated.
 * Replace the cookie name + value scheme once the real auth provider is wired up
 * (T0.21 / auth task) — until then this is a placeholder that documents the
 * intended seam: call this from a beforeEach to skip slow UI logins.
 */
export async function loginAs(context: BrowserContext, user: TestUser): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
  const url = new URL(baseURL);

  await context.addCookies([
    {
      name: 'e2e_session',
      value: JSON.stringify({ userId: user.id, role: user.role ?? 'STUDENT' }),
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: url.protocol === 'https:',
    },
  ]);
}

/** Convenience: log in then navigate. */
export async function loginAndGoto(page: Page, user: TestUser, path = '/'): Promise<void> {
  await loginAs(page.context(), user);
  await page.goto(path);
}
