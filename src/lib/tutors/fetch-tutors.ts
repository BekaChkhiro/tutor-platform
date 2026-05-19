import { prisma } from '@/lib/db/prisma';

export type SortOption = 'newest' | 'rating' | 'price_asc' | 'price_desc';

export interface TutorFilters {
  category?: string;
  sort?: SortOption;
  q?: string;
  page?: number;
}

const PER_PAGE = 12;

export type TutorListItem = Awaited<ReturnType<typeof fetchTutors>>['tutors'][number];

export async function fetchTutors(filters: TutorFilters = {}) {
  const { category, sort = 'newest', q, page = 1 } = filters;
  const skip = (page - 1) * PER_PAGE;

  const where = {
    status: 'APPROVED' as const,
    ...(category && {
      categories: { some: { category: { slug: category } } },
    }),
    ...(q && {
      OR: [
        { user: { firstName: { contains: q, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: q, mode: 'insensitive' as const } } },
        { headline: { contains: q, mode: 'insensitive' as const } },
        { bio: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const orderBy =
    sort === 'newest'
      ? [{ createdAt: 'desc' as const }]
      : sort === 'price_asc' || sort === 'price_desc'
        ? [
            {
              consultations: {
                _count: sort === 'price_asc' ? ('asc' as const) : ('desc' as const),
              },
            },
          ]
        : [{ reviews: { _count: 'desc' as const } }];

  const [tutors, total] = await Promise.all([
    prisma.tutor.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE,
      include: {
        user: { select: { firstName: true, lastName: true } },
        categories: {
          include: { category: { select: { name: true, slug: true } } },
          take: 2,
        },
        reviews: { select: { rating: true } },
        consultations: {
          where: { archived: false },
          select: { priceGel: true },
          orderBy: { priceGel: 'asc' },
          take: 1,
        },
      },
    }),
    prisma.tutor.count({ where }),
  ]);

  return {
    tutors,
    total,
    page,
    perPage: PER_PAGE,
    totalPages: Math.ceil(total / PER_PAGE),
  };
}

export async function fetchCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { slug: true, name: true },
  });
}
