import { expect, test } from '@playwright/test';

test.describe('homepage smoke', () => {
  test('loads and renders the expected h1', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Tutor');
  });
});
