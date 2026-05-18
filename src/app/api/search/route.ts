import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ tutors: [], categories: [] });
  }

  const [tutors, categories] = await Promise.all([
    prisma.tutor.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { headline: { contains: q, mode: 'insensitive' } },
          { user: { firstName: { contains: q, mode: 'insensitive' } } },
          { user: { lastName: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: {
        slug: true,
        headline: true,
        user: { select: { firstName: true, lastName: true } },
      },
      take: 5,
    }),
    prisma.category.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      select: { slug: true, name: true },
      take: 3,
    }),
  ]);

  return NextResponse.json({ tutors, categories });
}
