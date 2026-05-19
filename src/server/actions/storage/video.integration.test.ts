import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let _db: PrismaClient;

vi.mock('@/lib/db/prisma', () => ({
  get prisma() {
    return _db;
  },
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/storage/r2', () => ({
  presignedPutUrl: vi.fn().mockResolvedValue('https://r2.example.com/presigned-put'),
  objectExists: vi.fn(),
  deleteObjectsByPrefix: vi.fn().mockResolvedValue(undefined),
  introVideoPublicUrl: (userId: string) => `https://cdn.example.com/intro_videos/${userId}/video`,
  introPosterPublicUrl: (userId: string) =>
    `https://cdn.example.com/intro_videos/${userId}/poster.jpg`,
}));

import { auth } from '@/lib/auth/auth';
import { objectExists, presignedPutUrl, deleteObjectsByPrefix } from '@/lib/storage/r2';
import {
  requestVideoUploadUrl,
  requestPosterUploadUrl,
  finalizeIntroVideo,
  deleteIntroVideo,
} from './video';
import { truncateAllTables } from '@/tests/helpers/cleanup';
import { getTestDb, stopTestDb } from '@/tests/helpers/testcontainers';

const mockAuth = vi.mocked(auth);
const mockObjectExists = vi.mocked(objectExists);
const mockPresignedPutUrl = vi.mocked(presignedPutUrl);
const mockDeleteObjectsByPrefix = vi.mocked(deleteObjectsByPrefix);

async function seedTutor(db: PrismaClient) {
  return db.user.create({
    data: {
      email: 'video-test@test.local',
      firstName: 'Nino',
      lastName: 'Kipiani',
      phone: '+995555000099',
      dob: new Date('1992-03-15'),
      emailVerified: new Date(),
      role: 'TUTOR',
      tutor: {
        create: {
          slug: 'nino-kipiani-test',
          status: 'PENDING_REVIEW',
        },
      },
    },
    include: { tutor: true },
  });
}

function mockSession(userId: string) {
  mockAuth.mockResolvedValue({
    user: {
      id: userId,
      role: 'TUTOR',
      tutorStatus: 'PENDING_REVIEW',
      profileComplete: true,
      suspended: false,
      onboardingComplete: false,
      email: 'video-test@test.local',
      name: 'Nino Kipiani',
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

beforeAll(async () => {
  ({ prisma: _db } = await getTestDb());
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await truncateAllTables(_db);
  vi.clearAllMocks();
  mockPresignedPutUrl.mockResolvedValue('https://r2.example.com/presigned-put');
  mockDeleteObjectsByPrefix.mockResolvedValue(undefined);
});

describe('requestVideoUploadUrl', () => {
  it('returns presigned URL for valid content type', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);

    const result = await requestVideoUploadUrl('video/mp4');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uploadUrl).toBe('https://r2.example.com/presigned-put');
      expect(result.data.key).toBe(`intro_videos/${user.id}/video`);
    }
  });

  it('rejects unsupported content types', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);

    const result = await requestVideoUploadUrl('video/avi');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/mp4|webm/i);
  });

  it('rejects unauthenticated requests', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);
    const result = await requestVideoUploadUrl('video/mp4');
    expect(result.success).toBe(false);
  });
});

describe('requestPosterUploadUrl', () => {
  it('returns presigned URL for authenticated tutor', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);

    const result = await requestPosterUploadUrl();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.key).toBe(`intro_videos/${user.id}/poster.jpg`);
    }
  });
});

describe('finalizeIntroVideo', () => {
  it('saves introVideoUrl when video exists in R2', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);
    mockObjectExists.mockImplementation((key: string) => Promise.resolve(key.endsWith('/video')));

    const result = await finalizeIntroVideo();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.introVideoUrl).toContain(user.id);
      expect(result.data.posterUrl).toBeNull();
    }

    const tutor = await _db.tutor.findUnique({ where: { userId: user.id } });
    expect(tutor?.introVideoUrl).toContain(user.id);
  });

  it('includes posterUrl when poster also exists in R2', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);
    mockObjectExists.mockResolvedValue(true);

    const result = await finalizeIntroVideo();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.posterUrl).toContain('poster.jpg');
    }
  });

  it('returns error when video is not in R2', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);
    mockObjectExists.mockResolvedValue(false);

    const result = await finalizeIntroVideo();
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/not found/i);
  });

  it('returns error when tutor profile does not exist', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'no-tutor-id',
        role: 'TUTOR',
        email: 'ghost@test.local',
        name: 'Ghost User',
        tutorStatus: 'PENDING_REVIEW',
        profileComplete: false,
        suspended: false,
        onboardingComplete: false,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockObjectExists.mockResolvedValue(true);

    const result = await finalizeIntroVideo();
    expect(result.success).toBe(false);
  });
});

describe('deleteIntroVideo', () => {
  it('clears introVideoUrl from DB and deletes R2 objects', async () => {
    const user = await seedTutor(_db);
    mockSession(user.id);

    await _db.tutor.update({
      where: { userId: user.id },
      data: { introVideoUrl: `https://cdn.example.com/intro_videos/${user.id}/video` },
    });

    const result = await deleteIntroVideo();
    expect(result.success).toBe(true);

    expect(mockDeleteObjectsByPrefix).toHaveBeenCalledWith(`intro_videos/${user.id}/`);
    const tutor = await _db.tutor.findUnique({ where: { userId: user.id } });
    expect(tutor?.introVideoUrl).toBeNull();
  });
});
