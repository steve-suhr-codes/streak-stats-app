import type {
  AuthResponse,
  CreateStreakInput,
  DevSignInInput,
  RestartStreakInput,
  StreakDto,
  UpdateStreakInput,
  UserDto,
} from '@streak-stats/shared';
import { Platform } from 'react-native';

// 10.0.2.2 is the host machine from the Android emulator. On a physical device,
// set EXPO_PUBLIC_API_URL to your computer's LAN IP (see apps/mobile/.env.example).
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Called when the API rejects our token, so the app can sign out. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && authToken) onUnauthorized?.();
    throw new ApiError(res.status, data?.error ?? 'unknown', data?.message ?? res.statusText);
  }
  return data as T;
}

export const api = {
  signInWithGoogle: (idToken: string) => request<AuthResponse>('POST', '/auth/google', { idToken }),
  signInDev: (input: DevSignInInput) => request<AuthResponse>('POST', '/auth/dev', input),
  me: () => request<UserDto>('GET', '/me'),

  listStreaks: () => request<StreakDto[]>('GET', '/streaks'),
  getStreak: (id: string) => request<StreakDto>('GET', `/streaks/${id}`),
  createStreak: (input: CreateStreakInput) => request<StreakDto>('POST', '/streaks', input),
  updateStreak: (id: string, input: UpdateStreakInput) =>
    request<StreakDto>('PATCH', `/streaks/${id}`, input),
  deleteStreak: (id: string) => request<void>('DELETE', `/streaks/${id}`),
  restartStreak: (id: string, input: RestartStreakInput) =>
    request<StreakDto>('POST', `/streaks/${id}/restart`, input),
};
