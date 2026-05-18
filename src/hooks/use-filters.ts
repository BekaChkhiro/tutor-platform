'use client';

import { useRouter } from 'next/navigation';
import type { TutorFilters } from '@/server/actions/tutors/fetch-tutors';

export type { TutorFilters };

export interface ParsedFilters {
  categories: string[];
  priceMin: number | undefined;
  priceMax: number | undefined;
  rating: number | undefined;
  sort: 'rating' | 'price_asc' | 'price_desc' | 'newest';
  page: number;
}

export function useFilters() {
  const router = useRouter();

  function apply(filters: TutorFilters) {
    const params = new URLSearchParams();

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((c) => params.append('category', c));
    }
    if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
    if (filters.rating !== undefined) params.set('rating', String(filters.rating));
    if (filters.sort && filters.sort !== 'rating') params.set('sort', filters.sort);
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));

    const query = params.toString();
    router.push(`/tutors${query ? `?${query}` : ''}`);
  }

  return { apply };
}

export function parseFilters(params: Record<string, string | string[] | undefined>): ParsedFilters {
  const raw = (key: string) => {
    const v = params[key];
    return typeof v === 'string' ? v : undefined;
  };

  const categories = params['category'];
  const normalizedCategories = Array.isArray(categories)
    ? categories
    : categories
      ? [categories]
      : [];

  const priceMinRaw = raw('priceMin');
  const priceMaxRaw = raw('priceMax');
  const ratingRaw = raw('rating');
  const sortRaw = raw('sort');
  const pageRaw = raw('page');

  const sortOptions = ['rating', 'price_asc', 'price_desc', 'newest'] as const;
  const sort = sortOptions.includes(sortRaw as (typeof sortOptions)[number])
    ? (sortRaw as (typeof sortOptions)[number])
    : 'rating';

  return {
    categories: normalizedCategories,
    priceMin: priceMinRaw ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw ? Number(priceMaxRaw) : undefined,
    rating: ratingRaw ? Number(ratingRaw) : undefined,
    sort,
    page: pageRaw ? Math.max(1, parseInt(pageRaw, 10)) : 1,
  };
}
