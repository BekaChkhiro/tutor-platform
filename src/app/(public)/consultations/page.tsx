import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchConsultations } from '@/server/actions/consultations/fetch-consultations';
import { parseConsultationFilters } from '@/server/actions/consultations/types';
import { fetchCategories } from '@/server/actions/tutors/fetch-tutors';
import { ConsultationCard } from '@/components/consultations/consultation-card';
import { ConsultationFilterSidebar } from '@/components/consultations/consultation-filter-sidebar';
import { ConsultationFilterDrawer } from '@/components/consultations/consultation-filter-drawer';
import { cn } from '@/lib/utils';

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseConsultationFilters(params);
  const hasFilters =
    filters.category !== undefined ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined;

  const title = hasFilters ? 'კონსულტაციების ძებნა — Tutor' : 'კონსულტაციები — Tutor';

  return {
    title,
    description: 'იპოვე კონსულტაცია — ფილტრება კატეგორიით და ფასით.',
  };
}

export default async function ConsultationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseConsultationFilters(params);

  const [result, categories] = await Promise.all([fetchConsultations(filters), fetchCategories()]);

  const hasActiveFilters =
    filters.category !== undefined ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.sort !== 'newest';

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">კონსულტაციები</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {result.total > 0 ? `${result.total} კონსულტაცია` : 'კონსულტაცია ვერ მოიძებნა'}
        </p>
      </div>

      {/* Mobile filter trigger */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <ConsultationFilterDrawer categories={categories} initialFilters={filters} />
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <ConsultationFilterSidebar categories={categories} initialFilters={filters} />

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {result.consultations.length === 0 ? (
            hasActiveFilters ? (
              <div className="border-border rounded-xl border py-20 text-center">
                <p className="text-foreground font-medium">ფილტრის შედეგი ვერ მოიძებნა</p>
                <p className="text-muted-foreground mt-1 text-sm">სცადე ფილტრების შეცვლა ან</p>
                <Link
                  href="/consultations"
                  className="text-primary mt-2 inline-block text-sm underline-offset-2 hover:underline"
                >
                  ყველა კონსულტაციის ნახვა
                </Link>
              </div>
            ) : (
              <div className="text-muted-foreground py-20 text-center">
                ჯერ არ არის დამატებული კონსულტაცია
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.consultations.map((c) => (
                  <ConsultationCard key={c.id} consultation={c} />
                ))}
              </div>
              {result.totalPages > 1 && (
                <ConsultationsPagination
                  currentPage={result.page}
                  totalPages={result.totalPages}
                  filters={filters}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ConsultationsPagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: ReturnType<typeof parseConsultationFilters>;
}) {
  function href(page: number) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return `/consultations${query ? `?${query}` : ''}`;
  }

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="გვერდები">
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          aria-label="წინა გვერდი"
          className="border-border hover:bg-muted flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="border-border flex h-8 w-8 items-center justify-center rounded-lg border text-sm opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm transition-colors',
              p === currentPage
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          aria-label="შემდეგი გვერდი"
          className="border-border hover:bg-muted flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="border-border flex h-8 w-8 items-center justify-center rounded-lg border text-sm opacity-40">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
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
