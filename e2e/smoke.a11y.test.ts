import { test } from '@playwright/test';
import { scanForA11yViolations } from './helpers/axe';

test.describe('homepage a11y smoke', () => {
  test('has zero critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await scanForA11yViolations(page);
  });
});
