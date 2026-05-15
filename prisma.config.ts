import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Match Next.js precedence: .env.local > .env. Prisma CLI does not read
// .env.local on its own, so load it explicitly here.
loadEnv({ path: path.join(process.cwd(), '.env.local') });
loadEnv({ path: path.join(process.cwd(), '.env') });

const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: directUrl,
  },
});
