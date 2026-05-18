'use server';

import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

const PER_PAGE = 12;

export interface TutorFilters {
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sort?: 'rating' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
}

export interface TutorListItem {
  id: string;
  slug: string;
  photoUrl: string | null;
  headline: string | null;
  user: { firstName: string | null; lastName: string | null };
  categories: { category: { name: string; slug: string } }[];
  avgRating: number | null;
  reviewCount: number;
  minPrice: number | null;
}

export interface FetchTutorsResult {
  tutors: TutorListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

export async function fetchTutors(filters: TutorFilters = {}): Promise<FetchTutorsResult> {
  const { categories, priceMin, priceMax, rating, sort = 'rating', page = 1 } = filters;

  const where: Prisma.TutorWhereInput = { status: 'APPROVED' };

  if (categories && categories.length > 0) {
    where.categories = {
      some: { category: { slug: { in: categories } } },
    };
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    const priceFilter: Prisma.DecimalFilter<'Consultation'> = {};
    if (priceMin !== undefined) priceFilter.gte = priceMin;
    if (priceMax !== undefined) priceFilter.lte = priceMax;
    where.consultations = { some: { archived: false, priceGel: priceFilter } };
  }

  const orderBy: Prisma.TutorOrderByWithRelationInput =
    sort === 'newest' ? { createdAt: 'desc' } : { createdAt: 'asc' };

  const rawTutors = await prisma.tutor.findMany({
    where,
    orderBy,
    include: {
      user: { select: { firstName: true, lastName: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
        take: 1,
      },
      reviews: { select: { rating: true } },
      consultations: {
        where: { archived: false },
        select: { priceGel: true },
        orderBy: { priceGel: 'asc' },
        take: 1,
      },
    },
  });

  let tutors: TutorListItem[] = rawTutors.map((t) => {
    const avgRating =
      t.reviews.length > 0
        ? Math.round((t.reviews.reduce((s, r) => s + r.rating, 0) / t.reviews.length) * 10) / 10
        : null;
    return {
      id: t.id,
      slug: t.slug,
      photoUrl: t.photoUrl,
      headline: t.headline,
      user: t.user,
      categories: t.categories,
      avgRating,
      reviewCount: t.reviews.length,
      minPrice: t.consultations[0] ? Number(t.consultations[0].priceGel) : null,
    };
  });

  if (rating !== undefined) {
    tutors = tutors.filter((t) => t.avgRating !== null && t.avgRating >= rating);
  }

  switch (sort) {
    case 'price_asc':
      tutors.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
      break;
    case 'price_desc':
      tutors.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
      break;
    case 'rating':
      tutors.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
      break;
  }

  const total = tutors.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;

  return {
    tutors: tutors.slice(start, start + PER_PAGE),
    total,
    page: safePage,
    perPage: PER_PAGE,
    totalPages,
  };
}

export async function fetchCategories(): Promise<CategoryOption[]> {
  return prisma.category.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { sortOrder: 'asc' },
  });
}
