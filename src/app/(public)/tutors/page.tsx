import type { Metadata } from 'next';
import { fetchTutors, fetchCategories, type SortOption } from '@/lib/tutors/fetch-tutors';
import { TutorsGrid } from '@/components/tutors/tutors-grid';
import { FilterSidebar } from '@/components/tutors/filter-sidebar';
import { FilterDrawer } from '@/components/tutors/filter-drawer';
import { Pagination } from '@/components/tutors/pagination';
import { EmptyFilterState } from '@/components/tutors/empty-filter-state';

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string; q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const base = 'ექსპერტები — Tutor';
  const title = params.category ? `${params.category} · ${base}` : base;
  return {
    title,
    description: 'დადასტურებული სპეციალისტების სია. გაფილტრე კატეგორიით, ფასით ან რეიტინგით.',
    alternates: { canonical: '/tutors' },
  };
}

export default async function TutorsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const category = (params.category ?? '').trim();
  const q = (params.q ?? '').trim();

  const sortParam = params.sort;
  const sort: SortOption =
    sortParam === 'newest' ||
    sortParam === 'rating' ||
    sortParam === 'price_asc' ||
    sortParam === 'price_desc'
      ? sortParam
      : 'newest';

  const parsedPage = Number(params.page);
  const page =
    Number.isFinite(parsedPage) && Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [{ tutors, total, totalPages }, categories] = await Promise.all([
    fetchTutors({ category, sort, q, page }),
    fetchCategories(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          ექსპერტები
          {total > 0 && (
            <span className="text-muted-foreground ml-2 text-base font-normal">({total})</span>
          )}
        </h1>
        <FilterDrawer
          categories={categories}
          activeCategory={category}
          activeSort={sort}
          total={total}
        />
      </div>

      <div className="flex gap-8">
        <FilterSidebar categories={categories} activeCategory={category} activeSort={sort} />

        <div className="min-w-0 flex-1">
          {tutors.length === 0 ? (
            <EmptyFilterState />
          ) : (
            <>
              <TutorsGrid tutors={tutors} />
              <Pagination page={page} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
