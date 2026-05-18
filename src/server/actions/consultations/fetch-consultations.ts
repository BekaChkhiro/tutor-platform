'use server';

import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';
import type { ConsultationFilters, ConsultationListItem, FetchConsultationsResult } from './types';

const PER_PAGE = 12;

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
