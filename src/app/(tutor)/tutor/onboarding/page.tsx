import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { loadWizardData } from '@/server/actions/tutors/onboarding';
import { OnboardingWizard } from '@/components/tutor/wizard/onboarding-wizard';

export const metadata: Metadata = {
  title: 'Complete your profile — Tutor',
};

export default async function TutorOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'TUTOR') redirect('/dashboard');

  const wizardData = await loadWizardData();
  if (!wizardData) redirect('/dashboard');

  if (wizardData.status === 'APPROVED') {
    redirect('/tutor/dashboard');
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <main className="bg-background min-h-svh">
      <OnboardingWizard initialData={wizardData} categories={categories} />
    </main>
  );
}
