import { describe, expect, it } from 'vitest';
import { generateSlug, transliterateGeorgian } from './slug';

describe('transliterateGeorgian', () => {
  it('transliterates common Georgian letters', () => {
    expect(transliterateGeorgian('ნინო')).toBe('nino');
  });

  it('passes ASCII characters through unchanged', () => {
    expect(transliterateGeorgian('hello')).toBe('hello');
  });

  it('handles mixed Georgian and Latin', () => {
    expect(transliterateGeorgian('John მესხი')).toBe('John meskhi');
  });
});

describe('generateSlug', () => {
  it('produces kebab-case from a Latin name', () => {
    expect(generateSlug('Giorgi Meladze')).toBe('giorgi-meladze');
  });

  it('transliterates a Georgian name', () => {
    expect(generateSlug('ნინო ბერიძე')).toBe('nino-beridze');
  });

  it('collapses multiple spaces to a single hyphen', () => {
    expect(generateSlug('ნინო  ბერიძე')).toBe('nino-beridze');
  });

  it('strips leading and trailing hyphens', () => {
    expect(generateSlug(' hello ')).toBe('hello');
  });

  it('lowercases the result', () => {
    expect(generateSlug('HELLO')).toBe('hello');
  });

  it('removes special characters', () => {
    expect(generateSlug('hello, world!')).toBe('hello-world');
  });

  it('handles a fully Georgian name', () => {
    const slug = generateSlug('გიორგი მელაძე');
    expect(slug).toMatch(/^[a-z][a-z-]*[a-z]$/);
    expect(slug).not.toContain(' ');
    expect(slug).not.toMatch(/--/);
  });

  it('returns a non-empty string for any non-empty input', () => {
    expect(generateSlug('ა').length).toBeGreaterThan(0);
  });
});
