# Launch TODO

Status as of 2026-09-24: first iteration works end to end — iPhone (local Xcode build) → API on Vercel → Neon, with Google sign-in. "Must" = blocks store submission or a reasonable v1. Items marked *(verify)* are requirements to re-check against current store rules when we get to them.

## Must — store requirements

- [ ] **Sign in with Apple** on iOS. Apps that offer a third-party login like Google must also offer an equivalent privacy-focused option (App Store guideline 4.8). Needs an Apple login path in the app and `POST /auth/apple` in the API. *(verify)*
- [x] **In-app account deletion** (required by Apple for apps with account creation; also Google Play policy). Avatar → Account screen → Delete account → confirm; `DELETE /me` removes the user, streaks and logs. When Sign in with Apple is added, deletion must also revoke the Apple token. *(verify)*
- [x] **Privacy policy and Terms** at stevesuhr.com/streak-stats/privacy and /streak-stats/terms (repo `steve-suhr-com`), linked from the login screen and the Account screen. Update them when payments/analytics are added.
- [ ] **Make support@stevesuhr.com work** before the legal pages go live and before store submission — both pages list it as the contact address.
- [ ] **Store privacy disclosures**: App Store privacy "nutrition labels" and Google Play Data safety form (we store email, name, avatar URL, streak data).
- [ ] **Google OAuth consent screen**: move from Testing to **In production** (Testing only allows listed test users). Add privacy policy/home page URLs; check whether brand verification is needed. *(verify)*

## Must — iOS release

- [ ] Apple Developer Program ($99/yr).
- [ ] App Store Connect app record (bundle ID `com.stevesuhr.streakstats`, name "Streak Stats" — check availability).
- [ ] EAS setup: `eas.json`, production build profile, env values (`EXPO_PUBLIC_API_URL` = production, Google client IDs) baked into release builds.
- [ ] TestFlight build via `eas build -p ios` + `eas submit`.
- [ ] Store listing: description, screenshots, app icon (done), age rating, support URL.

## Must — Android release

- [ ] Google Play developer account ($25 one-time).
- [ ] New personal accounts must run a **closed test** (last known: 12+ testers opted in for 14 days) before production. *(verify)*
- [ ] Add the **Play App Signing** and **upload key** SHA-1 fingerprints to the Android OAuth client in Google Cloud, or Google sign-in fails in store builds.
- [ ] Test on a real Android device (only tested on the emulator so far; Google sign-in never completed there).
- [ ] Store listing + Data safety form.

## Must — product

- [ ] **Free tier = 1 streak, paid unlock for more.** In-app purchase via RevenueCat (Apple IAP / Google Play Billing), paywall screen, "Restore purchases", and enforcement in the API (`TODO(monetization)` in `apps/api/src/routes/streaks.ts`).
- [ ] **Delete a streak** in the app (API exists: `DELETE /streaks/:id`, no UI).
- [ ] **Rename a streak** in the app (API exists: `PATCH /streaks/:id`, no UI).
- [ ] **Sign out** is only reachable by tapping the avatar — make sure that's discoverable enough, or add a small account screen (which is also where account deletion would live).

## Should — backend & ops

- [ ] Separate **dev and production databases** (e.g. a Neon branch for local dev) — dev-login test data currently lands in production.
- [ ] Use Neon's **pooled** connection string on Vercel; consider `attachDatabasePool` from `@vercel/functions`.
- [ ] Match the Vercel **function region** to the Neon region (currently `sfo1`).
- [ ] **Error monitoring** for app and API (e.g. Sentry).
- [ ] **Rate limiting** on `/auth/*`.
- [ ] Session length: tokens expire after 30 days with no refresh, so users get signed out monthly. Decide on longer expiry or a refresh flow.
- [ ] API tests against a real database (current tests don't touch the DB).
- [ ] CI: typecheck + tests on push.

## Should — app polish

- [ ] **Launch screen**: still the Expo default — make it orange with the flame mark to match the icon and login screen.
- [ ] Figma white strips (list header row, card list background, detail top bar) were treated as leftover default fills — confirm.
- [ ] Day count rolls over at local midnight only when the app returns to the foreground — confirm that's acceptable.
- [ ] Accessibility pass (screen reader labels, dynamic type).
- [ ] Dark mode? (Design is light-only.)
- [ ] Consider EAS Update for over-the-air JS updates after launch.

## Later (explicitly out of v1)

- Milestones, streak history view, longest streak (data model already supports it via `StreakLog`).
- iOS widget / reminders.
