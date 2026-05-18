'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TutorCard, type TutorCardData } from './TutorCard';

interface TutorCarouselProps {
  tutors: TutorCardData[];
}

export function TutorCarousel({ tutors }: TutorCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.75;
    track.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="group/carousel relative">
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex scrollbar-none gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {tutors.map((tutor) => (
          <div
            key={tutor.slug}
            className="w-[220px] shrink-0 sm:w-[240px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <TutorCard tutor={tutor} />
          </div>
        ))}
      </div>

      {/* Arrow buttons — desktop only */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="წინა"
        className="border-border absolute top-1/3 -left-4 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white p-1.5 shadow-md transition-opacity group-hover/carousel:flex hover:bg-neutral-50"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="შემდეგი"
        className="border-border absolute top-1/3 -right-4 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white p-1.5 shadow-md transition-opacity group-hover/carousel:flex hover:bg-neutral-50"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
