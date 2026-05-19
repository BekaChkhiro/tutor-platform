import { test } from '@playwright/test';
import { scanForA11yViolations } from './helpers/axe';

// T2.9.11 — A11y scan for all Phase 2 public pages
// Pages: /, /tutors, /tutors/[slug], /category/[slug], /consultations, /faq, /contact

test.describe('T2.9.11 — Phase 2 public pages a11y', () => {
  test('/ (homepage) has zero critical violations', async ({ page }) => {
    await page.goto('/');
    await scanForA11yViolations(page);
  });

  test('/tutors listing has zero critical violations', async ({ page }) => {
    await page.goto('/tutors');
    await scanForA11yViolations(page);
  });

  test('/tutors/[slug] has zero critical violations (first available profile)', async ({
    page,
  }) => {
    await page.goto('/tutors');
    // Try to find a real tutor link; if none exist, test the empty state of /tutors
    const links = page.getByRole('link').filter({ hasText: /.+/ });
    const hrefs = await links.evaluateAll((anchors) =>
      (anchors as HTMLAnchorElement[])
        .map((a) => a.href)
        .filter((h) => h.includes('/tutors/') && !h.endsWith('/tutors/')),
    );
    const firstTutor = hrefs[0];
    if (firstTutor) {
      await page.goto(firstTutor);
    }
    // Scan whichever page we ended up on
    await scanForA11yViolations(page);
  });

  test('/category/[slug] has zero critical violations (first available category)', async ({
    page,
  }) => {
    await page.goto('/');
    // Try to find a category link on the homepage; if none, scan the homepage again
    const links = page.getByRole('link').filter({ hasText: /.+/ });
    const hrefs = await links.evaluateAll((anchors) =>
      (anchors as HTMLAnchorElement[]).map((a) => a.href).filter((h) => h.includes('/category/')),
    );
    const firstCategory = hrefs[0];
    if (firstCategory) {
      await page.goto(firstCategory);
    } else {
      await page.goto('/category/math');
    }
    await scanForA11yViolations(page);
  });

  test('/consultations has zero critical violations', async ({ page }) => {
    await page.goto('/consultations');
    await scanForA11yViolations(page);
  });

  test('/faq has zero critical violations', async ({ page }) => {
    await page.goto('/faq');
    await scanForA11yViolations(page);
  });

  test('/contact has zero critical violations', async ({ page }) => {
    await page.goto('/contact');
    await scanForA11yViolations(page);
  });
});
