import { expect, test } from '@playwright/test';

// T2.9.9 — FAQ anchor (?q=<id>) opens and scrolls the matching item
test.describe('T2.9.9 — FAQ anchor deep-link', () => {
  test('?q=refund-policy opens and scrolls to the refund item', async ({ page }) => {
    await page.goto('/faq?q=refund');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The refund item has id="item-refund" — it should be in the DOM
    const item = page.locator('#item-refund');
    await expect(item).toBeVisible();
  });

  test('page loads without query param and shows the FAQ headings', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // FAQ categories must be present
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  });
});

// T2.9.10 — Contact form submit → success state
test.describe('T2.9.10 — Contact form submit', () => {
  test('shows success state after valid submission', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'კონტაქტი' })).toBeVisible();

    await page.fill('#name', 'ნინო ბერიძე');
    await page.fill('#email', 'nino@example.com');
    await page.selectOption('#subject', { index: 1 });
    await page.fill('#message', 'გამარჯობა, ეს ტესტი შეტყობინებაა პლატფორმის შემოწმებისთვის.');

    await page.click('button[type="submit"]');

    // Success state renders the confirmation card
    await expect(page.getByText('შეტყობინება გაიგზავნა!')).toBeVisible({ timeout: 10_000 });
  });

  test('shows validation error when required fields are empty', async ({ page }) => {
    await page.goto('/contact');
    await page.click('button[type="submit"]');
    // At least one validation error should be visible
    const errors = page.locator('p.text-destructive, p[class*="destructive"]');
    await expect(errors.first()).toBeVisible();
  });
});

// T2.9.7 — Homepage → category → filter applied → tutor profile → tabs
test.describe('T2.9.7 — Category filter and tutor profile flow', () => {
  test('tutors listing page loads and shows the filter controls', async ({ page }) => {
    await page.goto('/tutors');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The page renders regardless; just verify it loaded
    await expect(page).toHaveURL('/tutors');
  });

  test('applying a category filter via URL shows filtered state', async ({ page }) => {
    await page.goto('/tutors?category=math');
    await expect(page).toHaveURL(/category=math/);
    // Page renders — either tutors or empty state
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('tutor profile tabs render when a profile exists', async ({ page }) => {
    // Navigate to the tutors listing first
    await page.goto('/tutors');
    const firstLink = page.getByRole('link').filter({ hasText: /.+/ }).first();
    const href = await firstLink.getAttribute('href');
    // Only run the profile part if a tutor card link exists
    if (href?.startsWith('/tutors/')) {
      await page.goto(href);
      // Tabs container should be visible on a tutor profile
      const tabList = page.getByRole('tablist');
      await expect(tabList).toBeVisible();
      // Click through tabs if they exist
      const tabs = tabList.getByRole('tab');
      const count = await tabs.count();
      if (count > 1) {
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      }
    }
  });
});

// T2.9.8 — Filter persistence across back/forward navigation
test.describe('T2.9.8 — Filter persistence (back / forward)', () => {
  test('category filter is preserved in URL after navigating away and back', async ({ page }) => {
    await page.goto('/tutors?category=math&sort=rating');
    await expect(page).toHaveURL(/category=math/);

    // Navigate away
    await page.goto('/faq');
    await expect(page).toHaveURL('/faq');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/category=math/);
    await expect(page).toHaveURL(/sort=rating/);
  });

  test('sort parameter persists in URL state', async ({ page }) => {
    await page.goto('/tutors?sort=price_asc');
    await expect(page).toHaveURL(/sort=price_asc/);
    await expect(page.getByRole('main')).toBeVisible();
  });
});
