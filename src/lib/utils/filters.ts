export interface TutorFilters {
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sort?: string;
  page?: number;
}

export function encodeFilters(filters: TutorFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.categories?.length) {
    filters.categories.forEach((c) => params.append('category', c));
  }
  if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
  if (filters.rating !== undefined) params.set('rating', String(filters.rating));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page !== undefined && filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function decodeFilters(params: URLSearchParams): TutorFilters {
  const filters: TutorFilters = {};
  const categories = params.getAll('category');
  if (categories.length) filters.categories = categories;
  const priceMin = params.get('priceMin');
  if (priceMin !== null) filters.priceMin = Number(priceMin);
  const priceMax = params.get('priceMax');
  if (priceMax !== null) filters.priceMax = Number(priceMax);
  const rating = params.get('rating');
  if (rating !== null) filters.rating = Number(rating);
  const sort = params.get('sort');
  if (sort) filters.sort = sort;
  const page = params.get('page');
  if (page !== null) filters.page = Number(page);
  return filters;
}
