import { randomUUID } from 'node:crypto';

export type UserFactoryInput = {
  id?: string;
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'TUTOR' | 'STUDENT';
};

export type UserFactoryOutput = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TUTOR' | 'STUDENT';
};

let counter = 0;

export function buildUser(overrides: UserFactoryInput = {}): UserFactoryOutput {
  counter += 1;
  return {
    id: overrides.id ?? randomUUID(),
    email: overrides.email ?? `user-${counter}@test.local`,
    name: overrides.name ?? `Test User ${counter}`,
    role: overrides.role ?? 'STUDENT',
  };
}
