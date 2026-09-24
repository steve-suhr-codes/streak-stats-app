See README.md for layout, setup, data model, and API.

- npm workspaces monorepo. Install from the root. In `apps/mobile`, add packages with `npx expo install` (see apps/mobile/AGENTS.md for Expo rules).
- Root `overrides` pins react/react-dom/react-native to the Expo SDK's versions. Update them when upgrading the SDK, then run `npx expo-doctor` in apps/mobile.
- Streak dates are calendar dates (`YYYY-MM-DD`) and "today" comes from the client. Keep date math in `packages/shared/src/dates.ts`.
- Schema changes: edit `apps/api/prisma/schema.prisma`, then `npm run db:migrate`. The init migration adds a hand-written partial unique index (one open StreakLog per streak) that Prisma can't express.
- Run `npm run typecheck` and `npm test` before calling work done.
