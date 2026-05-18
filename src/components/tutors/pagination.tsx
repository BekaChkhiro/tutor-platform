'use client';

import { useFilters } from '@/hooks/use-filters';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentFilters: {
    categories: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    sort: 'rating' | 'price_asc' | 'price_desc' | 'newest';
  };
}

export function Pagination({ currentPage, totalPages, currentFilters }: PaginationProps) {
  const { apply } = useFilters();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    apply({ ...currentFilters, page });
  }

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="გვერდები">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="წინა გვერდი"
        className={cn(
          'border-border flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors',
          'hover:bg-muted disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm transition-colors',
              p === currentPage
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="შემდეგი გვერდი"
        className={cn(
          'border-border flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors',
          'hover:bg-muted disabled:pointer-events-none disabled:opacity-40',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}
