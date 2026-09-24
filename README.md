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

Needs Node 22+, a Postgres database ([Neon](https://neon.tech)), and Android Studio with an emulator. On Windows, also see [Building on Windows](#building-on-windows).

```bash
npm install
cp apps/api/.env.example apps/api/.env         # set DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_IDS
cp apps/mobile/.env.example apps/mobile/.env   # set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
npm run db:migrate                             # apply Prisma migrations to the database
```

The app uses native modules (Google sign-in), so it runs as a **development build**, not in Expo Go. Build and install it once, with the emulator running:

```bash
npm run android:build     # compiles and installs the app; again only when native packages change
```

Day to day, in two terminals:

```bash
npm run api               # API on http://localhost:3000
npm run android           # Expo dev server; opens the installed app
```

The app reaches the API at `http://10.0.2.2:3000` (the host machine from the Android emulator). On a physical phone, set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your computer's LAN IP.

### Signing in

- **Google:** the app gets a Google ID token (Android Credential Manager, via `react-native-nitro-google-signin`) and the API verifies it at `POST /auth/google`. Google Cloud needs a **Web application** OAuth client (its ID goes in both `.env` files) and an **Android** client with package `com.stevesuhr.streakstats` and the build's signing SHA-1. On an emulator, a Google account must be added to the device first.
- **Dev login:** with `ALLOW_DEV_LOGIN=true` in the API's `.env`, dev builds show an email sign-in at the bottom of the login screen that creates/uses a user with that email. Never enable it in production.

iOS also needs an **iOS** OAuth client (bundle ID `com.stevesuhr.streakstats`): its ID goes in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and in the API's `GOOGLE_CLIENT_IDS`, and its reversed form (`com.googleusercontent.apps.<id>`) is the `iosUrlScheme` for the `react-native-nitro-google-signin` plugin in `apps/mobile/app.json`. iOS builds need a Mac with Xcode (`npx expo run:ios --device`) or EAS Build.

## Building on Windows

Two things break the native Android build on Windows out of the box:

1. **Java version.** React Native needs **JDK 17**. Android Studio's bundled Java (25 at the time of writing) fails with `A restricted method in java.lang.System has been called`. Install JDK 17 (`winget install Microsoft.OpenJDK.17`) and point the user environment variable `JAVA_HOME` at it (e.g. `C:\Program Files\Microsoft\jdk-17.x.x-hotspot`).
2. **Path length.** Native builds generate paths over Windows' 260-character limit (`ninja: error: ... Filename longer than 260 characters`). Windows long paths must be enabled, *and* the build needs **CMake 4.x** (its ninja handles long paths; the default CMake 3.22.1's doesn't). Install CMake 4.x in Android Studio → SDK Manager → SDK Tools (tick "Show Package Details"), then create `apps/mobile/android/local.properties`:

   ```properties
   sdk.dir=C:/Users/<you>/AppData/Local/Android/Sdk
   cmake.dir=C:/Users/<you>/AppData/Local/Android/Sdk/cmake/4.1.2
   ```

   `apps/mobile/android/` is generated (`expo prebuild`) and gitignored, so this file is per-machine — and **`expo prebuild --clean` deletes it**; re-create it afterwards. If you switch CMake versions, delete the stale `.cxx` folders (`apps/mobile/android/app/.cxx` and `node_modules/*/android/.cxx`) before rebuilding.

Also set `ANDROID_HOME` to the SDK folder and add `%ANDROID_HOME%\platform-tools` to `Path` (for `adb`).

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

`npm run api`, `npm run android`, `npm run android:build`, `npm run db:migrate`, `npm run db:studio`, `npm run typecheck`, `npm test`.
