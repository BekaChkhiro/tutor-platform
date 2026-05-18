'use server';

import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

const PER_PAGE = 12;

export interface ConsultationFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
}

export interface ConsultationListItem {
  id: string;
  title: string;
  descriptionShort: string;
  durationMinutes: number;
  priceGel: number;
  bookingType: string;
  category: { name: string; slug: string };
  tutor: {
    slug: string;
    photoUrl: string | null;
    headline: string | null;
    user: { firstName: string | null; lastName: string | null };
    avgRating: number | null;
    reviewCount: number;
  };
}

export interface FetchConsultationsResult {
  consultations: ConsultationListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export async function fetchConsultations(
  filters: ConsultationFilters = {},
): Promise<FetchConsultationsResult> {
  const { category, priceMin, priceMax, sort = 'newest', page = 1 } = filters;

  const where: Prisma.ConsultationWhereInput = {
    archived: false,
    tutor: { status: 'APPROVED' },
  };

  if (category) {
    where.category = { slug: category };
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    const priceFilter: Prisma.DecimalFilter<'Consultation'> = {};
    if (priceMin !== undefined) priceFilter.gte = priceMin;
    if (priceMax !== undefined) priceFilter.lte = priceMax;
    where.priceGel = priceFilter;
  }

  const orderBy: Prisma.ConsultationOrderByWithRelationInput =
    sort === 'price_asc'
      ? { priceGel: 'asc' }
      : sort === 'price_desc'
        ? { priceGel: 'desc' }
        : { createdAt: 'desc' };

  const rawConsultations = await prisma.consultation.findMany({
    where,
    orderBy,
    include: {
      category: { select: { name: true, slug: true } },
      tutor: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const consultations: ConsultationListItem[] = rawConsultations.map((c) => {
    const avgRating =
      c.tutor.reviews.length > 0
        ? Math.round(
            (c.tutor.reviews.reduce((s, r) => s + r.rating, 0) / c.tutor.reviews.length) * 10,
          ) / 10
        : null;
    return {
      id: c.id,
      title: c.title,
      descriptionShort: c.descriptionShort,
      durationMinutes: c.durationMinutes,
      priceGel: Number(c.priceGel),
      bookingType: c.bookingType,
      category: c.category,
      tutor: {
        slug: c.tutor.slug,
        photoUrl: c.tutor.photoUrl,
        headline: c.tutor.headline,
        user: c.tutor.user,
        avgRating,
        reviewCount: c.tutor.reviews.length,
      },
    };
  });

  const total = consultations.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;

  return {
    consultations: consultations.slice(start, start + PER_PAGE),
    total,
    page: safePage,
    perPage: PER_PAGE,
    totalPages,
  };
}

export function parseConsultationFilters(
  params: Record<string, string | string[] | undefined>,
): ConsultationFilters {
  const raw = (key: string) => {
    const v = params[key];
    return typeof v === 'string' ? v : undefined;
  };

  const category = raw('category');
  const priceMinRaw = raw('priceMin');
  const priceMaxRaw = raw('priceMax');
  const sortRaw = raw('sort');
  const pageRaw = raw('page');

  const sortOptions = ['price_asc', 'price_desc', 'newest'] as const;
  const sort = sortOptions.includes(sortRaw as (typeof sortOptions)[number])
    ? (sortRaw as (typeof sortOptions)[number])
    : 'newest';

  return {
    category,
    priceMin: priceMinRaw ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw ? Number(priceMaxRaw) : undefined,
    sort,
    page: pageRaw ? Math.max(1, parseInt(pageRaw, 10)) : 1,
  };
}
