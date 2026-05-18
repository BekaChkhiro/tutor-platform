import { describe, expect, it } from 'vitest';
import { generateSlug, transliterateGeorgian } from './slug';

describe('generateSlug (T2.9.2)', () => {
  it('converts latin text to kebab-case', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('lowercases the result', () => {
    expect(generateSlug('MATH TUTOR')).toBe('math-tutor');
  });

  it('trims leading and trailing whitespace', () => {
    expect(generateSlug('  physics  ')).toBe('physics');
  });

  it('collapses multiple spaces into a single hyphen', () => {
    expect(generateSlug('law  and  finance')).toBe('law-and-finance');
  });

  it('strips special characters', () => {
    expect(generateSlug('C++ programming!')).toBe('c-programming');
  });

  it('removes leading and trailing hyphens', () => {
    expect(generateSlug(' -hello- ')).toBe('hello');
  });

  it('transliterates Georgian characters', () => {
    expect(generateSlug('მათემატიკა')).toBe('matematika');
  });

  it('transliterates Georgian name to kebab-case slug', () => {
    expect(generateSlug('გიორგი ბერიძე')).toBe('giorgi-beridze');
  });

  it('handles mixed Georgian and Latin', () => {
    const slug = generateSlug('ქართული English');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug).not.toContain(' ');
  });

  it('returns an empty string for an empty input', () => {
    expect(generateSlug('')).toBe('');
  });
});

describe('transliterateGeorgian', () => {
  it('maps each Georgian letter correctly', () => {
    expect(transliterateGeorgian('ა')).toBe('a');
    expect(transliterateGeorgian('ბ')).toBe('b');
    expect(transliterateGeorgian('შ')).toBe('sh');
    expect(transliterateGeorgian('ჩ')).toBe('ch');
    expect(transliterateGeorgian('ხ')).toBe('kh');
  });

  it('passes through non-Georgian characters unchanged', () => {
    expect(transliterateGeorgian('abc123')).toBe('abc123');
  });

  it('handles empty string', () => {
    expect(transliterateGeorgian('')).toBe('');
  });
});
