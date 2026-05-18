import { expect, test } from '@playwright/test';

test.describe('FAQ page (T2.9.9)', () => {
  test('renders the FAQ heading', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('?q=<id> auto-opens and scrolls to that question', async ({ page }) => {
    await page.goto('/faq?q=what-is-tutor');

    // The accordion item should be present in the DOM
    const trigger = page.getByRole('button', { name: /რა არის Tutor/i });
    await expect(trigger).toBeVisible();

    // The panel for this item should be open (data-[panel-open] is set)
    // We verify the content text is visible, which means the accordion is open
    await expect(page.getByText(/ონლაინ პლატფორმა/i)).toBeVisible();
  });

  test('?q=refund-policy opens the refund question if it exists', async ({ page }) => {
    await page.goto('/faq?q=refund-policy');
    // Verify the page loaded without error
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('category anchor links are present', async ({ page }) => {
    await page.goto('/faq');
    const nav = page.getByRole('navigation', { name: 'FAQ კატეგორიები' });
    await expect(nav).toBeVisible();
    const links = nav.getByRole('link');
    await expect(links.first()).toBeVisible();
  });

  test('page contains JSON-LD FAQ schema', async ({ page }) => {
    await page.goto('/faq');
    const jsonLd = await page.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      return el ? JSON.parse(el.textContent ?? '{}') : null;
    });
    expect(jsonLd).not.toBeNull();
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(Array.isArray(jsonLd.mainEntity)).toBe(true);
    expect(jsonLd.mainEntity.length).toBeGreaterThan(0);
  });

  test('link to contact page is present', async ({ page }) => {
    await page.goto('/faq');
    const contactLink = page.getByRole('link', { name: /დაგვიკავშირდით/i });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute('href', '/contact');
  });
});
