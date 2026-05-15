import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Deterministic seed.
 *
 * Target shape (per PROJECT_PLAN T0.15.7): 1 admin, 2 users, 5 tutors across
 * statuses, 10 consultations, 20 bookings. Models land in T1.1+ — wire up
 * the data creation below as each model is introduced.
 */
async function main(): Promise<void> {
  // No models in the schema yet. The seed is intentionally a no-op so
  // `pnpm db:seed` succeeds against an empty schema and the structure is
  // ready for tasks that introduce models.
  console.warn('[seed] schema has no models yet — nothing to seed');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
