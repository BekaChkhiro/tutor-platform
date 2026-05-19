'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';

interface TutorCarouselProps {
  children: ReactNode;
  label?: string;
}

export function TutorCarousel({ children, label = 'ექსპერტების კარუსელი' }: TutorCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const cards = Array.from(
      containerRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [],
    );
    const activeIdx = cards.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowRight' && activeIdx < cards.length - 1) {
      e.preventDefault();
      cards[activeIdx + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && activeIdx > 0) {
      e.preventDefault();
      cards[activeIdx - 1]?.focus();
    }
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={label}
      className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
