import type { PrismaClient } from '@prisma/client';

/**
 * Truncate every non-system table in the public schema. Use in `beforeEach`
 * to give each test a clean DB while keeping the testcontainer alive across
 * the suite.
 */
export async function truncateAllTables(prisma: PrismaClient): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%'
  `;

  if (rows.length === 0) return;

  const tables = rows.map((r) => `"public"."${r.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}
