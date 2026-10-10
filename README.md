# HomiGo Care — connected MVP

A fresh, privacy-first MVP implementation with a native Android application and two separate web applications. Firebase Authentication and Cloud Firestore are the shared identity/data foundation. The supplied HomiGo PDF, design tokens, logo and original icons are retained in this repository.

> This is a **non-commercial demo/staging MVP**, not a medical service, emergency-dispatch system, clinical product, or production-ready healthcare platform. Do not enter real patient/medical information.

## Source layout

- `apps/android` — native Kotlin/Jetpack Compose Patient app and shared Doctor/Nurse app foundation.
- `apps/public-web` — public HomiGo Care website and patient-facing entry points.
- `apps/admin-web` — separate protected Admin web application; no public Admin registration.
- `packages/design-system` — original brand tokens, logo and icon assets.
- `firebase` — Firebase CLI project context and Firestore rules; **no Firebase Hosting or Storage**.
- `tests/firestore` — isolated Firestore Security Rules tests.
- `docs` — implementation matrix, feature audit, source specifications, and milestone reports.

## Android local setup

1. Install Android Studio or use JDK 21 plus Android SDK 35.
2. Copy the current `google-services.json` for registered Android app `pk.homigocare.android` to `apps/android/app/google-services.json`. This file is ignored by Git; never commit it.
3. From `apps/android`, run:

   ```bash
   ./gradlew testDebugUnitTest lintDebug assembleDebug
   ```

4. Install the generated debug APK with Android Studio or `adb install -r app/build/outputs/apk/debug/app-debug.apk`.

A unique project-specific development-only debug keystore is outside Git. Its SHA-1/SHA-256 fingerprints match the Android app's live Firebase registration. Set `HOMIGO_DEV_DEBUG_KEYSTORE` to that file for local debug signing; the Gradle override affects only debug builds. Never commit or use this development key for a release. Google Sign-In is enabled in Firebase, but a real-device sign-in has not been tested.

The last Actions run that actually built an APK is [run 38055840563](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38055840563). Its 15,371,248-byte APK artifact passed integrity validation (SHA-256 `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`) but used the runner's default debug key, **not** the Firebase-registered development key. It is not Google-Sign-In-ready. The later [run 38057851529](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38057851529) passed Web and Firestore Rules checks, but the registered-keystore secret was absent; Android SDK setup, build, signature verification, and artifact upload were skipped, leaving zero artifacts. The CI workflow requires `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`, verifies the registered fingerprints and final APK signature, and never falls back to the runner key. Secret update attempts returned HTTP 403, so the owner must add that secret through repository Settings. The existing Firebase JSON secret was available to the previous workflow and passed project/package/OAuth metadata validation. See [M1 status](M1_IMPLEMENTATION_STATUS_2026-10-10.md) and [project handover](PROJECT_HISTORY_AND_CONTINUATION.md).

## Firebase development project

The local CLI context in `firebase/.firebaserc` targets development project `homigo-care-dev-20261010`; the production alias remains `homigo-care-76e21`. The new project is on Firebase Spark, with Analytics and Gemini disabled. Its default Firestore database is active in Standard (Native) edition in `asia-southeast1` (Singapore). The last verified live state is production-mode deny-all rules; the latest Console Rules editor did not render its source, and no live rule change was made. The repository's profile-aware rules are candidate rules only and pass 8/8 isolated Emulator tests. No documents or user data were written. Scheduled backups are disabled; enabling them requires the Blaze pay-as-you-go plan. Existing Firebase projects remain untouched. The exact rule payload must be reviewed and explicitly approved before any deployment. No database reset or fake account seeding is allowed.

## Web environment

The registered `HomiGo Care Web` Firebase app is shared by the Public and Admin apps. The live Firebase Authentication provider list shows Google enabled and Email/Password **not enabled**. The Google Web client ID field is populated; its client secret was masked in Console and not read. Set the `VITE_FIREBASE_*` values in each app's local/Vercel environment before expecting Web authentication to work; copy `.env.example` to `.env.local` for local development and do not commit configured values. Public Firebase client configuration is not authorization; Firestore rules enforce access. Server-only Cloudinary credentials must stay in Vercel encrypted environment variables and must never be added to browser bundles or Git.

## Milestone gates

The work follows the four cumulative 25% milestones in `docs/IMPLEMENTATION_MATRIX.md`. M1 includes a small, buildable foundation in all three products and is implemented in this order: Android, public website, Admin. Later milestone work pauses for user acceptance. See `TODO.md` and `docs/FEATURE_AUDIT.md` for current evidence and blockers.

## Current status

M1 is **in progress and not accepted**. Current M1-scope progress is Public Website **63%**, Admin Panel **38%**, and native Android **50%**, based on implementation plus verification evidence; later M2–M4 workflows are excluded. On the current working tree, Firestore Rules Emulator tests pass 8/8, and Public/Admin typecheck, lint, tests, and production builds pass. Fresh local previews returned HTTP 200 for the Public routes and Admin root; these are not Vercel deployments. The reauthorized Vercel team lists zero projects, so no current Vercel deployment or URL is verified. A source build or email sent is not proof of deployment or end-to-end authentication. M2 must not begin until M1 acceptance criteria are met and the user explicitly approves moving forward. See [M1 status](M1_IMPLEMENTATION_STATUS_2026-10-10.md) and [project history and continuation](PROJECT_HISTORY_AND_CONTINUATION.md).
