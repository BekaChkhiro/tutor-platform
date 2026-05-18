import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export interface TutorCardData {
  slug: string;
  name: string;
  headline: string;
  category: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  photoUrl: string | null;
  verified: boolean;
}

export function TutorCard({ tutor }: { tutor: TutorCardData }) {
  const initials = tutor.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/tutors/${tutor.slug}`}
      className="group border-border block overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none"
    >
      {/* Photo — 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-indigo-50">
        {tutor.photoUrl ? (
          <Image
            src={tutor.photoUrl}
            alt={tutor.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-indigo-300">{initials}</span>
          </div>
        )}
        {tutor.verified && (
          <div className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-indigo-600 shadow-sm">
            <CheckCircle2 className="size-4 text-white" aria-label="სერტიფიცირებული" />
          </div>
        )}
      </div>

      {/* Content footer — 96px */}
      <div className="flex min-h-[96px] flex-col justify-between p-4">
        <div className="space-y-0.5">
          <p className="truncate text-sm font-bold text-neutral-900">{tutor.name}</p>
          <p className="line-clamp-2 text-xs leading-snug text-neutral-600">{tutor.headline}</p>
          <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
            {tutor.category}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-neutral-700">
            ★ {tutor.rating.toFixed(1)} · {tutor.reviewCount}
          </span>
          <span className="text-xs font-semibold text-neutral-700">
            {tutor.startingPrice} ₾-დან
          </span>
        </div>
      </div>
    </Link>
  );
}
