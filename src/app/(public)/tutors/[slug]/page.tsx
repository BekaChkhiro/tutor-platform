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

  const tutor = await prisma.tutor.findUnique({
    where: { slug },
    select: {
      headline: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!tutor) {
    return {
      title: 'Tutor Not Found',
      robots: { index: false },
    };
  }

  const { firstName, lastName } = tutor.user;
  const name = [firstName, lastName].filter(Boolean).join(' ') || slug;
  const description = tutor.headline ?? `Book a consultation with ${name} on ${SITE_NAME}.`;

  return buildPageMetadata({
    title: name,
    description,
    path: `/tutors/${slug}`,
    ogImageParams: { subtitle: description },
  });
}

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Tutor profile</h1>
      <p className="text-muted-foreground text-sm">Placeholder route.</p>
    </main>
  );
}
