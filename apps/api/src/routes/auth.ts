import {
  devSignInSchema,
  googleSignInSchema,
  type AuthResponse,
  type UserDto,
} from '@streak-stats/shared';
import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '../auth/authenticate';
import type { AppDeps } from '../build-app';
import type { User } from '../generated/prisma/client';
import { HttpError, notFound } from '../http-error';

export function toUserDto(user: User): UserDto {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
}

export function authRoutes({ env, db, tokens, verifyGoogle }: AppDeps): FastifyPluginAsync {
  return async (app) => {
    const respond = async (user: User): Promise<AuthResponse> => ({
      token: await tokens.sign(user.id),
      user: toUserDto(user),
    });

    app.post('/auth/google', async (request) => {
      const { idToken } = googleSignInSchema.parse(request.body);

      let profile;
      try {
        profile = await verifyGoogle(idToken);
      } catch (err) {
        request.log.warn({ err }, 'Google token rejected');
        throw new HttpError(401, 'invalid_google_token', 'Could not verify Google sign-in');
      }

      const profileFields = { email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl };
      const existing =
        (await db.user.findUnique({ where: { googleSub: profile.sub } })) ??
        (await db.user.findUnique({ where: { email: profile.email } }));

      const user = existing
        ? await db.user.update({
            where: { id: existing.id },
            data: { googleSub: profile.sub, ...profileFields },
          })
        : await db.user.create({ data: { googleSub: profile.sub, ...profileFields } });

      return respond(user);
    });

    if (env.ALLOW_DEV_LOGIN) {
      app.post('/auth/dev', async (request) => {
        const { email, name } = devSignInSchema.parse(request.body);
        const user = await db.user.upsert({
          where: { email },
          create: { email, name: name ?? null },
          update: {},
        });
        return respond(user);
      });
    }

    app.get('/me', { onRequest: authenticate(tokens) }, async (request) => {
      const user = await db.user.findUnique({ where: { id: request.userId } });
      if (!user) throw notFound('User');
      return toUserDto(user);
    });
  };
}
