import type { Metadata } from 'next';
import { buildPageMetadata, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { prisma } = await import('@/lib/db/prisma');

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false },
    };
  }

  const description =
    category.description ??
    `Browse ${category.name} tutors and book consultations on ${SITE_NAME}.`;

  return buildPageMetadata({
    title: category.name,
    description,
    path: `/category/${slug}`,
    ogImageParams: { subtitle: description },
  });
}

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Category</h1>
      <p className="text-muted-foreground text-sm">Placeholder route.</p>
    </main>
  );
}
