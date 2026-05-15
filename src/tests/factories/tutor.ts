import { randomUUID } from 'node:crypto';

export type TutorStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type TutorFactoryInput = {
  id?: string;
  userId?: string;
  headline?: string;
  hourlyRate?: number;
  status?: TutorStatus;
};

export type TutorFactoryOutput = {
  id: string;
  userId: string;
  headline: string;
  hourlyRate: number;
  status: TutorStatus;
};

let counter = 0;

export function buildTutor(overrides: TutorFactoryInput = {}): TutorFactoryOutput {
  counter += 1;
  return {
    id: overrides.id ?? randomUUID(),
    userId: overrides.userId ?? randomUUID(),
    headline: overrides.headline ?? `Tutor headline ${counter}`,
    hourlyRate: overrides.hourlyRate ?? 50,
    status: overrides.status ?? 'APPROVED',
  };
}
