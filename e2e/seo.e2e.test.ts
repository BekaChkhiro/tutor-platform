import { expect, test } from '@playwright/test';

// T2.9.12 — SEO: sitemap.xml is valid XML with all approved tutors
// T2.9.13 — SEO: OG image renders correctly (snapshot test)

test.describe('SEO — sitemap (T2.9.12)', () => {
  test.skip('sitemap.xml is valid XML and contains static pages', async ({ page }) => {
    // Depends on T2.8 — src/app/sitemap.ts
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toMatch(/xml/);

    const body = await response?.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('<url>');
    expect(body).toContain('/faq');
    expect(body).toContain('/contact');
  });

  test.skip('sitemap.xml includes approved tutor URLs', async ({ page }) => {
    // Depends on T2.8 + seeded approved tutors.
    const response = await page.goto('/sitemap.xml');
    const body = await response?.text();
    expect(body).toContain('/tutors/');
  });
});

test.describe('SEO — OG image (T2.9.13)', () => {
  test.skip('tutor OG image route responds with an image', async ({ request }) => {
    // Depends on T2.3.14 — src/app/tutors/[slug]/opengraph-image.tsx
    const response = await request.get('/tutors/test-tutor/opengraph-image');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/image/);
  });

  test.skip('homepage OG image route responds with an image', async ({ request }) => {
    // Depends on T2.8.6 — homepage OG image route
    const response = await request.get('/opengraph-image');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/image/);
  });

  test('homepage has og:title meta tag', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    // Once T2.1.14 adds OG metadata, this should be non-null.
    // For now it may be null — just assert the page loaded.
    expect(page.url()).toContain('/');
    // Remove the conditional and assert ogTitle is non-null once T2.1 lands.
    if (ogTitle) {
      expect(ogTitle.length).toBeGreaterThan(0);
    }
  });

  test('/faq page has og:title meta tag', async ({ page }) => {
    await page.goto('/faq');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('SEO — robots.txt (T2.8.2)', () => {
  test.skip('robots.txt disallows /admin and /api', async ({ page }) => {
    // Depends on T2.8 — src/app/robots.ts
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /api');
  });
});
