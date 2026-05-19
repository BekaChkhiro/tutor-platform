import { describe, expect, it } from 'vitest';
import { encodeFilterParams, decodeFilterParams } from './filter-params';

describe('filter URL-state round-trip', () => {
  it('encodes and decodes an empty filter set back to defaults', () => {
    const params = encodeFilterParams({});
    const decoded = decodeFilterParams(params);
    expect(decoded).toEqual({ category: '', sort: 'newest', q: '', page: 1 });
  });

  it('round-trips category', () => {
    const params = encodeFilterParams({ category: 'math' });
    const decoded = decodeFilterParams(params);
    expect(decoded.category).toBe('math');
  });

  it('round-trips sort (non-default)', () => {
    const params = encodeFilterParams({ sort: 'rating' });
    const decoded = decodeFilterParams(params);
    expect(decoded.sort).toBe('rating');
  });

  it('omits sort from URL when it equals the default', () => {
    const params = encodeFilterParams({ sort: 'newest' });
    expect(params.has('sort')).toBe(false);
  });

  it('round-trips page > 1', () => {
    const params = encodeFilterParams({ page: 3 });
    const decoded = decodeFilterParams(params);
    expect(decoded.page).toBe(3);
  });

  it('omits page from URL when page is 1', () => {
    const params = encodeFilterParams({ page: 1 });
    expect(params.has('page')).toBe(false);
  });

  it('round-trips q (search query)', () => {
    const params = encodeFilterParams({ q: 'math teacher' });
    const decoded = decodeFilterParams(params);
    expect(decoded.q).toBe('math teacher');
  });

  it('round-trips all fields together and stays equal', () => {
    const input = { category: 'science', sort: 'price_asc' as const, q: 'bio', page: 2 };
    const params = encodeFilterParams(input);
    const decoded = decodeFilterParams(params);
    expect(decoded).toEqual(input);
  });

  it('decodes missing page as 1', () => {
    const params = new URLSearchParams('category=math');
    expect(decodeFilterParams(params).page).toBe(1);
  });

  it('decodes invalid page as 1 (safe)', () => {
    const params = new URLSearchParams('page=abc');
    expect(decodeFilterParams(params).page).toBe(1);
  });
});
