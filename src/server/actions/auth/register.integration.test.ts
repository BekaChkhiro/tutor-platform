import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let _db: PrismaClient;

vi.mock('@/lib/db/prisma', () => ({
  get prisma() {
    return _db;
  },
}));

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

import { completeProfile, registerTutor, registerUser, verifyEmail } from './register';
import { truncateAllTables } from '@/tests/helpers/cleanup';
import { getTestDb, stopTestDb } from '@/tests/helpers/testcontainers';

const BASE_USER = {
  firstName: 'Ana',
  lastName: 'Beridze',
  email: 'ana@test.local',
  phone: '+995555000001',
  dob: '1990-06-15',
  password: 'Secret1pass',
  confirmPassword: 'Secret1pass',
};

describe('register + verifyEmail + completeProfile', () => {
  beforeAll(async () => {
    ({ prisma: _db } = await getTestDb());
  });

  afterAll(async () => {
    await stopTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(_db);
  });

  // ─── registerUser ───────────────────────────────────────────────────────────

  describe('registerUser', () => {
    it('creates a USER row and returns the email', async () => {
      const result = await registerUser(BASE_USER);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.email).toBe(BASE_USER.email);

      const user = await _db.user.findUniqueOrThrow({ where: { email: BASE_USER.email } });
      expect(user.role).toBe('USER');
    });

    it('creates a verification token for the new user', async () => {
      await registerUser(BASE_USER);

      const tok = await _db.verificationToken.findFirst({
        where: { identifier: BASE_USER.email },
      });
      expect(tok).not.toBeNull();
    });

    it('rejects a duplicate email', async () => {
      await registerUser(BASE_USER);
      const result = await registerUser(BASE_USER);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toMatch(/already exists/i);
    });

    it('returns a validation error for invalid input', async () => {
      const result = await registerUser({ ...BASE_USER, email: 'notanemail' });
      expect(result.success).toBe(false);
    });
  });

  // ─── registerTutor ───────────────────────────────────────────────────────────

  describe('registerTutor', () => {
    const BASE_TUTOR = { ...BASE_USER, email: 'tutor@test.local', gender: 'MALE' as const };

    it('creates a TUTOR row with a linked Tutor profile', async () => {
      const result = await registerTutor(BASE_TUTOR);
      expect(result.success).toBe(true);

      const user = await _db.user.findUnique({ where: { email: BASE_TUTOR.email } });
      expect(user?.role).toBe('TUTOR');

      const profile = await _db.tutor.findUniqueOrThrow({ where: { userId: user?.id ?? '' } });
      expect(profile.status).toBe('PENDING_REVIEW');
    });

    it('rejects a duplicate email', async () => {
      await registerTutor(BASE_TUTOR);
      const result = await registerTutor(BASE_TUTOR);
      expect(result.success).toBe(false);
    });

    it('rejects missing gender', async () => {
      const { gender: _g, ...noGender } = BASE_TUTOR;
      const result = await registerTutor(noGender);
      expect(result.success).toBe(false);
    });
  });

  // ─── verifyEmail ────────────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('marks the user emailVerified and removes the token', async () => {
      await registerUser(BASE_USER);
      const tok = await _db.verificationToken.findFirstOrThrow({
        where: { identifier: BASE_USER.email },
      });

      const result = await verifyEmail(tok.token);
      expect(result.success).toBe(true);

      const user = await _db.user.findUniqueOrThrow({ where: { email: BASE_USER.email } });
      expect(user.emailVerified).not.toBeNull();

      const tokAfter = await _db.verificationToken.findFirst({ where: { token: tok.token } });
      expect(tokAfter).toBeNull();
    });

    it('returns an error for an unknown token', async () => {
      const result = await verifyEmail('doesnotexist');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });

    it('returns an error and deletes an expired token', async () => {
      await _db.user.create({ data: { email: 'exp@test.local', role: 'USER' } });
      await _db.verificationToken.create({
        data: {
          identifier: 'exp@test.local',
          token: 'expiredtok',
          expires: new Date(Date.now() - 1000),
        },
      });

      const result = await verifyEmail('expiredtok');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/expired/i);

      const tokAfter = await _db.verificationToken.findFirst({ where: { token: 'expiredtok' } });
      expect(tokAfter).toBeNull();
    });
  });

  // ─── completeProfile ────────────────────────────────────────────────────────

  describe('completeProfile', () => {
    it('updates phone and dob on an existing user', async () => {
      const { data } = (await registerUser(BASE_USER)) as {
        success: true;
        data: { email: string };
      };
      const user = await _db.user.findUniqueOrThrow({ where: { email: data.email } });

      const result = await completeProfile(user.id, {
        phone: '+995555999888',
        dob: '1992-03-20',
      });
      expect(result.success).toBe(true);

      const updated = await _db.user.findUniqueOrThrow({ where: { id: user.id } });
      expect(updated.phone).toBe('+995555999888');
    });

    it('also updates tutor gender when provided', async () => {
      const BASE_TUTOR = { ...BASE_USER, email: 'tutor2@test.local', gender: 'MALE' as const };
      await registerTutor(BASE_TUTOR);
      const user = await _db.user.findUniqueOrThrow({ where: { email: BASE_TUTOR.email } });

      const result = await completeProfile(user.id, {
        phone: '+995555000002',
        dob: '1985-01-01',
        gender: 'FEMALE',
      });
      expect(result.success).toBe(true);

      const profile = await _db.tutor.findUniqueOrThrow({ where: { userId: user.id } });
      expect(profile.gender).toBe('FEMALE');
    });

    it('returns a validation error for invalid phone', async () => {
      await registerUser(BASE_USER);
      const user = await _db.user.findUniqueOrThrow({ where: { email: BASE_USER.email } });

      const result = await completeProfile(user.id, { phone: '0555', dob: '1990-01-01' });
      expect(result.success).toBe(false);
    });
  });
});
