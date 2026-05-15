import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';

import { truncateAllTables } from './helpers/cleanup';
import { getTestDb, stopTestDb } from './helpers/testcontainers';

describe('smoke / integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    ({ prisma } = await getTestDb());
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS smoke_user (
        id    SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE
      )
    `);
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
  });

  afterAll(async () => {
    await stopTestDb();
  });

  it('inserts a row and reads it back', async () => {
    await prisma.$executeRawUnsafe(`INSERT INTO smoke_user (email) VALUES ('alice@test.local')`);
    const rows = await prisma.$queryRawUnsafe<Array<{ email: string }>>(
      `SELECT email FROM smoke_user ORDER BY id`,
    );
    expect(rows).toEqual([{ email: 'alice@test.local' }]);
  });
});
