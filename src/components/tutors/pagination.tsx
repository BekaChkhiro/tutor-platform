'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/tutors?${params.toString()}`);
  }

  const pages = buildPageRange(page, totalPages);

  return (
    <nav aria-label="გვერდები" className="flex items-center justify-center gap-1 py-8">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="წინა გვერდი"
        className={cn(
          'flex size-9 items-center justify-center rounded-lg border text-sm transition-colors',
          page <= 1
            ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border hover:bg-muted cursor-pointer',
        )}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="text-muted-foreground flex size-9 items-center justify-center text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p as number)}
            aria-label={`გვერდი ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
              p === page
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:bg-muted cursor-pointer',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="შემდეგი გვერდი"
        className={cn(
          'flex size-9 items-center justify-center rounded-lg border text-sm transition-colors',
          page >= totalPages
            ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border hover:bg-muted cursor-pointer',
        )}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const result: (number | '...')[] = [1];

  if (current > 3) result.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let p = start; p <= end; p++) result.push(p);

  if (current < total - 2) result.push('...');
  result.push(total);

  return result;
}
