import type { Metadata } from 'next';
import { fetchTutors, fetchCategories } from '@/server/actions/tutors/fetch-tutors';
import { parseFilters } from '@/hooks/use-filters';
import { FilterSidebar } from '@/components/tutors/filter-sidebar';
import { FilterDrawer } from '@/components/tutors/filter-drawer';
import { TutorsGrid } from '@/components/tutors/tutors-grid';
import { Pagination } from '@/components/tutors/pagination';
import { EmptyFilterState } from '@/components/tutors/empty-filter-state';

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseFilters(params);
  const hasFilters =
    filters.categories.length > 0 ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.rating !== undefined;

  const title = hasFilters ? 'ექსპერტების ძებნა — Tutor' : 'ექსპერტები — Tutor';

  return {
    title,
    description: 'იპოვე შენი ექსპერტი — ფილტრება კატეგორიით, ფასით და რეიტინგით.',
  };
}

export default async function TutorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [result, categories] = await Promise.all([fetchTutors(filters), fetchCategories()]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.rating !== undefined ||
    filters.sort !== 'rating';

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">ექსპერტები</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {result.total > 0 ? `${result.total} ექსპერტი` : 'ექსპერტი ვერ მოიძებნა'}
        </p>
      </div>

      {/* Mobile filter trigger */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <FilterDrawer categories={categories} initialFilters={filters} />
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <FilterSidebar categories={categories} initialFilters={filters} />

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {result.tutors.length === 0 ? (
            hasActiveFilters ? (
              <EmptyFilterState />
            ) : (
              <div className="text-muted-foreground py-20 text-center">
                ჯერ არ არის დამატებული ექსპერტი
              </div>
            )
          ) : (
            <>
              <TutorsGrid tutors={result.tutors} />
              <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
                currentFilters={{
                  categories: filters.categories,
                  priceMin: filters.priceMin,
                  priceMax: filters.priceMax,
                  rating: filters.rating,
                  sort: filters.sort,
                }}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
