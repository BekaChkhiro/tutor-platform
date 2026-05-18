'use client';

import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TutorCard, type TutorCardProps } from './tutor-card';

export interface TutorCarouselProps {
  tutors: TutorCardProps[];
  title?: string;
}

export function TutorCarousel({ tutors, title }: TutorCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(tutors.length > 0);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  function scrollBy(direction: 'left' | 'right') {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('li')?.getBoundingClientRect().width ?? 280;
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const items = Array.from(trackRef.current?.querySelectorAll('li') ?? []);
      const focused = document.activeElement;
      const idx = items.findIndex((li) => li.contains(focused));
      const next = items[idx + 1];
      if (next) (next.querySelector('a') as HTMLAnchorElement | null)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const items = Array.from(trackRef.current?.querySelectorAll('li') ?? []);
      const focused = document.activeElement;
      const idx = items.findIndex((li) => li.contains(focused));
      const prev = items[idx - 1];
      if (prev) (prev.querySelector('a') as HTMLAnchorElement | null)?.focus();
    }
  }

  if (tutors.length === 0) return null;

  return (
    <section
      aria-label={title ?? 'Tutor carousel'}
      className="relative"
      data-testid="tutor-carousel"
    >
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy('left')}
            aria-label="Scroll left"
            className={cn(
              'border-border bg-background absolute top-1/2 -left-4 z-10 -translate-y-1/2',
              'flex size-8 items-center justify-center rounded-full border shadow-sm',
              'hover:bg-muted transition-colors',
            )}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        )}

        <ul
          ref={trackRef}
          onScroll={updateScrollState}
          onKeyDown={handleKeyDown}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          aria-label={title ?? 'Tutor list'}
        >
          {tutors.map((tutor) => (
            <li key={tutor.id} className="w-[260px] shrink-0 snap-start">
              <TutorCard {...tutor} variant="compact" />
            </li>
          ))}
        </ul>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy('right')}
            aria-label="Scroll right"
            className={cn(
              'border-border bg-background absolute top-1/2 -right-4 z-10 -translate-y-1/2',
              'flex size-8 items-center justify-center rounded-full border shadow-sm',
              'hover:bg-muted transition-colors',
            )}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
