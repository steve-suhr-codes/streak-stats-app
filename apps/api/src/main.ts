import { createGoogleVerifier } from './auth/google';
import { createSessionTokens } from './auth/tokens';
import { buildApp } from './build-app';
import { createDb } from './db';
import { loadEnv } from './env';

const env = loadEnv();
const db = createDb(env.DATABASE_URL);

const app = buildApp(
  {
    env,
    db,
    tokens: createSessionTokens(env.JWT_SECRET),
    verifyGoogle: createGoogleVerifier(env.GOOGLE_CLIENT_IDS),
  },
  { logger: true },
);

if (env.ALLOW_DEV_LOGIN) {
  app.log.warn('ALLOW_DEV_LOGIN is on: POST /auth/dev signs in anyone by email');
}

const shutdown = async () => {
  await app.close();
  await db.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Not awaited: on Vercel, listen() is intercepted by the platform, and a top-level await on it
// can keep this module from ever finishing loading. Locally it behaves the same either way.
app.listen({ host: env.HOST, port: env.PORT }).catch((err) => {
  app.log.error(err, 'Failed to start server');
  process.exit(1);
});
