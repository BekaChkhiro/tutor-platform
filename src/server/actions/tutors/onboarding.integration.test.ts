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

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/lib/auth/auth';
import {
  loadOnboardingData,
  saveStep1,
  saveStep3,
  saveStep4,
  saveStep5,
  submitForReview,
} from './onboarding';
import { sendEmail } from '@/lib/email/send';
import { truncateAllTables } from '@/tests/helpers/cleanup';
import { getTestDb, stopTestDb } from '@/tests/helpers/testcontainers';

const mockAuth = vi.mocked(auth);

async function seedTutor(db: PrismaClient) {
  const user = await db.user.create({
    data: {
      email: 'tutor-wizard@test.local',
      firstName: 'Ana',
      lastName: 'Beridze',
      phone: '+995555000001',
      dob: new Date('1990-01-01'),
      emailVerified: new Date(),
      role: 'TUTOR',
      tutor: {
        create: {
          slug: `ana-beridze-test`,
          status: 'PENDING_REVIEW',
        },
      },
    },
    include: { tutor: true },
  });
  return user;
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
      email: 'tutor-wizard@test.local',
      name: 'Ana Beridze',
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe('tutor onboarding server actions', () => {
  beforeAll(async () => {
    ({ prisma: _db } = await getTestDb());
  });

  afterAll(async () => {
    await stopTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(_db);
    vi.clearAllMocks();
  });

  // ─── loadOnboardingData ──────────────────────────────────────────────────

  describe('loadOnboardingData', () => {
    it('returns tutor with related data', async () => {
      const user = await seedTutor(_db);
      const data = await loadOnboardingData(user.id);
      expect(data).not.toBeNull();
      expect(data?.status).toBe('PENDING_REVIEW');
      expect(data?.onboardingStep).toBe(1);
      expect(data?.onboardingComplete).toBe(false);
    });

    it('returns null for unknown userId', async () => {
      const data = await loadOnboardingData('nonexistent');
      expect(data).toBeNull();
    });
  });

  // ─── saveStep1 ──────────────────────────────────────────────────────────

  describe('saveStep1', () => {
    it('saves headline and bio, advances step to 2', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);

      const result = await saveStep1({
        headline: 'Experienced Math tutor with 8 years of practice',
        bio: 'I have been teaching mathematics and physics for over 8 years. My approach is student-centred and results-driven.',
      });

      expect(result.success).toBe(true);

      const tutor = await _db.tutor.findUniqueOrThrow({ where: { userId: user.id } });
      expect(tutor.headline).toBe('Experienced Math tutor with 8 years of practice');
      expect(tutor.onboardingStep).toBe(2);
    });

    it('does not regress step when re-saving step 1 from a later step', async () => {
      const user = await seedTutor(_db);
      await _db.tutor.update({ where: { userId: user.id }, data: { onboardingStep: 5 } });
      mockSession(user.id);

      await saveStep1({
        headline: 'Updated headline that is long enough here',
        bio: 'Updated bio that is long enough to satisfy the minimum character requirement here.',
      });

      const tutor = await _db.tutor.findUniqueOrThrow({ where: { userId: user.id } });
      expect(tutor.onboardingStep).toBe(5);
    });

    it('rejects input that is too short', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);

      const result = await saveStep1({ headline: 'Short', bio: 'Too short' });
      expect(result.success).toBe(false);
    });

    it('blocks edits when application is under review', async () => {
      const user = await seedTutor(_db);
      await _db.tutor.update({
        where: { userId: user.id },
        data: { onboardingComplete: true },
      });
      mockSession(user.id);

      const result = await saveStep1({
        headline: 'Experienced Math tutor with 8 years of practice',
        bio: 'I have been teaching mathematics and physics for over 8 years. My approach is student-centred.',
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/review/i);
    });
  });

  // ─── saveStep3 ──────────────────────────────────────────────────────────

  describe('saveStep3', () => {
    it('replaces skills and categories', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);

      const cat = await _db.category.create({
        data: { slug: 'maths', name: 'Mathematics' },
      });

      const result = await saveStep3({
        skills: ['Algebra', 'Calculus'],
        categoryIds: [cat.id],
      });

      expect(result.success).toBe(true);

      const tutor = await _db.tutor.findUniqueOrThrow({
        where: { userId: user.id },
        include: { skills: true, categories: true },
      });
      expect(tutor.skills).toHaveLength(2);
      expect(tutor.categories).toHaveLength(1);
      expect(tutor.onboardingStep).toBe(4);
    });

    it('rejects when no skills provided', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);
      const cat = await _db.category.create({ data: { slug: 'cat2', name: 'Cat 2' } });
      const result = await saveStep3({ skills: [], categoryIds: [cat.id] });
      expect(result.success).toBe(false);
    });
  });

  // ─── saveStep4 ──────────────────────────────────────────────────────────

  describe('saveStep4', () => {
    it('saves education and experience records', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);

      const result = await saveStep4({
        educations: [
          {
            institution: 'Tbilisi State University',
            degree: "Bachelor's",
            fieldOfStudy: 'Mathematics',
            startYear: 2010,
            endYear: 2014,
          },
        ],
        experiences: [
          {
            company: 'Private Tutor',
            role: 'Math Tutor',
            startYear: 2014,
            endYear: null,
            description: 'One-on-one sessions',
          },
        ],
      });

      expect(result.success).toBe(true);

      const tutor = await _db.tutor.findUniqueOrThrow({
        where: { userId: user.id },
        include: { educations: true, experiences: true },
      });
      expect(tutor.educations).toHaveLength(1);
      expect(tutor.experiences).toHaveLength(1);
    });
  });

  // ─── saveStep5 ──────────────────────────────────────────────────────────

  describe('saveStep5', () => {
    it('saves certificates', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);

      const result = await saveStep5({
        certificates: [{ title: 'IELTS', issuer: 'British Council', issuedAt: '2020-06-01' }],
      });

      expect(result.success).toBe(true);

      const tutor = await _db.tutor.findUniqueOrThrow({
        where: { userId: user.id },
        include: { certificates: true },
      });
      expect(tutor.certificates).toHaveLength(1);
      const cert = tutor.certificates[0];
      expect(cert?.title).toBe('IELTS');
    });

    it('allows empty certificates array', async () => {
      const user = await seedTutor(_db);
      mockSession(user.id);
      const result = await saveStep5({ certificates: [] });
      expect(result.success).toBe(true);
    });
  });

  // ─── submitForReview ────────────────────────────────────────────────────

  describe('submitForReview', () => {
    it('sets onboardingComplete=true and sends admin email', async () => {
      const user = await seedTutor(_db);
      await _db.tutor.update({
        where: { userId: user.id },
        data: {
          headline: 'Experienced Math tutor with 8 years of practice',
          bio: 'I have been teaching mathematics and physics for over 8 years. My approach is student-centred and results-driven.',
        },
      });
      mockSession(user.id);

      const result = await submitForReview();
      expect(result.success).toBe(true);

      const tutor = await _db.tutor.findUniqueOrThrow({ where: { userId: user.id } });
      expect(tutor.onboardingComplete).toBe(true);

      expect(sendEmail).toHaveBeenCalledOnce();
    });

    it('blocks resubmission when already under review', async () => {
      const user = await seedTutor(_db);
      await _db.tutor.update({ where: { userId: user.id }, data: { onboardingComplete: true } });
      mockSession(user.id);

      const result = await submitForReview();
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toMatch(/review/i);
    });

    it('returns error when called without auth', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockAuth.mockResolvedValue(null as any);
      const result = await submitForReview();
      expect(result.success).toBe(false);
    });
  });
});
