import { spawnSync } from 'node:child_process';

/**
 * Invoke `pnpm db:seed` before an E2E run.
 *
 * Wire this into Playwright via `globalSetup` once the seed script actually
 * provisions test users (T0.13 expands the seed). For now it's a thin wrapper
 * so individual specs can opt in:
 *   import { seedDatabase } from './helpers/db-seed';
 *   test.beforeAll(async () => { await seedDatabase(); });
 */
export async function seedDatabase(): Promise<void> {
  if (process.env.PLAYWRIGHT_SKIP_SEED === '1') return;

  const result = spawnSync('pnpm', ['db:seed'], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`db:seed failed with exit code ${result.status}`);
  }
}
