import { randomUUID } from 'node:crypto';

export type ConsultationStatus = 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export type ConsultationFactoryInput = {
  id?: string;
  tutorId?: string;
  studentId?: string;
  scheduledAt?: Date;
  status?: ConsultationStatus;
};

export type ConsultationFactoryOutput = {
  id: string;
  tutorId: string;
  studentId: string;
  scheduledAt: Date;
  status: ConsultationStatus;
};

let counter = 0;

export function buildConsultation(
  overrides: ConsultationFactoryInput = {},
): ConsultationFactoryOutput {
  counter += 1;
  const scheduledAt = overrides.scheduledAt ?? new Date(Date.UTC(2026, 0, 2, 12 + counter, 0, 0));
  return {
    id: overrides.id ?? randomUUID(),
    tutorId: overrides.tutorId ?? randomUUID(),
    studentId: overrides.studentId ?? randomUUID(),
    scheduledAt,
    status: overrides.status ?? 'SCHEDULED',
  };
}
