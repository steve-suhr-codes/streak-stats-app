import { OAuth2Client } from 'google-auth-library';

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type GoogleVerifier = (idToken: string) => Promise<GoogleProfile>;

export function createGoogleVerifier(clientIds: string[]): GoogleVerifier {
  const client = new OAuth2Client();

  return async (idToken) => {
    if (clientIds.length === 0) {
      throw new Error('GOOGLE_CLIENT_IDS is not configured');
    }
    const ticket = await client.verifyIdToken({ idToken, audience: clientIds });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new Error('Google token is missing a verified email');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? null,
      avatarUrl: payload.picture ?? null,
    };
  };
}
