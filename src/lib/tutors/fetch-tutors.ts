import { Prisma } from '@prisma/client';
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

const TUTOR_INCLUDE = {
  user: { select: { firstName: true, lastName: true } },
  categories: {
    include: { category: { select: { name: true, slug: true } } },
    take: 2,
  },
  reviews: { select: { rating: true } },
  consultations: {
    where: { archived: false },
    select: { priceGel: true },
    orderBy: { priceGel: 'asc' as const },
    take: 1,
  },
} satisfies Prisma.TutorInclude;

export async function fetchTutors(filters: TutorFilters = {}) {
  const { category, sort = 'newest', q, page = 1 } = filters;
  const skip = (page - 1) * PER_PAGE;

  const where: Prisma.TutorWhereInput = {
    status: 'APPROVED',
    ...(category && {
      categories: { some: { category: { slug: category } } },
    }),
    ...(q && {
      OR: [
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
        { headline: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  if (sort === 'price_asc' || sort === 'price_desc') {
    return fetchTutorsByPrice({ where, sort, skip, page });
  }

  const orderBy: Prisma.TutorOrderByWithRelationInput[] =
    sort === 'rating' ? [{ reviews: { _count: 'desc' } }] : [{ createdAt: 'desc' }];

  const [tutors, total] = await Promise.all([
    prisma.tutor.findMany({ where, orderBy, skip, take: PER_PAGE, include: TUTOR_INCLUDE }),
    prisma.tutor.count({ where }),
  ]);

  return { tutors, total, page, perPage: PER_PAGE, totalPages: Math.ceil(total / PER_PAGE) };
}

async function fetchTutorsByPrice({
  where,
  sort,
  skip,
  page,
}: {
  where: Prisma.TutorWhereInput;
  sort: 'price_asc' | 'price_desc';
  skip: number;
  page: number;
}) {
  const direction = sort === 'price_asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  const categorySlug = (where.categories as { some?: { category?: { slug?: string } } } | undefined)
    ?.some?.category?.slug;
  const searchQ = (
    where.OR as Array<{ user?: { firstName?: { contains?: string } } }> | undefined
  )?.[0]?.user?.firstName?.contains;

  const categoryFilter = categorySlug
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "TutorCategory" tc
        JOIN "Category" cat ON cat.id = tc."categoryId"
        WHERE tc."tutorId" = t.id AND cat.slug = ${categorySlug}
      )`
    : Prisma.empty;

  const searchFilter = searchQ
    ? Prisma.sql`AND (
        u."firstName" ILIKE ${'%' + searchQ + '%'}
        OR u."lastName"  ILIKE ${'%' + searchQ + '%'}
        OR t.headline    ILIKE ${'%' + searchQ + '%'}
        OR t.bio         ILIKE ${'%' + searchQ + '%'}
      )`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<{ id: string; total: bigint }[]>`
    SELECT t.id, COUNT(*) OVER () AS total
    FROM "Tutor" t
    JOIN "User" u ON u.id = t."userId"
    LEFT JOIN "Consultation" c ON c."tutorId" = t.id AND c.archived = false
    WHERE t.status = 'APPROVED'
    ${categoryFilter}
    ${searchFilter}
    GROUP BY t.id
    ORDER BY MIN(c."priceGel") ${direction} NULLS LAST
    LIMIT ${PER_PAGE} OFFSET ${skip}
  `;

  const firstRow = rows[0];
  const total = firstRow ? Number(firstRow.total) : 0;
  const ids = rows.map((r) => r.id);

  const unsorted = await prisma.tutor.findMany({
    where: { id: { in: ids } },
    include: TUTOR_INCLUDE,
  });

  // Restore the DB ordering
  const byId = Object.fromEntries(unsorted.map((t) => [t.id, t]));
  const tutors = ids.map((id) => byId[id]).filter((t) => t !== undefined);

  return { tutors, total, page, perPage: PER_PAGE, totalPages: Math.ceil(total / PER_PAGE) };
}

export async function fetchCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { slug: true, name: true },
  });
}

export async function fetchCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true, iconName: true },
  });
}
