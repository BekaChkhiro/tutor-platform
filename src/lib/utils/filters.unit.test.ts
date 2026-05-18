import { describe, expect, it } from 'vitest';
import { decodeFilters, encodeFilters, type TutorFilters } from './filters';

describe('encodeFilters / decodeFilters round-trip (T2.9.1)', () => {
  function roundTrip(filters: TutorFilters): TutorFilters {
    return decodeFilters(encodeFilters(filters));
  }

  it('round-trips an empty filter object', () => {
    expect(roundTrip({})).toEqual({});
  });

  it('round-trips a single category', () => {
    expect(roundTrip({ categories: ['math'] })).toEqual({ categories: ['math'] });
  });

  it('round-trips multiple categories', () => {
    const out = roundTrip({ categories: ['math', 'physics', 'chemistry'] });
    expect(out.categories).toEqual(['math', 'physics', 'chemistry']);
  });

  it('round-trips priceMin and priceMax', () => {
    expect(roundTrip({ priceMin: 20, priceMax: 100 })).toEqual({ priceMin: 20, priceMax: 100 });
  });

  it('round-trips zero priceMin', () => {
    expect(roundTrip({ priceMin: 0 })).toEqual({ priceMin: 0 });
  });

  it('round-trips rating', () => {
    expect(roundTrip({ rating: 4 })).toEqual({ rating: 4 });
  });

  it('round-trips sort', () => {
    expect(roundTrip({ sort: 'price_asc' })).toEqual({ sort: 'price_asc' });
  });

  it('round-trips page > 1', () => {
    expect(roundTrip({ page: 3 })).toEqual({ page: 3 });
  });

  it('drops page when it equals 1 (clean URL)', () => {
    const params = encodeFilters({ page: 1 });
    expect(params.get('page')).toBeNull();
    expect(roundTrip({ page: 1 })).toEqual({});
  });

  it('round-trips a fully-populated filter', () => {
    const filters: TutorFilters = {
      categories: ['law', 'finance'],
      priceMin: 30,
      priceMax: 150,
      rating: 4,
      sort: 'rating_desc',
      page: 2,
    };
    expect(roundTrip(filters)).toEqual(filters);
  });

  it('encodeFilters produces URLSearchParams', () => {
    const params = encodeFilters({ categories: ['math'], sort: 'price_asc' });
    expect(params).toBeInstanceOf(URLSearchParams);
    expect(params.getAll('category')).toEqual(['math']);
    expect(params.get('sort')).toBe('price_asc');
  });
});
