import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema, resetPasswordSchema } from './password-reset';

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects a missing email field', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a non-email string', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'notanemail' }).success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });

  it('exposes a meaningful error message on failure', () => {
    const r = forgotPasswordSchema.safeParse({ email: 'bad' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBeTruthy();
    }
  });
});

describe('resetPasswordSchema', () => {
  const valid = { token: 'abc123', password: 'Password1', confirmPassword: 'Password1' };

  it('accepts valid input', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty token', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, token: '' }).success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    expect(
      resetPasswordSchema.safeParse({ ...valid, password: 'Sh0rt', confirmPassword: 'Sh0rt' })
        .success,
    ).toBe(false);
  });

  it('rejects password with no digit', () => {
    expect(
      resetPasswordSchema.safeParse({ ...valid, password: 'NoDigits', confirmPassword: 'NoDigits' })
        .success,
    ).toBe(false);
  });

  it('rejects password with no letter', () => {
    expect(
      resetPasswordSchema.safeParse({ ...valid, password: '12345678', confirmPassword: '12345678' })
        .success,
    ).toBe(false);
  });

  it('rejects mismatched confirmPassword', () => {
    const r = resetPasswordSchema.safeParse({ ...valid, confirmPassword: 'Different1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('rejects missing token field', () => {
    const { token: _t, ...noToken } = valid;
    expect(resetPasswordSchema.safeParse(noToken).success).toBe(false);
  });
});
