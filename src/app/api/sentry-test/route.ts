import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

class SentryTestError extends Error {
  constructor() {
    super('Sentry test error — server route /api/sentry-test');
    this.name = 'SentryTestError';
  }
}

export function GET(): NextResponse {
  throw new SentryTestError();
}
