import { describe, expect, it } from 'vitest';
import { step1Schema, step3Schema, step4Schema, step5Schema } from './onboarding';

describe('step1Schema', () => {
  it('accepts valid headline and bio', () => {
    const r = step1Schema.safeParse({
      headline: 'Certified English teacher with 8 years of experience',
      bio: 'I have been teaching English for 8 years and specialize in business English and IELTS preparation.',
    });
    expect(r.success).toBe(true);
  });

  it('rejects headline shorter than 10 chars', () => {
    const r = step1Schema.safeParse({ headline: 'Short', bio: 'A'.repeat(50) });
    expect(r.success).toBe(false);
  });

  it('rejects bio shorter than 50 chars', () => {
    const r = step1Schema.safeParse({ headline: 'Valid headline here', bio: 'Too short' });
    expect(r.success).toBe(false);
  });

  it('rejects headline longer than 120 chars', () => {
    const r = step1Schema.safeParse({ headline: 'A'.repeat(121), bio: 'A'.repeat(50) });
    expect(r.success).toBe(false);
  });
});

describe('step3Schema', () => {
  it('accepts valid skills and categories', () => {
    const r = step3Schema.safeParse({
      skills: [{ name: 'English grammar' }, { name: 'IELTS' }],
      categoryIds: ['cat-1'],
    });
    expect(r.success).toBe(true);
  });

  it('rejects empty skills array', () => {
    const r = step3Schema.safeParse({ skills: [], categoryIds: ['cat-1'] });
    expect(r.success).toBe(false);
  });

  it('rejects empty categoryIds', () => {
    const r = step3Schema.safeParse({ skills: [{ name: 'Grammar' }], categoryIds: [] });
    expect(r.success).toBe(false);
  });

  it('rejects skill with empty name', () => {
    const r = step3Schema.safeParse({ skills: [{ name: '' }], categoryIds: ['cat-1'] });
    expect(r.success).toBe(false);
  });
});

describe('step4Schema', () => {
  it('accepts empty educations and experiences', () => {
    const r = step4Schema.safeParse({ educations: [], experiences: [] });
    expect(r.success).toBe(true);
  });

  it('accepts valid education entry', () => {
    const r = step4Schema.safeParse({
      educations: [
        {
          institution: 'Tbilisi State University',
          degree: 'BA',
          fieldOfStudy: 'English',
          startYear: 2016,
          endYear: 2020,
        },
      ],
      experiences: [],
    });
    expect(r.success).toBe(true);
  });

  it('rejects education with missing institution', () => {
    const r = step4Schema.safeParse({
      educations: [{ institution: '' }],
      experiences: [],
    });
    expect(r.success).toBe(false);
  });

  it('accepts valid experience entry', () => {
    const r = step4Schema.safeParse({
      educations: [],
      experiences: [{ company: 'ABC School', role: 'Teacher', startYear: 2020, endYear: null }],
    });
    expect(r.success).toBe(true);
  });
});

describe('step5Schema', () => {
  it('accepts empty certificates', () => {
    const r = step5Schema.safeParse({ certificates: [] });
    expect(r.success).toBe(true);
  });

  it('accepts valid certificate', () => {
    const r = step5Schema.safeParse({
      certificates: [{ title: 'CELTA', issuer: 'Cambridge', issuedAt: '2021-06-01' }],
    });
    expect(r.success).toBe(true);
  });

  it('rejects certificate with empty title', () => {
    const r = step5Schema.safeParse({ certificates: [{ title: '' }] });
    expect(r.success).toBe(false);
  });

  it('rejects invalid issuedAt date', () => {
    const r = step5Schema.safeParse({
      certificates: [{ title: 'CELTA', issuedAt: 'not-a-date' }],
    });
    expect(r.success).toBe(false);
  });
});
