import { describe, expect, it } from 'vitest';
import { userRegistrationSchema, tutorRegistrationSchema, maskGeorgianPhone } from './registration';

const validUser = {
  firstName: 'Giorgi',
  lastName: 'Beridze',
  email: 'giorgi@example.com',
  phone: '+995555123456',
  dob: '2000-01-01',
  password: 'secret1A',
  confirmPassword: 'secret1A',
};

describe('userRegistrationSchema', () => {
  it('accepts valid input', () => {
    expect(userRegistrationSchema.safeParse(validUser).success).toBe(true);
  });

  it('rejects missing firstName', () => {
    const r = userRegistrationSchema.safeParse({ ...validUser, firstName: '' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = userRegistrationSchema.safeParse({ ...validUser, email: 'notanemail' });
    expect(r.success).toBe(false);
  });

  it('rejects phone without +995 prefix', () => {
    const r = userRegistrationSchema.safeParse({ ...validUser, phone: '0555123456' });
    expect(r.success).toBe(false);
  });

  it('accepts phone with spaces (strips them)', () => {
    const r = userRegistrationSchema.safeParse({ ...validUser, phone: '+995 555 123 456' });
    expect(r.success).toBe(true);
  });

  it('rejects under-18 DOB', () => {
    const underAge = new Date();
    underAge.setFullYear(underAge.getFullYear() - 17);
    const dob = underAge.toISOString().split('T')[0];
    const r = userRegistrationSchema.safeParse({ ...validUser, dob });
    expect(r.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const r = userRegistrationSchema.safeParse({
      ...validUser,
      password: 'abc1',
      confirmPassword: 'abc1',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password with no digit', () => {
    const r = userRegistrationSchema.safeParse({
      ...validUser,
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password with no letter', () => {
    const r = userRegistrationSchema.safeParse({
      ...validUser,
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(r.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const r = userRegistrationSchema.safeParse({ ...validUser, confirmPassword: 'different1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });
});

describe('tutorRegistrationSchema', () => {
  const validTutor = { ...validUser, gender: 'MALE' as const };

  it('accepts valid input', () => {
    expect(tutorRegistrationSchema.safeParse(validTutor).success).toBe(true);
  });

  it('requires gender field', () => {
    const { gender: _g, ...noGender } = validTutor;
    const r = tutorRegistrationSchema.safeParse(noGender);
    expect(r.success).toBe(false);
  });

  it('rejects invalid gender value', () => {
    const r = tutorRegistrationSchema.safeParse({ ...validTutor, gender: 'UNKNOWN' });
    expect(r.success).toBe(false);
  });
});

describe('maskGeorgianPhone', () => {
  it('formats a full Georgian number', () => {
    expect(maskGeorgianPhone('+995555123456')).toBe('+995 555 123 456');
  });

  it('handles empty string', () => {
    expect(maskGeorgianPhone('')).toBe('+995 ');
  });

  it('handles partial input', () => {
    expect(maskGeorgianPhone('+99555')).toBe('+995 55');
  });
});
