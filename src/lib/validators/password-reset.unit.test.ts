import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, resetPasswordSchema } from './password-reset';

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects a missing email', () => {
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'notanemail' }).success).toBe(false);
  });

  it('rejects an empty string email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const valid = {
    token: 'abc123def456',
    password: 'newPass1',
    confirmPassword: 'newPass1',
  };

  it('accepts valid input', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty token', () => {
    const r = resetPasswordSchema.safeParse({ ...valid, token: '' });
    expect(r.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const r = resetPasswordSchema.safeParse({
      ...valid,
      password: 'abc1',
      confirmPassword: 'abc1',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password without a digit', () => {
    const r = resetPasswordSchema.safeParse({
      ...valid,
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password without a letter', () => {
    const r = resetPasswordSchema.safeParse({
      ...valid,
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(r.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const r = resetPasswordSchema.safeParse({ ...valid, confirmPassword: 'different1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });
});
