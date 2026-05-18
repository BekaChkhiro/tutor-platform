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

import { requestPasswordReset, resetPassword } from './password-reset';
import { truncateAllTables } from '@/tests/helpers/cleanup';
import { getTestDb, stopTestDb } from '@/tests/helpers/testcontainers';

const RESET_PREFIX = 'reset:';

describe('password reset actions', () => {
  beforeAll(async () => {
    ({ prisma: _db } = await getTestDb());
  });

  afterAll(async () => {
    await stopTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(_db);
  });

  // ─── requestPasswordReset ───────────────────────────────────────────────────

  describe('requestPasswordReset', () => {
    it('returns success for an unknown email without creating a token', async () => {
      const result = await requestPasswordReset({ email: 'ghost@test.local' }, 'ip-req-1');
      expect(result.success).toBe(true);

      const tok = await _db.verificationToken.findFirst({
        where: { identifier: `${RESET_PREFIX}ghost@test.local` },
      });
      expect(tok).toBeNull();
    });

    it('creates a reset token for a registered user', async () => {
      await _db.user.create({ data: { email: 'known@test.local', role: 'USER' } });

      const result = await requestPasswordReset({ email: 'known@test.local' }, 'ip-req-2');
      expect(result.success).toBe(true);

      const tok = await _db.verificationToken.findFirst({
        where: { identifier: `${RESET_PREFIX}known@test.local` },
      });
      expect(tok).not.toBeNull();
      expect(tok?.expires.getTime()).toBeGreaterThan(Date.now());
    });

    it('replaces an existing token on a second request', async () => {
      await _db.user.create({ data: { email: 'retried@test.local', role: 'USER' } });

      await requestPasswordReset({ email: 'retried@test.local' }, 'ip-req-3');
      const first = await _db.verificationToken.findFirstOrThrow({
        where: { identifier: `${RESET_PREFIX}retried@test.local` },
      });

      await requestPasswordReset({ email: 'retried@test.local' }, 'ip-req-4');
      const second = await _db.verificationToken.findFirstOrThrow({
        where: { identifier: `${RESET_PREFIX}retried@test.local` },
      });

      expect(first.token).not.toBe(second.token);
    });

    it('returns a validation error for a non-email input', async () => {
      const result = await requestPasswordReset({ email: 'notanemail' }, 'ip-req-5');
      expect(result.success).toBe(false);
    });
  });

  // ─── resetPassword ──────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('updates the password hash and deletes the reset token', async () => {
      await _db.user.create({
        data: { email: 'reset@test.local', role: 'USER', passwordHash: 'oldhash' },
      });
      await _db.verificationToken.create({
        data: {
          identifier: `${RESET_PREFIX}reset@test.local`,
          token: 'validtok1',
          expires: new Date(Date.now() + 60_000),
        },
      });

      const result = await resetPassword({
        token: 'validtok1',
        password: 'NewPass1x',
        confirmPassword: 'NewPass1x',
      });
      expect(result.success).toBe(true);

      const user = await _db.user.findUniqueOrThrow({ where: { email: 'reset@test.local' } });
      expect(user.passwordHash).not.toBe('oldhash');
      expect(user.passwordHash).not.toBeNull();

      const tokAfter = await _db.verificationToken.findFirst({ where: { token: 'validtok1' } });
      expect(tokAfter).toBeNull();
    });

    it('returns an error for an expired token and deletes it', async () => {
      await _db.user.create({
        data: { email: 'expuser@test.local', role: 'USER', passwordHash: 'oldhash' },
      });
      await _db.verificationToken.create({
        data: {
          identifier: `${RESET_PREFIX}expuser@test.local`,
          token: 'expiredtok1',
          expires: new Date(Date.now() - 1000),
        },
      });

      const result = await resetPassword({
        token: 'expiredtok1',
        password: 'NewPass1x',
        confirmPassword: 'NewPass1x',
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/expired/i);

      const tokAfter = await _db.verificationToken.findFirst({ where: { token: 'expiredtok1' } });
      expect(tokAfter).toBeNull();
    });

    it('returns an error for a non-existent token', async () => {
      const result = await resetPassword({
        token: 'ghosttoken',
        password: 'NewPass1x',
        confirmPassword: 'NewPass1x',
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/invalid/i);
    });

    it('returns an error for a token without the reset prefix', async () => {
      await _db.user.create({ data: { email: 'nopfx@test.local', role: 'USER' } });
      await _db.verificationToken.create({
        data: {
          identifier: 'nopfx@test.local',
          token: 'nopfxtok',
          expires: new Date(Date.now() + 60_000),
        },
      });

      const result = await resetPassword({
        token: 'nopfxtok',
        password: 'NewPass1x',
        confirmPassword: 'NewPass1x',
      });
      expect(result.success).toBe(false);
    });

    it('returns a validation error for mismatched passwords', async () => {
      const result = await resetPassword({
        token: 'sometok',
        password: 'NewPass1x',
        confirmPassword: 'DiffPass1x',
      });
      expect(result.success).toBe(false);
    });

    it('returns a validation error for a weak password', async () => {
      const result = await resetPassword({
        token: 'sometok',
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
    });
  });
});
