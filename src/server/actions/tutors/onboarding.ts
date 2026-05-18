'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/send';
import { TutorSubmittedForReview } from '@/lib/email/templates/TutorSubmittedForReview';
import { step1Schema, step3Schema, step4Schema, step5Schema } from '@/lib/validators/onboarding';
import type { ActionResult } from '@/server/actions/auth/register';

export type WizardData = {
  tutorId: string;
  status: string;
  onboardingStep: number;
  onboardingComplete: boolean;
  headline: string | null;
  bio: string | null;
  photoUrl: string | null;
  introVideoUrl: string | null;
  skills: { name: string }[];
  categoryIds: string[];
  educations: {
    id: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startYear: number | null;
    endYear: number | null;
  }[];
  experiences: {
    id: string;
    company: string;
    role: string;
    startYear: number | null;
    endYear: number | null;
    description: string | null;
  }[];
  certificates: {
    id: string;
    title: string;
    issuer: string | null;
    issuedAt: Date | null;
  }[];
};

async function requireTutor(): Promise<{ userId: string; tutorId: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== 'TUTOR') return null;

  const tutor = await prisma.tutor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!tutor) return null;

  return { userId: session.user.id, tutorId: tutor.id };
}

export async function loadWizardData(): Promise<WizardData | null> {
  const ctx = await requireTutor();
  if (!ctx) return null;

  const tutor = await prisma.tutor.findUnique({
    where: { id: ctx.tutorId },
    include: {
      skills: { select: { name: true } },
      categories: { select: { categoryId: true } },
      educations: {
        select: {
          id: true,
          institution: true,
          degree: true,
          fieldOfStudy: true,
          startYear: true,
          endYear: true,
        },
        orderBy: { startYear: 'desc' },
      },
      experiences: {
        select: {
          id: true,
          company: true,
          role: true,
          startYear: true,
          endYear: true,
          description: true,
        },
        orderBy: { startYear: 'desc' },
      },
      certificates: {
        select: { id: true, title: true, issuer: true, issuedAt: true },
        orderBy: { issuedAt: 'desc' },
      },
    },
  });

  if (!tutor) return null;

  return {
    tutorId: tutor.id,
    status: tutor.status,
    onboardingStep: tutor.onboardingStep,
    onboardingComplete: tutor.onboardingComplete,
    headline: tutor.headline,
    bio: tutor.bio,
    photoUrl: tutor.photoUrl,
    introVideoUrl: tutor.introVideoUrl,
    skills: tutor.skills.map((s) => ({ name: s.name })),
    categoryIds: tutor.categories.map((c) => c.categoryId),
    educations: tutor.educations,
    experiences: tutor.experiences,
    certificates: tutor.certificates,
  };
}

export async function saveStep1(raw: unknown): Promise<ActionResult> {
  const ctx = await requireTutor();
  if (!ctx) return { success: false, error: 'Unauthorized' };

  const parsed = step1Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { headline, bio } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const current = await tx.tutor.findUnique({
      where: { id: ctx.tutorId },
      select: { onboardingStep: true },
    });
    await tx.tutor.update({
      where: { id: ctx.tutorId },
      data: {
        headline,
        bio,
        onboardingStep: Math.max(1, current?.onboardingStep ?? 0),
      },
    });
  });

  return { success: true, data: undefined };
}

export async function saveStep3(raw: unknown): Promise<ActionResult> {
  const ctx = await requireTutor();
  if (!ctx) return { success: false, error: 'Unauthorized' };

  const parsed = step3Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { skills, categoryIds } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const current = await tx.tutor.findUnique({
      where: { id: ctx.tutorId },
      select: { onboardingStep: true },
    });
    await tx.skill.deleteMany({ where: { tutorId: ctx.tutorId } });
    await tx.skill.createMany({
      data: skills.map((s) => ({ tutorId: ctx.tutorId, name: s.name })),
    });
    await tx.tutorCategory.deleteMany({ where: { tutorId: ctx.tutorId } });
    await tx.tutorCategory.createMany({
      data: categoryIds.map((id) => ({ tutorId: ctx.tutorId, categoryId: id })),
    });
    await tx.tutor.update({
      where: { id: ctx.tutorId },
      data: { onboardingStep: Math.max(3, current?.onboardingStep ?? 0) },
    });
  });

  return { success: true, data: undefined };
}

export async function saveStep4(raw: unknown): Promise<ActionResult> {
  const ctx = await requireTutor();
  if (!ctx) return { success: false, error: 'Unauthorized' };

  const parsed = step4Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { educations, experiences } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const current = await tx.tutor.findUnique({
      where: { id: ctx.tutorId },
      select: { onboardingStep: true },
    });
    await tx.education.deleteMany({ where: { tutorId: ctx.tutorId } });
    await tx.education.createMany({
      data: educations.map((e) => ({
        tutorId: ctx.tutorId,
        institution: e.institution,
        degree: e.degree ?? null,
        fieldOfStudy: e.fieldOfStudy ?? null,
        startYear: e.startYear ?? null,
        endYear: e.endYear ?? null,
      })),
    });
    await tx.experience.deleteMany({ where: { tutorId: ctx.tutorId } });
    await tx.experience.createMany({
      data: experiences.map((e) => ({
        tutorId: ctx.tutorId,
        company: e.company,
        role: e.role,
        startYear: e.startYear ?? null,
        endYear: e.endYear ?? null,
        description: e.description ?? null,
      })),
    });
    await tx.tutor.update({
      where: { id: ctx.tutorId },
      data: { onboardingStep: Math.max(4, current?.onboardingStep ?? 0) },
    });
  });

  return { success: true, data: undefined };
}

export async function saveStep5(raw: unknown): Promise<ActionResult> {
  const ctx = await requireTutor();
  if (!ctx) return { success: false, error: 'Unauthorized' };

  const parsed = step5Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { certificates } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const current = await tx.tutor.findUnique({
      where: { id: ctx.tutorId },
      select: { onboardingStep: true },
    });
    await tx.certificate.deleteMany({ where: { tutorId: ctx.tutorId } });
    await tx.certificate.createMany({
      data: certificates.map((c) => ({
        tutorId: ctx.tutorId,
        title: c.title,
        issuer: c.issuer ?? null,
        issuedAt: c.issuedAt ? new Date(c.issuedAt) : null,
      })),
    });
    await tx.tutor.update({
      where: { id: ctx.tutorId },
      data: { onboardingStep: Math.max(5, current?.onboardingStep ?? 0) },
    });
  });

  return { success: true, data: undefined };
}

export async function submitWizard(): Promise<ActionResult> {
  const ctx = await requireTutor();
  if (!ctx) return { success: false, error: 'Unauthorized' };

  const tutor = await prisma.tutor.findUnique({
    where: { id: ctx.tutorId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!tutor) return { success: false, error: 'Tutor not found' };
  if (!tutor.headline) {
    return { success: false, error: 'Complete all required steps before submitting' };
  }

  await prisma.tutor.update({
    where: { id: ctx.tutorId },
    data: { onboardingComplete: true, onboardingStep: 6, status: 'PENDING_REVIEW' },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const tutorName = [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ');
    await sendEmail({
      template: TutorSubmittedForReview,
      to: adminEmail,
      subject: `New tutor application — ${tutorName}`,
      props: {
        tutorName,
        tutorEmail: tutor.user.email ?? '',
        tutorSlug: tutor.slug,
        adminUrl: `${base}/admin/tutors`,
      },
    });
  }

  return { success: true, data: undefined };
}
