import type { AuthResponse, UserDto } from '@streak-stats/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, setAuthToken, setUnauthorizedHandler } from './api';
import { sessionStore } from './session-store';

const TOKEN_KEY = 'streak-stats.session';

type AuthState = {
  /** True until we've checked storage for a saved session. */
  isLoading: boolean;
  user: UserDto | null;
  signInWithGoogle: (idToken: string) => Promise<void>;
  /** Dev-only email sign-in; the API must have ALLOW_DEV_LOGIN=true. */
  signInDev: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await sessionStore.remove(TOKEN_KEY);
  }, []);

  const startSession = useCallback(async ({ token, user }: AuthResponse) => {
    await sessionStore.set(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(user);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());

    (async () => {
      try {
        const token = await sessionStore.get(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          setUser(await api.me());
        }
      } catch {
        await signOut();
      } finally {
        setIsLoading(false);
      }
    })();

    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthState>(
    () => ({
      isLoading,
      user,
      signInWithGoogle: async (idToken) => startSession(await api.signInWithGoogle(idToken)),
      signInDev: async (email) => startSession(await api.signInDev({ email })),
      signOut,
    }),
    [isLoading, user, startSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
