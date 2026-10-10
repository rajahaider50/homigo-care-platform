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
2. Copy the current `google-services.json` for the registered Android app `pk.homigocare.android` to `apps/android/app/google-services.json`. This file is ignored by Git; never commit it.
3. From `apps/android`, run:

   ```bash
   ./gradlew testDebugUnitTest lintDebug assembleDebug
   ```

4. Install the generated debug APK with Android Studio or `adb install -r app/build/outputs/apk/debug/app-debug.apk`.

The new development project has Android (`pk.homigocare.android`) and shared Web app registrations. A unique project-specific debug keystore is outside Git, with its SHA-1/SHA-256 registered on the Android app. For local debug builds set `HOMIGO_DEV_DEBUG_KEYSTORE` to that file; the Gradle override affects only debug signing. Never commit or use this development key for a release. The earlier cross-project SHA-1 attempt was removed; prior projects remain unchanged. **Google Sign-In is enabled in the development project** with public-facing name `HomiGo Care` and support email `zarghamabbas859@gmail.com`. Firebase generated OAuth clients, so use the refreshed Android `google-services.json`; it remains outside Git. CI run `38055840563` validated the expected project/package/OAuth metadata, passed Android lint, unit tests, and `assembleDebug`, and uploaded private artifact `homigo-care-debug-apk-837af9b35da552d02214476a4fcef8881ce08a43` for seven days. The downloaded APK is 15,371,248 bytes (SHA-256 `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`) but uses the runner's default debug key, not the Firebase-registered development key, so Google Sign-In remains unverified. The reauthorized GitHub integration cannot list or set the secret (HTTP 403); the reauthorized Vercel team currently lists no projects, so current deployments and URLs are unverified. Email/password Auth and Web runtime configuration remain pending. A signed release still needs an owner-controlled release keystore; never send that key/password in chat. See [M1 status](M1_IMPLEMENTATION_STATUS_2026-10-10.md) and [project handover](PROJECT_HISTORY_AND_CONTINUATION.md).

## Firebase development project

The local CLI context in `firebase/.firebaserc` targets the development project `homigo-care-dev-20261010`; the production alias remains `homigo-care-76e21`. The new project is on Firebase Spark, with Analytics and Gemini disabled. Its default Firestore database is active in Standard (Native) edition in `asia-southeast1` (Singapore). It was created in production mode with `allow read, write: if false;`, so client access stays denied until the repository's profile-aware rules are reviewed and deployed. No documents or user data have been written. Scheduled backups are disabled; enabling them requires the Blaze pay-as-you-go plan. Existing Firebase projects remain untouched. The exact rule payload will be reviewed before applying any permission change. No database reset or fake account seeding is allowed.

## Web environment

The registered `HomiGo Care Web` Firebase app is shared by the Public and Admin apps. Google Sign-In is enabled in the development project, but set the `VITE_FIREBASE_*` values in each app's local/Vercel environment before expecting Web authentication to work; copy `.env.example` to `.env.local` for local development and do not commit configured values. Public Firebase client configuration is not authorization; Firestore rules enforce access. Server-only Cloudinary credentials must stay in Vercel encrypted environment variables and must never be added to browser bundles or Git.

## Milestone gates

The work follows the four cumulative 25% milestones in `docs/IMPLEMENTATION_MATRIX.md`. M1 includes a small, buildable foundation in all three products and is implemented in this order: Android, public website, Admin. Later milestone work pauses for user acceptance. See `TODO.md` and `docs/FEATURE_AUDIT.md` for current evidence and blockers.

## Current status

M1 implementation is in progress and has not been accepted. Current M1-scope progress is Public Website 63%, Admin Panel 38%, and native Android 63%, using implementation plus verification evidence; these do not include later M2–M4 workflows. A successful source build is not a live Vercel deployment, and an email sent is not proof that the email-action link was successfully applied. Only tool-verified builds/deployments and fresh-link tests will be reported as complete. See [M1 status](M1_IMPLEMENTATION_STATUS_2026-10-10.md) and [project history and continuation](PROJECT_HISTORY_AND_CONTINUATION.md).
