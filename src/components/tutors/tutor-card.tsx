import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TutorListItem } from '@/server/actions/tutors/fetch-tutors';

interface TutorCardProps {
  tutor: TutorListItem;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const name = [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'ექსპერტი';
  const category = tutor.categories[0]?.category;

  return (
    <Link
      href={`/tutors/${tutor.slug}`}
      className={cn(
        'group border-border bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl border',
        'shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
    >
      {/* Photo — 4:5 aspect ratio */}
      <div className="bg-muted relative aspect-[4/5] w-full overflow-hidden">
        {tutor.photoUrl ? (
          <Image
            src={tutor.photoUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="bg-primary/10 flex h-full w-full items-center justify-center">
            <span className="text-primary/60 text-3xl font-semibold">
              {(tutor.user.firstName?.[0] ?? '?').toUpperCase()}
            </span>
          </div>
        )}
        {/* Verified badge */}
        <div className="bg-primary absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-sm">
          <svg
            className="text-primary-foreground h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex flex-col gap-1 p-3">
        <p className="text-foreground truncate text-sm font-semibold">{name}</p>

        {tutor.headline && (
          <p className="text-muted-foreground line-clamp-2 text-xs">{tutor.headline}</p>
        )}

        {category && (
          <span className="bg-secondary text-secondary-foreground mt-0.5 inline-block w-fit rounded-full px-2 py-0.5 text-[11px] font-medium">
            {category.name}
          </span>
        )}

        <div className="mt-1 flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-foreground font-medium">
              {tutor.avgRating !== null ? tutor.avgRating.toFixed(1) : '—'}
            </span>
            {tutor.reviewCount > 0 && <span>· {tutor.reviewCount}</span>}
          </div>
          {tutor.minPrice !== null && (
            <span className="text-foreground text-xs font-medium">{tutor.minPrice}₾-დან</span>
          )}
        </div>
      </div>
    </Link>
  );
}
