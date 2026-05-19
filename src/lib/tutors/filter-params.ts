import type { SortOption } from './fetch-tutors';

export interface FilterParams {
  category: string;
  sort: SortOption;
  q: string;
  page: number;
}

const DEFAULT_SORT: SortOption = 'newest';

export function encodeFilterParams(filters: Partial<FilterParams>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);
  if (filters.q) params.set('q', filters.q);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function decodeFilterParams(params: URLSearchParams): FilterParams {
  return {
    category: params.get('category') ?? '',
    sort: (params.get('sort') ?? DEFAULT_SORT) as SortOption,
    q: params.get('q') ?? '',
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
  };
}
