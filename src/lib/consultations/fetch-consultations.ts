import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export type ConsultationSortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ConsultationFilters {
  category?: string;
  sort?: ConsultationSortOption;
  priceMin?: number;
  priceMax?: number;
  page?: number;
}

const PER_PAGE = 12;

const CONSULTATION_INCLUDE = {
  tutor: {
    select: {
      slug: true,
      photoUrl: true,
      headline: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ConsultationInclude;

export type ConsultationListItem = Awaited<
  ReturnType<typeof fetchConsultations>
>['consultations'][number];

export async function fetchConsultations(filters: ConsultationFilters = {}) {
  const { category, sort = 'newest', priceMin, priceMax, page = 1 } = filters;
  const skip = (page - 1) * PER_PAGE;

  const where: Prisma.ConsultationWhereInput = {
    archived: false,
    tutor: { status: 'APPROVED' },
    ...(category && { category: { slug: category } }),
    ...((priceMin != null || priceMax != null) && {
      priceGel: {
        ...(priceMin != null && { gte: priceMin }),
        ...(priceMax != null && { lte: priceMax }),
      },
    }),
  };

  const orderBy: Prisma.ConsultationOrderByWithRelationInput =
    sort === 'price_asc'
      ? { priceGel: 'asc' }
      : sort === 'price_desc'
        ? { priceGel: 'desc' }
        : { createdAt: 'desc' };

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE,
      include: CONSULTATION_INCLUDE,
    }),
    prisma.consultation.count({ where }),
  ]);

  return { consultations, total, page, perPage: PER_PAGE, totalPages: Math.ceil(total / PER_PAGE) };
}

export async function fetchConsultationCategories() {
  return prisma.category.findMany({
    where: { consultations: { some: { archived: false, tutor: { status: 'APPROVED' } } } },
    orderBy: { sortOrder: 'asc' },
    select: { slug: true, name: true },
  });
}
