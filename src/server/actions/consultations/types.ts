export interface ConsultationFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
}

export interface ConsultationListItem {
  id: string;
  title: string;
  descriptionShort: string;
  durationMinutes: number;
  priceGel: number;
  bookingType: string;
  category: { name: string; slug: string };
  tutor: {
    slug: string;
    photoUrl: string | null;
    headline: string | null;
    user: { firstName: string | null; lastName: string | null };
    avgRating: number | null;
    reviewCount: number;
  };
}

export interface FetchConsultationsResult {
  consultations: ConsultationListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function parseConsultationFilters(
  params: Record<string, string | string[] | undefined>,
): ConsultationFilters {
  const raw = (key: string) => {
    const v = params[key];
    return typeof v === 'string' ? v : undefined;
  };

  const category = raw('category');
  const priceMinRaw = raw('priceMin');
  const priceMaxRaw = raw('priceMax');
  const sortRaw = raw('sort');
  const pageRaw = raw('page');

  const sortOptions = ['price_asc', 'price_desc', 'newest'] as const;
  const sort = sortOptions.includes(sortRaw as (typeof sortOptions)[number])
    ? (sortRaw as (typeof sortOptions)[number])
    : 'newest';

  return {
    category,
    priceMin: priceMinRaw ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw ? Number(priceMaxRaw) : undefined,
    sort,
    page: pageRaw ? Math.max(1, parseInt(pageRaw, 10)) : 1,
  };
}
