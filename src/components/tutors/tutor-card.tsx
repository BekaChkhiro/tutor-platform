import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { TutorListItem } from '@/lib/tutors/fetch-tutors';

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export function TutorCard({ tutor }: { tutor: TutorListItem }) {
  const name = [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'Tutor';
  const category = tutor.categories[0]?.category.name;
  const rating = avgRating(tutor.reviews);
  const reviewCount = tutor.reviews.length;
  const minPrice =
    tutor.consultations.length > 0
      ? Math.min(...tutor.consultations.map((c) => Number(c.priceGel)))
      : null;

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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-4xl font-semibold">{name.charAt(0)}</span>
          </div>
        )}
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
