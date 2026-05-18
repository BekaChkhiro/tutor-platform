import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

import { truncateAllTables } from '@/tests/helpers/cleanup';
import { getTestDb, stopTestDb } from '@/tests/helpers/testcontainers';

// Provide a mutable prisma stub so the module is resolvable before the
// testcontainer starts. The real client is injected in beforeAll.
const db = { client: null as unknown as PrismaClient };
vi.mock('@/lib/db/prisma', () => ({
  get prisma() {
    return db.client;
  },
}));

// Mock email layer — templates use JSX which the node environment can't parse.
vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/email/templates/VerifyEmail', () => ({ VerifyEmail: () => null }));
vi.mock('@/lib/email/templates/ResetPassword', () => ({ ResetPassword: () => null }));
vi.mock('@/lib/email/templates/Welcome', () => ({ Welcome: () => null }));

const { registerUser, registerTutor, verifyEmail, completeProfile } = await import('./register');
const { sendEmail } = await import('@/lib/email/send');

const validUser = {
  firstName: 'Ana',
  lastName: 'Beridze',
  email: 'ana@test.local',
  phone: '+995555000001',
  dob: '2000-01-15',
  password: 'pass1234A',
  confirmPassword: 'pass1234A',
};

describe('registerUser', () => {
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

  it('creates a USER and sends a verification email', async () => {
    const result = await registerUser(validUser);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe(validUser.email);

    const user = await db.client.user.findUnique({ where: { email: validUser.email } });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('USER');
    expect(user?.emailVerified).toBeNull();
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it('rejects duplicate email', async () => {
    await registerUser(validUser);
    const second = await registerUser(validUser);
    expect(second.success).toBe(false);
    if (!second.success) expect(second.error).toMatch(/already exists/i);
  });

  it('returns error for invalid input', async () => {
    const result = await registerUser({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('registerTutor', () => {
  beforeAll(async () => {
    ({ prisma: db.client } = await getTestDb());
  });

  beforeEach(async () => {
    await truncateAllTables(db.client);
    vi.clearAllMocks();
  });

  it('creates a TUTOR with PENDING_REVIEW status', async () => {
    const result = await registerTutor({ ...validUser, email: 'tutor@test.local', gender: 'MALE' });
    expect(result.success).toBe(true);

    const user = await db.client.user.findUnique({
      where: { email: 'tutor@test.local' },
      include: { tutor: true },
    });
    expect(user?.role).toBe('TUTOR');
    expect(user?.tutor?.status).toBe('PENDING_REVIEW');
    expect(user?.tutor?.slug).toMatch(/^ana-beridze-/);
  });

  it('rejects duplicate email', async () => {
    await registerTutor({ ...validUser, email: 'tutor2@test.local', gender: 'FEMALE' });
    const second = await registerTutor({
      ...validUser,
      email: 'tutor2@test.local',
      gender: 'FEMALE',
    });
    expect(second.success).toBe(false);
  });
});

describe('verifyEmail', () => {
  beforeAll(async () => {
    ({ prisma: db.client } = await getTestDb());
  });

  beforeEach(async () => {
    await truncateAllTables(db.client);
    vi.clearAllMocks();
  });

  it('marks user emailVerified and deletes token', async () => {
    await registerUser({ ...validUser, email: 'verify@test.local' });

    const record = await db.client.verificationToken.findFirst({
      where: { identifier: 'verify@test.local' },
    });
    expect(record).not.toBeNull();
    if (!record) return;

    const result = await verifyEmail(record.token);
    expect(result.success).toBe(true);

    const user = await db.client.user.findUnique({ where: { email: 'verify@test.local' } });
    expect(user?.emailVerified).not.toBeNull();

    const tokenAfter = await db.client.verificationToken.findUnique({
      where: { token: record.token },
    });
    expect(tokenAfter).toBeNull();
  });

  it('returns error for unknown token', async () => {
    const result = await verifyEmail('nonexistent-token');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/invalid/i);
  });

  it('returns error for expired token', async () => {
    await registerUser({ ...validUser, email: 'expired@test.local' });

    const record = await db.client.verificationToken.findFirst({
      where: { identifier: 'expired@test.local' },
    });
    expect(record).not.toBeNull();
    if (!record) return;

    await db.client.verificationToken.update({
      where: { token: record.token },
      data: { expires: new Date(Date.now() - 1000) },
    });

    const result = await verifyEmail(record.token);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/expired/i);
  });
});

describe('completeProfile', () => {
  beforeAll(async () => {
    ({ prisma: db.client } = await getTestDb());
  });

  beforeEach(async () => {
    await truncateAllTables(db.client);
    vi.clearAllMocks();
  });

  it('updates phone and dob on the user', async () => {
    await registerUser({ ...validUser, email: 'profile@test.local' });
    const user = await db.client.user.findUnique({ where: { email: 'profile@test.local' } });
    expect(user).not.toBeNull();
    if (!user) return;

    const result = await completeProfile(user.id, {
      phone: '+995555999888',
      dob: '1995-06-15',
    });
    expect(result.success).toBe(true);

    const updated = await db.client.user.findUnique({ where: { id: user.id } });
    expect(updated?.phone).toBe('+995555999888');
  });

  it('returns error for invalid input', async () => {
    const result = await completeProfile('user-id', { phone: 'bad', dob: 'not-a-date' });
    expect(result.success).toBe(false);
  });
});
