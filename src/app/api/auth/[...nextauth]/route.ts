import { NextResponse } from 'next/server';

async function handler() {
  return NextResponse.json({ ok: true, auth: 'placeholder' });
}

export { handler as GET, handler as POST };
