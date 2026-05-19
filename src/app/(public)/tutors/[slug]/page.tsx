import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchTutorBySlug, fetchApprovedTutorSlugs } from '@/lib/tutors/fetch-tutor';
import { TutorHero } from '@/components/tutors/profile/tutor-hero';
import { TabsContainer } from '@/components/tutors/profile/tabs-container';
import { AboutSection } from '@/components/tutors/profile/about-section';
import { ConsultationsList } from '@/components/tutors/profile/consultations-list';
import { ReviewsSection } from '@/components/tutors/profile/reviews-section';
import { BookingSidebar } from '@/components/tutors/profile/booking-sidebar';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return fetchApprovedTutorSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutor = await fetchTutorBySlug(slug);

  if (!tutor) {
    return { title: 'სპეციალისტი ვერ მოიძებნა' };
  }

  const name =
    [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'სპეციალისტი';
  const headline = tutor.headline ?? '';
  const description = tutor.bio
    ? tutor.bio.slice(0, 160)
    : `${name} — დადასტურებული სპეციალისტი Tutor-ზე.`;

  const avgRating =
    tutor.reviews.length > 0
      ? tutor.reviews.reduce((s, r) => s + r.rating, 0) / tutor.reviews.length
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: tutor.bio ?? undefined,
    image: tutor.photoUrl ?? undefined,
    jobTitle: headline || undefined,
    ...(avgRating != null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: tutor.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    makesOffer: tutor.consultations.map((c) => ({
      '@type': 'Offer',
      name: c.title,
      description: c.descriptionShort,
      price: Number(c.priceGel).toFixed(2),
      priceCurrency: 'GEL',
    })),
  };

  return {
    title: `${name} — ${headline || 'სპეციალისტი'} · Tutor`,
    description,
    alternates: { canonical: `/tutors/${slug}` },
    openGraph: {
      title: `${name} · Tutor`,
      description,
      type: 'profile',
      locale: 'ka_GE',
    },
    other: {
      'script:ld+json': JSON.stringify(jsonLd),
    },
  };
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const tutor = await fetchTutorBySlug(slug);

  if (!tutor) notFound();

  const name =
    [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'სპეციალისტი';
  const avgRating =
    tutor.reviews.length > 0
      ? tutor.reviews.reduce((s, r) => s + r.rating, 0) / tutor.reviews.length
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: tutor.bio ?? undefined,
    image: tutor.photoUrl ?? undefined,
    jobTitle: tutor.headline ?? undefined,
    ...(avgRating != null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: tutor.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    makesOffer: tutor.consultations.map((c) => ({
      '@type': 'Offer',
      name: c.title,
      description: c.descriptionShort,
      price: Number(c.priceGel).toFixed(2),
      priceCurrency: 'GEL',
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <TutorHero tutor={tutor} />

      {/* Mobile sticky bottom CTA */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <button
          disabled
          className="bg-primary-500 w-full cursor-not-allowed rounded-lg py-3 text-sm font-medium text-white opacity-60"
        >
          კონსულტაციის ჯავშანი
        </button>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <TabsContainer
              reviewCount={tutor.reviews.length}
              consultationCount={tutor.consultations.length}
              aboutContent={<AboutSection tutor={tutor} />}
              consultationsContent={<ConsultationsList consultations={tutor.consultations} />}
              reviewsContent={<ReviewsSection reviews={tutor.reviews} />}
            />
          </div>

          {/* Sidebar — hidden on mobile (replaced by sticky bottom bar) */}
          <aside className="hidden lg:block lg:w-72 lg:shrink-0 xl:w-80">
            <div className="sticky top-4">
              <BookingSidebar tutor={tutor} />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
