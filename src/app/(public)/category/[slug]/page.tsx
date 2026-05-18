import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  fetchCategoryBySlug,
  fetchTutors,
  fetchCategories,
} from '@/server/actions/tutors/fetch-tutors';
import { TutorsGrid } from '@/components/tutors/tutors-grid';
import { cn } from '@/lib/utils';

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { title: 'კატეგორია ვერ მოიძებნა' };

  return {
    title: `${category.name} ექსპერტები — Tutor`,
    description: category.description ?? `იპოვე ${category.name} ექსპერტი Tutor-ზე.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const pageRaw = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const [category, result] = await Promise.all([
    fetchCategoryBySlug(slug),
    fetchTutors({ categories: [slug], page }),
  ]);

  if (!category) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back nav */}
      <div className="mb-6">
        <Link
          href="/tutors"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          ყველა ექსპერტი
        </Link>
        <h1 className="text-foreground mt-3 text-2xl font-semibold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {result.total > 0 ? `${result.total} ექსპერტი` : 'ექსპერტი ვერ მოიძებნა'}
        </p>
      </div>

      {/* Results */}
      {result.tutors.length === 0 ? (
        <div className="text-muted-foreground py-20 text-center">
          ამ კატეგორიაში ჯერ ექსპერტი არ არის
        </div>
      ) : (
        <div className="space-y-6">
          <TutorsGrid tutors={result.tutors} />
          {result.totalPages > 1 && (
            <CategoryPagination
              currentPage={result.page}
              totalPages={result.totalPages}
              slug={slug}
            />
          )}
        </div>
      )}
    </main>
  );
}

function CategoryPagination({
  currentPage,
  totalPages,
  slug,
}: {
  currentPage: number;
  totalPages: number;
  slug: string;
}) {
  function href(p: number) {
    return p === 1 ? `/category/${slug}` : `/category/${slug}?page=${p}`;
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
