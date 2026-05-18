import { expect, test } from '@playwright/test';

// T2.9.7 — Homepage → click category → filter applied → open tutor profile → tabs work
// T2.9.8 — Filter persistence (back/forward)
//
// These tests are skipped until T2.1–T2.5 implementations are complete:
//   T2.1 Homepage (TutorCard, TutorCarousel, HeroSection, CategoriesGrid)
//   T2.2 Tutors listing page (FilterSidebar, FilterDrawer, URL-state hook)
//   T2.3 Tutor profile page (TabsNav, BookingSidebar)
//   T2.4 Categories landing pages
//   T2.5 Consultations listing page
//
// Once those tasks land, remove the .skip and verify the tests green.

test.describe('Public pages — homepage (T2.9.7)', () => {
  test('homepage loads and renders an h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test.skip('homepage → click category chip → tutors listing filtered by category', async ({
    page,
  }) => {
    // Depends on T2.1 (CategoriesGrid) + T2.2 (filters in URL)
    await page.goto('/');
    const categoryChip = page.getByTestId('category-chip').first();
    const categoryName = await categoryChip.textContent();
    await categoryChip.click();

    await page.waitForURL(/\/tutors\?category=/);
    await expect(page.getByTestId('tutor-card').first()).toBeVisible();
    expect(page.url()).toContain(`category=${encodeURIComponent(categoryName ?? '')}`);
  });

  test.skip('tutor card click → opens tutor profile page', async ({ page }) => {
    // Depends on T2.2 (TutorsGrid) + T2.3 (tutor profile page)
    await page.goto('/tutors');
    const card = page.getByTestId('tutor-card').first();
    const name = await card.getByRole('heading').textContent();
    await card.click();

    await page.waitForURL(/\/tutors\/.+/);
    await expect(page.getByRole('heading', { name: name ?? '' })).toBeVisible();
  });

  test.skip('tutor profile tabs navigate correctly', async ({ page }) => {
    // Depends on T2.3 (TabsNav)
    await page.goto('/tutors/test-tutor');
    await page.getByRole('tab', { name: /consultations/i }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });
});

test.describe('Filter persistence (T2.9.8)', () => {
  test.skip('filter selections persist in URL — copy → reload → state restored', async ({
    page,
  }) => {
    // Depends on T2.2 (useFilters URL-state hook)
    await page.goto('/tutors');
    await page.getByTestId('filter-category-math').click();
    await page.getByRole('button', { name: /apply/i }).click();

    const url = page.url();
    expect(url).toContain('category=math');

    await page.reload();
    await expect(page.getByTestId('filter-category-math')).toHaveAttribute('aria-pressed', 'true');
  });

  test.skip('back/forward navigation restores filter state', async ({ page }) => {
    // Depends on T2.2 (useFilters URL-state hook)
    await page.goto('/tutors');
    await page.getByTestId('filter-category-math').click();
    await page.getByRole('button', { name: /apply/i }).click();

    await page.goto('/');
    await page.goBack();

    await expect(page).toHaveURL(/category=math/);
    await expect(page.getByTestId('filter-category-math')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Tutors listing page', () => {
  test('/tutors route loads without error', async ({ page }) => {
    const response = await page.goto('/tutors');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Category page', () => {
  test.skip('/category/[slug] renders a category page', async ({ page }) => {
    // Depends on T2.4 (CategoryHero, static params generation)
    const response = await page.goto('/category/math');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
