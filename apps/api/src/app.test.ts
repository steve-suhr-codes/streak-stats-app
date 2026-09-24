import { describe, expect, it } from 'vitest';

import { buildApp } from './app';
import { createSessionTokens } from './auth/tokens';
import type { Db } from './db';

// These tests never reach the database; routes that would are covered once we add a test DB.
function makeApp(allowDevLogin = false) {
  return buildApp({
    env: { ALLOW_DEV_LOGIN: allowDevLogin },
    db: {} as Db,
    tokens: createSessionTokens('x'.repeat(32)),
    verifyGoogle: async () => {
      throw new Error('not used');
    },
  });
}

describe('app', () => {
  it('responds to /health', async () => {
    const res = await makeApp().inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });

  it('rejects unauthenticated streak requests', async () => {
    const res = await makeApp().inject({ method: 'GET', url: '/streaks' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = await createSessionTokens('y'.repeat(32)).sign('some-user');
    const res = await makeApp().inject({
      method: 'GET',
      url: '/streaks',
      headers: { authorization: `Bearer ${forged}` },
    });
    expect(res.statusCode).toBe(401);
  });

  it('does not expose dev login unless enabled', async () => {
    const res = await makeApp(false).inject({
      method: 'POST',
      url: '/auth/dev',
      payload: { email: 'a@example.com' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('validates the Google sign-in body', async () => {
    const res = await makeApp().inject({ method: 'POST', url: '/auth/google', payload: {} });
    expect(res.statusCode).toBe(400);
  });
});
