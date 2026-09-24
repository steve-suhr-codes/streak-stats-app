import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError, z } from 'zod';

import type { GoogleVerifier } from './auth/google';
import type { SessionTokens } from './auth/tokens';
import type { Db } from './db';
import type { Env } from './env';
import { HttpError } from './http-error';
import { authRoutes } from './routes/auth';
import { streakRoutes } from './routes/streaks';

export type AppDeps = {
  env: Pick<Env, 'ALLOW_DEV_LOGIN'>;
  db: Db;
  tokens: SessionTokens;
  verifyGoogle: GoogleVerifier;
};

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the authenticate hook on protected routes. */
    userId: string;
  }
}

export function buildApp(deps: AppDeps, opts: { logger?: boolean } = {}): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? false });

  app.register(cors, { origin: true });
  app.decorateRequest('userId', '');

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'invalid_request', message: z.prettifyError(error) });
    }
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.code, message: error.message });
    }
    request.log.error(error);
    return reply.status(500).send({ error: 'internal_error', message: 'Something went wrong' });
  });

  app.get('/health', async () => ({ ok: true }));

  app.register(authRoutes(deps));
  app.register(streakRoutes(deps));

  return app;
}
