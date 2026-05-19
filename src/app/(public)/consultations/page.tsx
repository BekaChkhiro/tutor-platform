import type { Metadata } from 'next';
import {
  fetchConsultations,
  fetchConsultationCategories,
  type ConsultationSortOption,
} from '@/lib/consultations/fetch-consultations';
import { ConsultationsGrid } from '@/components/consultations/consultations-grid';
import { ConsultationFilterSidebar } from '@/components/consultations/consultation-filter-sidebar';
import { ConsultationFilterDrawer } from '@/components/consultations/consultation-filter-drawer';
import { ConsultationPagination } from '@/components/consultations/consultation-pagination';

const TITLE = 'კონსულტაციები — Tutor';
const DESCRIPTION = 'იპოვე შენთვის სასურველი კონსულტაცია. გაფილტრე კატეგორიით, ფასით ან თარიღით.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/consultations',
    languages: { 'ka-GE': '/consultations' },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'ka_GE',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/api/og'],
  },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    priceMin?: string;
    priceMax?: string;
    page?: string;
  }>;
}

export default async function ConsultationsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const category = (params.category ?? '').trim();

  const sortParam = params.sort;
  const sort: ConsultationSortOption =
    sortParam === 'price_asc' || sortParam === 'price_desc' || sortParam === 'newest'
      ? sortParam
      : 'newest';

  const priceMinRaw = params.priceMin ?? '';
  const priceMaxRaw = params.priceMax ?? '';
  const priceMin =
    priceMinRaw !== '' && Number.isFinite(Number(priceMinRaw)) ? Number(priceMinRaw) : undefined;
  const priceMax =
    priceMaxRaw !== '' && Number.isFinite(Number(priceMaxRaw)) ? Number(priceMaxRaw) : undefined;

  const parsedPage = Number(params.page);
  const page =
    Number.isFinite(parsedPage) && Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [{ consultations, total, totalPages }, categories] = await Promise.all([
    fetchConsultations({ category, sort, priceMin, priceMax, page }),
    fetchConsultationCategories(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          კონსულტაციები
          {total > 0 && (
            <span className="text-muted-foreground ml-2 text-base font-normal">({total})</span>
          )}
        </h1>
        <ConsultationFilterDrawer
          categories={categories}
          activeCategory={category}
          activeSort={sort}
          activePriceMin={priceMinRaw}
          activePriceMax={priceMaxRaw}
          total={total}
        />
      </div>

      <div className="flex gap-8">
        <ConsultationFilterSidebar
          categories={categories}
          activeCategory={category}
          activeSort={sort}
          activePriceMin={priceMinRaw}
          activePriceMax={priceMaxRaw}
        />

        <div className="min-w-0 flex-1">
          {consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-lg font-medium">კონსულტაცია ვერ მოიძებნა</p>
              <p className="text-muted-foreground mt-1 text-sm">სცადეთ ფილტრების გასუფთავება</p>
            </div>
          ) : (
            <>
              <ConsultationsGrid consultations={consultations} />
              <ConsultationPagination page={page} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
