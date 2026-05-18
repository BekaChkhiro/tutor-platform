import { describe, expect, it } from 'vitest';
import { formatGelPrice } from './price';

describe('formatGelPrice (T2.9.3)', () => {
  it('formats 50 as "50 ₾"', () => {
    expect(formatGelPrice(50)).toBe('50 ₾');
  });

  it('formats 1000 as "1,000 ₾"', () => {
    expect(formatGelPrice(1000)).toBe('1,000 ₾');
  });

  it('formats 0 as "უფასო" (free in Georgian)', () => {
    expect(formatGelPrice(0)).toBe('უფასო');
  });

  it('formats large amounts with comma separators', () => {
    expect(formatGelPrice(10000)).toBe('10,000 ₾');
    expect(formatGelPrice(1000000)).toBe('1,000,000 ₾');
  });

  it('formats 1 as "1 ₾"', () => {
    expect(formatGelPrice(1)).toBe('1 ₾');
  });

  it('includes the GEL symbol', () => {
    expect(formatGelPrice(99)).toContain('₾');
  });
});
