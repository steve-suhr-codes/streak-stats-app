import type { FastifyRequest } from 'fastify';

import { unauthorized } from '../http-error';
import type { SessionTokens } from './tokens';

/** onRequest hook: requires a valid `Authorization: Bearer <token>` and sets request.userId. */
export function authenticate(tokens: SessionTokens) {
  return async (request: FastifyRequest) => {
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    const userId = token ? await tokens.verify(token) : null;
    if (!userId) throw unauthorized();
    request.userId = userId;
  };
}
