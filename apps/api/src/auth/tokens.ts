import { jwtVerify, SignJWT } from 'jose';

const ISSUER = 'streak-stats-api';
const TTL = '30d';

export type SessionTokens = {
  sign(userId: string): Promise<string>;
  /** Returns the user id, or null if the token is invalid or expired. */
  verify(token: string): Promise<string | null>;
};

export function createSessionTokens(secret: string): SessionTokens {
  const key = new TextEncoder().encode(secret);

  return {
    sign(userId) {
      return new SignJWT()
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userId)
        .setIssuer(ISSUER)
        .setIssuedAt()
        .setExpirationTime(TTL)
        .sign(key);
    },
    async verify(token) {
      try {
        const { payload } = await jwtVerify(token, key, { issuer: ISSUER, algorithms: ['HS256'] });
        return payload.sub ?? null;
      } catch {
        return null;
      }
    },
  };
}
