import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Not env('DATABASE_URL'): that throws when unset, which breaks `prisma generate` on fresh installs/CI.
    url: process.env.DATABASE_URL ?? '',
  },
});
