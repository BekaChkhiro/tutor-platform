import Image from 'next/image';
import { Star } from 'lucide-react';
import type { TutorProfile } from '@/lib/tutors/fetch-tutor';

type Review = TutorProfile['reviews'][number];

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'size-5' : 'size-3.5';
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-200 text-neutral-200'}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-10 shrink-0 text-right text-neutral-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-yellow-400"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <span className="w-6 shrink-0 text-neutral-400">{count}</span>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ka-GE', { year: 'numeric', month: 'long' }).format(date);
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return <p className="py-8 text-center text-sm text-neutral-400">შეფასებები ჯერ არ არის</p>;
  }

  const total = reviews.length;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-8">
      {/* Aggregate */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="text-center sm:text-left">
          <p className="text-display font-bold text-neutral-900">{avg.toFixed(1)}</p>
          <Stars rating={Math.round(avg)} size="lg" />
          <p className="text-caption mt-1 text-neutral-400">{total} შეფასება</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map(({ star, count }) => (
            <RatingBar key={star} label={`${star} ★`} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <ul className="space-y-5">
        {reviews.map((review) => {
          const reviewer =
            [review.user.firstName, review.user.lastName].filter(Boolean).join(' ') || 'ანონიმური';
          const initial = reviewer.charAt(0);

          return (
            <li key={review.id} className="flex gap-4">
              <div className="shrink-0">
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt={reviewer}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-sm font-medium text-neutral-600">{initial}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body-sm font-medium text-neutral-900">{reviewer}</span>
                  <Stars rating={review.rating} />
                  <span className="text-caption text-neutral-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-body-sm mt-1 leading-relaxed text-neutral-600">
                    {review.comment}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
