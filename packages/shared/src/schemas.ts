import { z } from 'zod';

import { isCalendarDate } from './dates';

export const calendarDateSchema = z
  .string()
  .refine(isCalendarDate, { message: 'Expected a date in YYYY-MM-DD format' });

export const streakLabelSchema = z.string().trim().min(1).max(80);

// ---- Requests ----

export const createStreakSchema = z.object({
  label: streakLabelSchema,
  startDate: calendarDateSchema,
});
export type CreateStreakInput = z.infer<typeof createStreakSchema>;

export const updateStreakSchema = z.object({
  label: streakLabelSchema,
});
export type UpdateStreakInput = z.infer<typeof updateStreakSchema>;

export const restartStreakSchema = z.object({
  /** The user's local "today" — becomes the old log's end date and the new log's start date. */
  date: calendarDateSchema,
});
export type RestartStreakInput = z.infer<typeof restartStreakSchema>;

export const googleSignInSchema = z.object({
  idToken: z.string().min(1),
});
export type GoogleSignInInput = z.infer<typeof googleSignInSchema>;

/** Local development only — the API rejects this unless ALLOW_DEV_LOGIN=true. */
export const devSignInSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).optional(),
});
export type DevSignInInput = z.infer<typeof devSignInSchema>;

// ---- Responses ----

export type StreakLogDto = {
  id: string;
  startDate: string;
  endDate: string | null;
};

export type StreakDto = {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  /** The open log (end_date null). Every streak always has exactly one. */
  currentLog: StreakLogDto;
};

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export type AuthResponse = {
  token: string;
  user: UserDto;
};
