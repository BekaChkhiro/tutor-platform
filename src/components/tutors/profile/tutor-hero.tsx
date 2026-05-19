import Image from 'next/image';
import { Star, CheckCircle } from 'lucide-react';
import type { TutorProfile } from '@/lib/tutors/fetch-tutor';

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export function TutorHero({ tutor }: { tutor: TutorProfile }) {
  const name =
    [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'სპეციალისტი';
  const rating = avgRating(tutor.reviews);
  const reviewCount = tutor.reviews.length;

  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Photo */}
          <div className="relative shrink-0">
            <div className="shadow-hover relative size-28 overflow-hidden rounded-full ring-4 ring-white sm:size-36">
              {tutor.photoUrl ? (
                <Image
                  src={tutor.photoUrl}
                  alt={name}
                  fill
                  sizes="144px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="bg-primary-50 flex h-full items-center justify-center">
                  <span className="text-primary-500 text-4xl font-semibold">{name.charAt(0)}</span>
                </div>
              )}
            </div>
            <span
              aria-label="დადასტურებული ექსპერტი"
              className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow ring-2 ring-white"
            >
              <CheckCircle className="size-4" aria-hidden />
            </span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-h3 font-semibold text-neutral-900">{name}</h1>
            {tutor.headline && <p className="text-body mt-1 text-neutral-600">{tutor.headline}</p>}

            {/* Categories */}
            {tutor.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tutor.categories.map(({ category }) => (
                  <span
                    key={category.slug}
                    className="border-border inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              {reviewCount > 0 ? (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" aria-hidden />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-neutral-400">· {reviewCount} შეფასება</span>
                </span>
              ) : (
                <span className="text-neutral-400">ახალი სპეციალისტი</span>
              )}
              {tutor.consultations.length > 0 && (
                <span className="text-neutral-400">{tutor.consultations.length} კონსულტაცია</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
