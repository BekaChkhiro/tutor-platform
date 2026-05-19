import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

export function CategoryPagination({ page, totalPages, basePath }: CategoryPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  function href(p: number) {
    return p === 1 ? basePath : `${basePath}?page=${p}`;
  }

  return (
    <nav aria-label="გვერდები" className="flex items-center justify-center gap-1 py-8">
      {page <= 1 ? (
        <span
          aria-disabled="true"
          aria-label="წინა გვერდი"
          className="border-border text-muted-foreground flex size-9 cursor-not-allowed items-center justify-center rounded-lg border text-sm opacity-50"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </span>
      ) : (
        <Link
          href={href(page - 1)}
          aria-label="წინა გვერდი"
          className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-lg border text-sm transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="text-muted-foreground flex size-9 items-center justify-center text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            aria-label={`გვერდი ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
              p === page
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:bg-muted',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page >= totalPages ? (
        <span
          aria-disabled="true"
          aria-label="შემდეგი გვერდი"
          className="border-border text-muted-foreground flex size-9 cursor-not-allowed items-center justify-center rounded-lg border text-sm opacity-50"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      ) : (
        <Link
          href={href(page + 1)}
          aria-label="შემდეგი გვერდი"
          className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-lg border text-sm transition-colors"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
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
