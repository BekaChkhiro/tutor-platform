import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { truncateAllTables } from '@/tests/helpers/cleanup';
import { getTestDb, stopTestDb } from '@/tests/helpers/testcontainers';

const db = { client: null as unknown as PrismaClient };
vi.mock('@/lib/db/prisma', () => ({
  get prisma() {
    return db.client;
  },
}));

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/email/templates/VerifyEmail', () => ({ VerifyEmail: () => null }));
vi.mock('@/lib/email/templates/ResetPassword', () => ({ ResetPassword: () => null }));
vi.mock('@/lib/email/templates/Welcome', () => ({ Welcome: () => null }));

const { registerUser } = await import('./register');
const { requestPasswordReset, resetPassword } = await import('./password-reset');
const { sendEmail } = await import('@/lib/email/send');

const baseUser = {
  firstName: 'Nino',
  lastName: 'Kvaratskhelia',
  email: 'nino@test.local',
  phone: '+995555000002',
  dob: '1998-03-20',
  password: 'oldPass1A',
  confirmPassword: 'oldPass1A',
};

describe('requestPasswordReset', () => {
  beforeAll(async () => {
    ({ prisma: db.client } = await getTestDb());
  });

  beforeEach(async () => {
    await truncateAllTables(db.client);
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await stopTestDb();
  });

  it('creates a reset token and sends email for existing user', async () => {
    await registerUser(baseUser);
    vi.clearAllMocks();

    const result = await requestPasswordReset({ email: baseUser.email });
    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledOnce();

    const token = await db.client.verificationToken.findFirst({
      where: { identifier: `reset:${baseUser.email}` },
    });
    expect(token).not.toBeNull();
    expect(token?.expires.getTime()).toBeGreaterThan(Date.now());
  });

  it('returns success even for unknown email (no enumeration)', async () => {
    const result = await requestPasswordReset({ email: 'nobody@test.local' });
    expect(result.success).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns error for invalid email input', async () => {
    const result = await requestPasswordReset({ email: 'notanemail' });
    expect(result.success).toBe(false);
  });

  it('replaces existing reset token on second request', async () => {
    await registerUser({ ...baseUser, email: 'replace@test.local' });

    await requestPasswordReset({ email: 'replace@test.local' });
    const first = await db.client.verificationToken.findFirst({
      where: { identifier: 'reset:replace@test.local' },
    });

    await requestPasswordReset({ email: 'replace@test.local' });
    const second = await db.client.verificationToken.findFirst({
      where: { identifier: 'reset:replace@test.local' },
    });

    expect(second?.token).not.toBe(first?.token);

    const count = await db.client.verificationToken.count({
      where: { identifier: 'reset:replace@test.local' },
    });
    expect(count).toBe(1);
  });
});

describe('resetPassword', () => {
  beforeAll(async () => {
    ({ prisma: db.client } = await getTestDb());
  });

  beforeEach(async () => {
    await truncateAllTables(db.client);
    vi.clearAllMocks();
  });

  it('updates the password hash and deletes the reset token', async () => {
    await registerUser({ ...baseUser, email: 'reset@test.local' });
    await requestPasswordReset({ email: 'reset@test.local' });

    const record = await db.client.verificationToken.findFirst({
      where: { identifier: 'reset:reset@test.local' },
    });
    expect(record).not.toBeNull();
    if (!record) return;

    const result = await resetPassword({
      token: record.token,
      password: 'newPass99A',
      confirmPassword: 'newPass99A',
    });
    expect(result.success).toBe(true);

    const user = await db.client.user.findUnique({ where: { email: 'reset@test.local' } });
    expect(user?.passwordHash).toBeTruthy();
    const matches = await bcrypt.compare('newPass99A', user?.passwordHash ?? '');
    expect(matches).toBe(true);

    const tokenAfter = await db.client.verificationToken.findUnique({
      where: { token: record.token },
    });
    expect(tokenAfter).toBeNull();
  });

  it('returns error for unknown token', async () => {
    const result = await resetPassword({
      token: 'bogus-token',
      password: 'newPass99A',
      confirmPassword: 'newPass99A',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/invalid/i);
  });

  it('returns error for expired token', async () => {
    await registerUser({ ...baseUser, email: 'exptoken@test.local' });
    await requestPasswordReset({ email: 'exptoken@test.local' });

    const record = await db.client.verificationToken.findFirst({
      where: { identifier: 'reset:exptoken@test.local' },
    });
    expect(record).not.toBeNull();
    if (!record) return;

    await db.client.verificationToken.update({
      where: { token: record.token },
      data: { expires: new Date(Date.now() - 1000) },
    });

    const result = await resetPassword({
      token: record.token,
      password: 'newPass99A',
      confirmPassword: 'newPass99A',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/expired/i);
  });

  it('rejects a verification token (missing reset: prefix)', async () => {
    await registerUser({ ...baseUser, email: 'wrongtoken@test.local' });

    const verifyToken = await db.client.verificationToken.findFirst({
      where: { identifier: 'wrongtoken@test.local' },
    });
    expect(verifyToken).not.toBeNull();
    if (!verifyToken) return;

    const result = await resetPassword({
      token: verifyToken.token,
      password: 'newPass99A',
      confirmPassword: 'newPass99A',
    });
    expect(result.success).toBe(false);
  });

  it('returns error for invalid schema input', async () => {
    const result = await resetPassword({ token: '', password: 'x', confirmPassword: 'x' });
    expect(result.success).toBe(false);
  });
});
