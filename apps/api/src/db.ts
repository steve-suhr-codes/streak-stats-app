import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client';

export type Db = PrismaClient;

export function createDb(databaseUrl: string): Db {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

/** Prisma returns @db.Date columns as UTC-midnight Dates; convert to "YYYY-MM-DD". */
export function toCalendarDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Inverse of toCalendarDateString. */
export function fromCalendarDateString(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}
