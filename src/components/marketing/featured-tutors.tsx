import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { TutorCarousel } from './tutor-carousel';

export const revalidate = 60;

type TutorWithData = Awaited<ReturnType<typeof fetchFeaturedTutors>>[number];

async function fetchFeaturedTutors() {
  return prisma.tutor.findMany({
    where: { status: 'APPROVED' },
    orderBy: { reviews: { _count: 'desc' } },
    take: 8,
    include: {
      user: { select: { firstName: true, lastName: true } },
      categories: {
        include: { category: { select: { name: true } } },
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
}

function avgRating(ratings: { rating: number }[]): number {
  if (!ratings.length) return 0;
  return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
}

function TutorCard({ tutor }: { tutor: TutorWithData }) {
  const name = [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'Tutor';
  const category = tutor.categories[0]?.category.name;
  const rating = avgRating(tutor.reviews);
  const reviewCount = tutor.reviews.length;
  const minPrice = tutor.consultations[0]?.priceGel;

  return (
    <Link
      href={`/tutors/${tutor.slug}`}
      className="group border-border bg-background block overflow-hidden rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      aria-label={`${name} — ${category ?? 'სპეციალისტი'}`}
    >
      <div className="bg-muted relative aspect-[4/5] overflow-hidden">
        {tutor.photoUrl ? (
          <Image
            src={tutor.photoUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-4xl font-semibold">{name.charAt(0)}</span>
          </div>
        )}
        {tutor.status === 'APPROVED' && (
          <span
            aria-label="დადასტურებული ექსპერტი"
            className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow"
          >
            <svg className="size-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7L5.5 10L11.5 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-foreground truncate font-semibold">{name}</p>
        {tutor.headline && (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{tutor.headline}</p>
        )}
        {category && (
          <span className="border-border mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
            {category}
          </span>
        )}
        <div className="mt-2 flex items-center justify-between text-xs">
          {reviewCount > 0 ? (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">· {reviewCount}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">ახალი</span>
          )}
          {minPrice != null && (
            <span className="text-muted-foreground">{Number(minPrice).toFixed(0)} ₾-დან</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export async function FeaturedTutors() {
  const tutors = await fetchFeaturedTutors();

  if (tutors.length === 0) return null;

  return (
    <section aria-labelledby="featured-heading" className="bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight">
            გამორჩეული ექსპერტები
          </h2>
          <Link
            href="/tutors"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ყველა ნახვა →
          </Link>
        </div>
        <TutorCarousel>
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="w-44 shrink-0 sm:w-52"
              style={{ scrollSnapAlign: 'start' }}
            >
              <TutorCard tutor={tutor} />
            </div>
          ))}
        </TutorCarousel>
        <p className="text-muted-foreground mt-3 text-center text-xs md:hidden">გადაფურცლე →</p>
      </div>
    </section>
  );
}
