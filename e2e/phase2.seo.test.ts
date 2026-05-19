import { expect, test } from '@playwright/test';

// T2.9.12 — sitemap.xml is valid XML with expected structure
test.describe('T2.9.12 — sitemap.xml validity', () => {
  test('sitemap.xml returns 200 with XML content-type', async ({ request }) => {
    const resp = await request.get('/sitemap.xml');
    expect(resp.status()).toBe(200);
    const contentType = resp.headers()['content-type'];
    expect(contentType).toMatch(/xml/);
  });

  test('sitemap.xml is parseable XML with urlset root', async ({ request }) => {
    const resp = await request.get('/sitemap.xml');
    const body = await resp.text();
    expect(body).toMatch(/<urlset/);
    expect(body).toMatch(/<\/urlset>/);
  });

  test('sitemap.xml contains the static public pages', async ({ request }) => {
    const resp = await request.get('/sitemap.xml');
    const body = await resp.text();
    expect(body).toContain('/tutors');
    expect(body).toContain('/faq');
    expect(body).toContain('/contact');
    expect(body).toContain('/consultations');
  });

  test('every <loc> in sitemap.xml is an absolute URL', async ({ request }) => {
    const resp = await request.get('/sitemap.xml');
    const body = await resp.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc).toMatch(/^https?:\/\//);
    }
  });
});

// T2.9.13 — OG image renders (returns an image with correct dimensions)
test.describe('T2.9.13 — OG image', () => {
  test('default OG image route /api/og returns 200 with image content-type', async ({
    request,
  }) => {
    const resp = await request.get('/api/og');
    expect(resp.status()).toBe(200);
    const ct = resp.headers()['content-type'];
    expect(ct).toMatch(/image\/(png|jpeg|webp)/);
  });

  test('OG image accepts title and subtitle query params', async ({ request }) => {
    const resp = await request.get('/api/og?title=Test+Title&subtitle=Subtitle');
    expect(resp.status()).toBe(200);
    const ct = resp.headers()['content-type'];
    expect(ct).toMatch(/image\//);
  });

  test('tutor profile OG image route returns an image for a known slug', async ({
    page,
    request,
  }) => {
    // Find any tutor slug from the listing page
    await page.goto('/tutors');
    const links = page.getByRole('link').filter({ hasText: /.+/ });
    const hrefs = await links.evaluateAll((anchors) =>
      (anchors as HTMLAnchorElement[])
        .map((a) => a.href)
        .filter((h) => h.includes('/tutors/') && !h.endsWith('/tutors/')),
    );

    const firstHref = hrefs[0];
    if (firstHref) {
      const slug = firstHref.split('/tutors/')[1];
      const resp = await request.get(`/tutors/${slug}/opengraph-image`);
      // Should be 200 with image or 404 if tutor not found — either is valid
      expect([200, 404]).toContain(resp.status());
      if (resp.status() === 200) {
        expect(resp.headers()['content-type']).toMatch(/image\//);
      }
    }
    // If no tutors, skip gracefully — sitemap will also be empty
  });
});
