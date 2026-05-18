import type { Metadata } from 'next';
import { RegisterTutorForm } from '@/components/auth/register-tutor-form';

export const metadata: Metadata = {
  title: 'Apply as a tutor — Tutor',
};

export default function RegisterTutorPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <RegisterTutorForm />
    </main>
  );
}
