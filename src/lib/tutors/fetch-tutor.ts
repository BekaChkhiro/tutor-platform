import { prisma } from '@/lib/db/prisma';

export type TutorProfile = NonNullable<Awaited<ReturnType<typeof fetchTutorBySlug>>>;

export async function fetchTutorBySlug(slug: string) {
  return prisma.tutor.findUnique({
    where: { slug, status: 'APPROVED' },
    include: {
      user: { select: { firstName: true, lastName: true } },
      skills: { orderBy: { name: 'asc' } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
      consultations: {
        where: { archived: false },
        orderBy: { priceGel: 'asc' },
        include: { category: { select: { name: true } } },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, image: true } },
        },
      },
      educations: {
        orderBy: [{ endYear: 'desc' }, { startYear: 'desc' }],
      },
      experiences: {
        orderBy: [{ endYear: 'desc' }, { startYear: 'desc' }],
      },
      certificates: { orderBy: { issuedAt: 'desc' } },
    },
  });
}

export async function fetchApprovedTutorSlugs() {
  const tutors = await prisma.tutor.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true },
  });
  return tutors.map((t) => ({ slug: t.slug }));
}
