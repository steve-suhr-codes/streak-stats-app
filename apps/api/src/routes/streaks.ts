import {
  createStreakSchema,
  restartStreakSchema,
  updateStreakSchema,
  type StreakDto,
} from '@streak-stats/shared';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { authenticate } from '../auth/authenticate';
import type { AppDeps } from '../build-app';
import { fromCalendarDateString, toCalendarDateString, type Db } from '../db';
import type { Streak, StreakLog } from '../generated/prisma/client';
import { HttpError, notFound } from '../http-error';

const idParams = z.object({ id: z.uuid() });

const withOpenLog = {
  logs: { where: { endDate: null }, take: 1 },
} as const;

type StreakWithLogs = Streak & { logs: StreakLog[] };

function toStreakDto(streak: StreakWithLogs): StreakDto {
  const open = streak.logs[0];
  if (!open) throw new Error(`Streak ${streak.id} has no open log`);
  return {
    id: streak.id,
    label: streak.label,
    createdAt: streak.createdAt.toISOString(),
    updatedAt: streak.updatedAt.toISOString(),
    currentLog: {
      id: open.id,
      startDate: toCalendarDateString(open.startDate),
      endDate: null,
    },
  };
}

async function findOwnedStreak(db: Db, userId: string, id: string): Promise<StreakWithLogs> {
  const streak = await db.streak.findFirst({ where: { id, userId }, include: withOpenLog });
  if (!streak) throw notFound('Streak');
  return streak;
}

export function streakRoutes({ db, tokens }: AppDeps): FastifyPluginAsync {
  return async (app) => {
    app.addHook('onRequest', authenticate(tokens));

    app.get('/streaks', async (request) => {
      const streaks = await db.streak.findMany({
        where: { userId: request.userId },
        include: withOpenLog,
        orderBy: { createdAt: 'asc' },
      });
      return streaks.map(toStreakDto);
    });

    app.post('/streaks', async (request, reply) => {
      const { label, startDate } = createStreakSchema.parse(request.body);
      // TODO(monetization): enforce the free-tier limit of 1 streak once entitlements exist.
      const streak = await db.streak.create({
        data: {
          userId: request.userId,
          label,
          logs: { create: { startDate: fromCalendarDateString(startDate) } },
        },
        include: withOpenLog,
      });
      return reply.status(201).send(toStreakDto(streak));
    });

    app.get('/streaks/:id', async (request) => {
      const { id } = idParams.parse(request.params);
      return toStreakDto(await findOwnedStreak(db, request.userId, id));
    });

    app.patch('/streaks/:id', async (request) => {
      const { id } = idParams.parse(request.params);
      const { label } = updateStreakSchema.parse(request.body);
      await findOwnedStreak(db, request.userId, id);
      const streak = await db.streak.update({ where: { id }, data: { label }, include: withOpenLog });
      return toStreakDto(streak);
    });

    app.delete('/streaks/:id', async (request, reply) => {
      const { id } = idParams.parse(request.params);
      await findOwnedStreak(db, request.userId, id);
      await db.streak.delete({ where: { id } });
      return reply.status(204).send();
    });

    /** Close the open log on `date` and open a new one starting the same day. */
    app.post('/streaks/:id/restart', async (request) => {
      const { id } = idParams.parse(request.params);
      const { date } = restartStreakSchema.parse(request.body);
      const streak = await findOwnedStreak(db, request.userId, id);
      const open = streak.logs[0]!;
      const restartDate = fromCalendarDateString(date);

      if (restartDate < open.startDate) {
        throw new HttpError(400, 'invalid_restart_date', 'Restart date is before the streak started');
      }

      const [, updated] = await db.$transaction([
        db.streakLog.update({ where: { id: open.id }, data: { endDate: restartDate } }),
        db.streak.update({
          where: { id },
          data: { logs: { create: { startDate: restartDate } } },
          include: withOpenLog,
        }),
      ]);
      return toStreakDto(updated);
    });
  };
}
