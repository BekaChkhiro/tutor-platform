import { render, screen, within } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TutorCard } from './tutor-card';
import type { TutorListItem } from '@/lib/tutors/fetch-tutors';

afterEach(() => cleanup());

const mockTutor: TutorListItem = {
  id: 'tutor-1',
  userId: 'user-1',
  slug: 'nino-beridze',
  headline: 'მათემატიკის მასწავლებელი',
  bio: null,
  photoUrl: null,
  introVideoUrl: null,
  gender: null,
  iban: null,
  idDocument: null,
  refundPolicy: null,
  onboardingStep: 1,
  onboardingComplete: true,
  status: 'APPROVED',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: { firstName: 'ნინო', lastName: 'ბერიძე' },
  categories: [
    {
      tutorId: 'tutor-1',
      categoryId: 'cat-1',
      isPrimary: true,
      category: { name: 'მათემატიკა', slug: 'math' },
    },
  ],
  reviews: [{ rating: 5 }, { rating: 4 }],
  consultations: [{ priceGel: 30 as unknown as import('@prisma/client').Prisma.Decimal }],
};

describe('TutorCard', () => {
  it('renders tutor name and category', () => {
    render(<TutorCard tutor={mockTutor} />);
    expect(screen.getByText('ნინო ბერიძე')).toBeInTheDocument();
    expect(screen.getByText('მათემატიკა')).toBeInTheDocument();
  });

  it('renders rating when reviews exist', () => {
    render(<TutorCard tutor={mockTutor} />);
    const card = screen.getByRole('link');
    expect(within(card).getByText('4.5')).toBeInTheDocument();
  });

  it('links to the tutor profile page', () => {
    render(<TutorCard tutor={mockTutor} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tutors/nino-beridze');
  });

  it('renders "ახალი" when no reviews', () => {
    render(<TutorCard tutor={{ ...mockTutor, reviews: [] }} />);
    expect(screen.getByText('ახალი')).toBeInTheDocument();
  });

  it('renders fallback initial when no photo', () => {
    render(<TutorCard tutor={mockTutor} />);
    const card = screen.getByRole('link');
    expect(within(card).getByText('ნ')).toBeInTheDocument();
  });
});
