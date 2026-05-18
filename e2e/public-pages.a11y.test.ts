import { test } from '@playwright/test';
import { scanForA11yViolations } from './helpers/axe';

// T2.9.11 — A11y scan: homepage, /tutors, /tutors/[slug], /category/[slug],
//            /consultations, /faq, /contact

test.describe('A11y — public pages (T2.9.11)', () => {
  test('homepage has zero critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await scanForA11yViolations(page);
  });

  test('/faq has zero critical a11y violations', async ({ page }) => {
    await page.goto('/faq');
    await scanForA11yViolations(page);
  });

  test('/contact has zero critical a11y violations', async ({ page }) => {
    await page.goto('/contact');
    await scanForA11yViolations(page);
  });

  test('/tutors has zero critical a11y violations', async ({ page }) => {
    await page.goto('/tutors');
    await scanForA11yViolations(page);
  });

  test.skip('/tutors/[slug] has zero critical a11y violations', async ({ page }) => {
    // Depends on T2.3 — tutor profile page with real seeded data.
    // Remove .skip once T2.3 lands and the seed adds at least one approved tutor.
    await page.goto('/tutors/test-tutor');
    await scanForA11yViolations(page);
  });

  test.skip('/category/[slug] has zero critical a11y violations', async ({ page }) => {
    // Depends on T2.4 — category landing pages.
    await page.goto('/category/math');
    await scanForA11yViolations(page);
  });

  test.skip('/consultations has zero critical a11y violations', async ({ page }) => {
    // Depends on T2.5 — consultations listing page.
    await page.goto('/consultations');
    await scanForA11yViolations(page);
  });
});
