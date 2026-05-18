import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export default async function TutorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const tutor = await prisma.tutor.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true, status: true },
  });

  if (tutor && !tutor.onboardingComplete && tutor.status !== 'APPROVED') {
    redirect('/tutor/onboarding');
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Tutor dashboard</h1>
      <p className="text-muted-foreground text-sm">Placeholder route.</p>
    </main>
  );
}
