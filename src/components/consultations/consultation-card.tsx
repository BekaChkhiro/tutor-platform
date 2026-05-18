import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConsultationListItem } from '@/server/actions/consultations/types';

interface ConsultationCardProps {
  consultation: ConsultationListItem;
}

export function ConsultationCard({ consultation: c }: ConsultationCardProps) {
  const tutorName =
    [c.tutor.user.firstName, c.tutor.user.lastName].filter(Boolean).join(' ') || 'ექსპერტი';

  return (
    <Link
      href={`/tutors/${c.tutor.slug}/book?consultation=${c.id}`}
      className={cn(
        'group border-border bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl border',
        'shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
    >
      {/* Tutor photo — 3:2 aspect ratio */}
      <div className="bg-muted relative aspect-[3/2] w-full overflow-hidden">
        {c.tutor.photoUrl ? (
          <Image
            src={c.tutor.photoUrl}
            alt={tutorName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="bg-primary/10 flex h-full w-full items-center justify-center">
            <span className="text-primary/60 text-3xl font-semibold">
              {(c.tutor.user.firstName?.[0] ?? '?').toUpperCase()}
            </span>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-background/90 text-foreground rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
            {c.category.name}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">{c.title}</p>
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {c.descriptionShort}
        </p>

        {/* Tutor name + rating */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-xs">{tutorName}</p>
            {c.tutor.avgRating !== null && (
              <div className="mt-0.5 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-foreground text-xs font-medium">
                  {c.tutor.avgRating.toFixed(1)}
                </span>
                {c.tutor.reviewCount > 0 && (
                  <span className="text-muted-foreground text-xs">· {c.tutor.reviewCount}</span>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-foreground text-sm font-semibold">{c.priceGel}₾</p>
            <p className="text-muted-foreground mt-0.5 flex items-center justify-end gap-0.5 text-xs">
              <Clock className="h-3 w-3" />
              {c.durationMinutes} წთ
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
