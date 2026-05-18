import { requireTutor } from '@/lib/auth/guards';

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  await requireTutor();
  return <>{children}</>;
}
