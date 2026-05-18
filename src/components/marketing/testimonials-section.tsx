import Image from 'next/image';
import { Star } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';

export const revalidate = 60;

export async function TestimonialsSection() {
  const reviews = await prisma.review.findMany({
    where: {
      rating: { gte: 4 },
      comment: { not: null },
      tutor: { status: 'APPROVED' },
    },
    orderBy: { rating: 'desc' },
    take: 3,
    include: {
      user: { select: { firstName: true, lastName: true, image: true } },
      tutor: {
        select: {
          slug: true,
          headline: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          id="testimonials-heading"
          className="mb-10 text-center text-2xl font-semibold tracking-tight"
        >
          რას ამბობენ მომხმარებლები
        </h2>
        <ul className="grid gap-6 md:grid-cols-3" role="list">
          {reviews.map((review) => {
            const userName =
              [review.user.firstName, review.user.lastName].filter(Boolean).join(' ') ||
              'მომხმარებელი';
            const tutorName =
              [review.tutor.user.firstName, review.tutor.user.lastName].filter(Boolean).join(' ') ||
              'ექსპერტი';

            return (
              <li
                key={review.id}
                className="border-border bg-background flex flex-col gap-4 rounded-2xl border p-6 shadow-sm"
              >
                <div
                  className="flex gap-0.5"
                  aria-label={`შეფასება: ${review.rating} ვარსკვლავი 5-დან`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="text-foreground flex-1 text-sm leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="bg-muted relative size-9 overflow-hidden rounded-full">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={userName}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground flex h-full items-center justify-center text-sm font-semibold">
                        {userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-muted-foreground text-xs">სესია — {tutorName}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
