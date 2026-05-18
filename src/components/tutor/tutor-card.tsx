import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatGelPrice } from '@/lib/utils/price';

export interface TutorCardProps {
  id: string;
  slug: string;
  name: string;
  headline: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  hourlyRate: number;
  variant?: 'default' | 'compact' | 'featured';
}

export function TutorCard({
  slug,
  name,
  headline,
  photoUrl,
  rating,
  reviewCount,
  categories,
  hourlyRate,
  variant = 'default',
}: TutorCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <Link
      href={`/tutors/${slug}`}
      className={cn(
        'group border-border bg-card flex flex-col rounded-xl border transition-shadow hover:shadow-md',
        isFeatured && 'ring-primary ring-2',
        isCompact && 'flex-row gap-3 p-3',
        !isCompact && 'overflow-hidden',
      )}
      aria-label={`${name} — ${headline}`}
    >
      <div
        className={cn(
          'bg-muted relative shrink-0 overflow-hidden',
          isCompact ? 'size-14 rounded-lg' : 'aspect-[4/3] w-full',
          isFeatured && !isCompact && 'aspect-[3/2]',
        )}
      >
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isCompact ? '56px' : '(max-width: 640px) 100vw, 320px'}
          />
        ) : (
          <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-2xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className={cn('flex flex-col gap-1', !isCompact && 'p-4')}>
        <p className={cn('leading-snug font-semibold', isCompact ? 'text-sm' : 'text-base')}>
          {name}
        </p>
        <p
          className={cn(
            'text-muted-foreground line-clamp-2 leading-snug',
            isCompact ? 'text-xs' : 'text-sm',
          )}
        >
          {headline}
        </p>

        {categories?.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {categories.slice(0, isCompact ? 1 : 3).map((cat) => (
              <span
                key={cat}
                className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs"
              >
                {cat}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          {rating !== undefined ? (
            <span className="flex items-center gap-1 text-xs">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && (
                <span className="text-muted-foreground">({reviewCount})</span>
              )}
            </span>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold">{formatGelPrice(hourlyRate)}</span>
        </div>
      </div>
    </Link>
  );
}
