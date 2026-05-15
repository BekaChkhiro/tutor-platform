import { randomUUID } from 'node:crypto';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type BookingFactoryInput = {
  id?: string;
  tutorId?: string;
  studentId?: string;
  startsAt?: Date;
  endsAt?: Date;
  status?: BookingStatus;
};

export type BookingFactoryOutput = {
  id: string;
  tutorId: string;
  studentId: string;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
};

let counter = 0;

export function buildBooking(overrides: BookingFactoryInput = {}): BookingFactoryOutput {
  counter += 1;
  const startsAt = overrides.startsAt ?? new Date(Date.UTC(2026, 0, 1, 10 + counter, 0, 0));
  const endsAt = overrides.endsAt ?? new Date(startsAt.getTime() + 60 * 60 * 1000);
  return {
    id: overrides.id ?? randomUUID(),
    tutorId: overrides.tutorId ?? randomUUID(),
    studentId: overrides.studentId ?? randomUUID(),
    startsAt,
    endsAt,
    status: overrides.status ?? 'CONFIRMED',
  };
}
