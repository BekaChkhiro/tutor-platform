import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

type TestDb = {
  container: StartedPostgreSqlContainer;
  prisma: PrismaClient;
  connectionUri: string;
};

let cached: Promise<TestDb> | undefined;

async function bootstrap(): Promise<TestDb> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const connectionUri = container.getConnectionUri();
  process.env.DATABASE_URL = connectionUri;
  process.env.DIRECT_URL = connectionUri;

  // Push the Prisma schema into the container so models (when added in T1.1+)
  // are available. `prisma db push` errors on an empty schema, so skip it
  // until at least one model exists.
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schema = readFileSync(schemaPath, 'utf8');
  if (/^\s*model\s+\w+/m.test(schema)) {
    execSync('pnpm prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: connectionUri, DIRECT_URL: connectionUri },
      stdio: 'ignore',
    });
  }

  const adapter = new PrismaPg({ connectionString: connectionUri });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  return { container, prisma, connectionUri };
}

export function getTestDb(): Promise<TestDb> {
  cached ??= bootstrap();
  return cached;
}

export async function stopTestDb(): Promise<void> {
  if (!cached) return;
  const { prisma, container } = await cached;
  await prisma.$disconnect();
  await container.stop();
  cached = undefined;
}
