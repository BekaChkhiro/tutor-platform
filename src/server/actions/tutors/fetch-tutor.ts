'use server';

import { prisma } from '@/lib/db/prisma';

export interface ConsultationItem {
  id: string;
  title: string;
  descriptionShort: string;
  descriptionLong: string;
  durationMinutes: number;
  priceGel: string;
  bookingType: string;
  category: { name: string; slug: string };
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { firstName: string | null; lastName: string | null };
}

export interface TutorProfile {
  id: string;
  slug: string;
  photoUrl: string | null;
  headline: string | null;
  bio: string | null;
  introVideoUrl: string | null;
  user: { firstName: string | null; lastName: string | null };
  categories: { category: { id: string; name: string; slug: string } }[];
  skills: { id: string; name: string }[];
  consultations: ConsultationItem[];
  educations: {
    id: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startYear: number | null;
    endYear: number | null;
  }[];
  experiences: {
    id: string;
    company: string;
    role: string;
    startYear: number | null;
    endYear: number | null;
    description: string | null;
  }[];
  certificates: {
    id: string;
    title: string;
    issuer: string | null;
    issuedAt: Date | null;
  }[];
  reviews: ReviewItem[];
  avgRating: number | null;
  reviewCount: number;
}

export async function fetchTutorBySlug(slug: string): Promise<TutorProfile | null> {
  const tutor = await prisma.tutor.findFirst({
    where: { slug, status: 'APPROVED' },
    include: {
      user: { select: { firstName: true, lastName: true } },
      categories: {
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
      skills: { select: { id: true, name: true } },
      consultations: {
        where: { archived: false },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { priceGel: 'asc' },
      },
      educations: { orderBy: [{ startYear: 'desc' }, { id: 'asc' }] },
      experiences: { orderBy: [{ startYear: 'desc' }, { id: 'asc' }] },
      certificates: { orderBy: [{ issuedAt: 'desc' }, { id: 'asc' }] },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { user: { select: { firstName: true, lastName: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!tutor) return null;

  const avgRating =
    tutor.reviews.length > 0
      ? Math.round((tutor.reviews.reduce((s, r) => s + r.rating, 0) / tutor.reviews.length) * 10) /
        10
      : null;

  return {
    id: tutor.id,
    slug: tutor.slug,
    photoUrl: tutor.photoUrl,
    headline: tutor.headline,
    bio: tutor.bio,
    introVideoUrl: tutor.introVideoUrl,
    user: tutor.user,
    categories: tutor.categories,
    skills: tutor.skills,
    consultations: tutor.consultations.map((c) => ({
      id: c.id,
      title: c.title,
      descriptionShort: c.descriptionShort,
      descriptionLong: c.descriptionLong,
      durationMinutes: c.durationMinutes,
      priceGel: c.priceGel.toString(),
      bookingType: c.bookingType,
      category: c.category,
    })),
    educations: tutor.educations,
    experiences: tutor.experiences,
    certificates: tutor.certificates.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issuedAt: c.issuedAt,
    })),
    reviews: tutor.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: r.user,
    })),
    avgRating,
    reviewCount: tutor._count.reviews,
  };
}
