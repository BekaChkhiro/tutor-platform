import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
  { url: `${SITE_URL}/tutors`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE_URL}/consultations`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lazy import to avoid Prisma client being bundled into the edge runtime.
  const { prisma } = await import('@/lib/db/prisma');

  const [tutors, categories] = await Promise.all([
    prisma.tutor.findMany({
      where: { status: 'APPROVED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const tutorEntries: MetadataRoute.Sitemap = tutors.map((t) => ({
    url: `${SITE_URL}/tutors/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...STATIC_PAGES, ...tutorEntries, ...categoryEntries];
}
