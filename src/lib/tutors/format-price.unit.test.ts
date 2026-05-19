import { describe, expect, it } from 'vitest';
import { formatGelPrice } from './format-price';

describe('formatGelPrice', () => {
  it('formats 50 as "50 ₾"', () => {
    expect(formatGelPrice(50)).toBe('50 ₾');
  });

  it('formats 1000 as "1,000 ₾" (thousands separator)', () => {
    expect(formatGelPrice(1000)).toBe('1,000 ₾');
  });

  it('formats 0 as "უფასო" (free in Georgian)', () => {
    expect(formatGelPrice(0)).toBe('უფასო');
  });

  it('rounds to the nearest whole number', () => {
    expect(formatGelPrice(49.9)).toBe('50 ₾');
    expect(formatGelPrice(49.4)).toBe('49 ₾');
  });

  it('formats large amounts with commas', () => {
    expect(formatGelPrice(10000)).toBe('10,000 ₾');
    expect(formatGelPrice(1000000)).toBe('1,000,000 ₾');
  });

  it('formats single-digit amounts', () => {
    expect(formatGelPrice(5)).toBe('5 ₾');
  });

  it('formats 100 without thousands separator', () => {
    expect(formatGelPrice(100)).toBe('100 ₾');
  });
});
