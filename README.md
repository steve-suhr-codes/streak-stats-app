# Streak Stats

A "Build-A-Streak" tracker: create custom-labeled streaks ("Days without smoking", "Days at the gym") with a start date and watch the day count grow.

## Layout

```
apps/
  mobile/     Expo (SDK 57) + Expo Router app — screens live in src/app/
  api/        Fastify + Prisma 7 + Postgres REST API
packages/
  shared/     Types, zod request schemas, and date math used by both
```

npm workspaces tie them together. `@streak-stats/shared` ships TypeScript source: Metro bundles it for the app, `tsx` runs it in API dev, and `tsup` bundles it into the API build.

## Getting started

Needs Node 22+, and Postgres (via Docker, or any local/hosted instance).

```bash
npm install
cp apps/api/.env.example apps/api/.env     # then set JWT_SECRET
npm run db:up                               # Postgres in Docker (docker-compose.yml)
npm run db:migrate                          # apply Prisma migrations
npm run api                                 # API on http://localhost:3000
npm run android                             # Expo dev server + Android
```

The app reaches the API at `http://10.0.2.2:3000` (the host machine from the Android emulator). On a physical phone, copy `apps/mobile/.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_API_URL` to your computer's LAN IP.

### Signing in during development

Google sign-in isn't wired up in the app yet. With `ALLOW_DEV_LOGIN=true` in the API's `.env`, dev builds show an email sign-in on the login screen that creates/uses a user with that email. Never enable it in production.

## Data model

- **User** — one per Google account (`google_sub`), unique email.
- **Streak** — `label`, owned by a user.
- **StreakLog** — one uninterrupted run: `start_date`, `end_date` (null = active). A partial unique index guarantees exactly one open log per streak.

Current count = `today − start_date` of the open log, where "today" is the user's local date (the client sends it; dates are `YYYY-MM-DD`, never timestamps). Restarting closes the open log and opens a new one on the same day, so history and a future "longest streak" (`max(end_date − start_date)`) need no migration.

## API

All routes except `/health` and `/auth/*` require `Authorization: Bearer <token>`.

| Method | Path | Body |
| --- | --- | --- |
| POST | `/auth/google` | `{ idToken }` — verifies a Google ID token, returns `{ token, user }` |
| POST | `/auth/dev` | `{ email, name? }` — only when `ALLOW_DEV_LOGIN=true` |
| GET | `/me` | |
| GET | `/streaks` | |
| POST | `/streaks` | `{ label, startDate }` |
| GET | `/streaks/:id` | |
| PATCH | `/streaks/:id` | `{ label }` |
| DELETE | `/streaks/:id` | |
| POST | `/streaks/:id/restart` | `{ date }` — the user's local today |

## Scripts (from the repo root)

`npm run typecheck`, `npm test`, `npm run db:studio`.
