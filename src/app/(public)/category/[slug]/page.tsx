import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchCategoryBySlug,
  fetchCategories,
  fetchTutors,
  type SortOption,
} from '@/lib/tutors/fetch-tutors';
import { CategoryHero } from '@/components/tutors/category-hero';
import { TutorsGrid } from '@/components/tutors/tutors-grid';
import { CategoryPagination } from '@/components/tutors/category-pagination';
import { EmptyFilterState } from '@/components/tutors/empty-filter-state';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  if (!category) return { title: 'კატეგორია ვერ მოიძებნა' };

  const title = `${category.name} სპეციალისტები — Tutor`;
  const description =
    category.description ??
    `იპოვე ${category.name} სპეციალისტი. შეადარე ფასები, წაიკითხე შეფასებები და დაჯავშნე კონსულტაცია.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ka_GE',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const sortParam = sp.sort;
  const sort: SortOption =
    sortParam === 'newest' ||
    sortParam === 'rating' ||
    sortParam === 'price_asc' ||
    sortParam === 'price_desc'
      ? sortParam
      : 'newest';

  const parsedPage = Number(sp.page);
  const page =
    Number.isFinite(parsedPage) && Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [category, { tutors, total, totalPages }, allCategories] = await Promise.all([
    fetchCategoryBySlug(slug),
    fetchTutors({ category: slug, sort, page }),
    fetchCategories(),
  ]);

  if (!category) notFound();

  const relatedCategories = allCategories.filter((c) => c.slug !== slug);

  return (
    <>
      <CategoryHero category={category} tutorCount={total} relatedCategories={relatedCategories} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tutors.length === 0 ? (
          <EmptyFilterState />
        ) : (
          <>
            <TutorsGrid tutors={tutors} />
            <CategoryPagination
              page={page}
              totalPages={totalPages}
              basePath={`/category/${slug}`}
            />
          </>
        )}
      </main>
    </>
  );
}
