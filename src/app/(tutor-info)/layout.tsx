import { requireTutor } from '@/lib/auth/guards';

export default async function TutorInfoLayout({ children }: { children: React.ReactNode }) {
  await requireTutor();
  return <>{children}</>;
}
