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

The new development project now has Android (`pk.homigocare.android`) and shared Web app registrations. The Android app currently has no SHA fingerprints: Firebase warned that the existing development debug SHA-1/package pair already belongs to an OAuth 2.0 client in another project and that Google API calls using it may fail. The fingerprint added during investigation was removed; resolve the collision with an owner-approved signing plan before expecting Android Google sign-in to work. The downloaded Android client config remains uncommitted. GitHub rejected the attempt to set `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` with HTTP 403, so native Android CI steps are skipped. A separately signed release build still needs an owner-controlled release keystore; never send that key/password in chat.

## Firebase development project

The local CLI context in `firebase/.firebaserc` targets the development project `homigo-care-dev-20261010`; the production alias remains `homigo-care-76e21`. The new project is on Firebase Spark, with Analytics and Gemini disabled. Its default Firestore database is active in Standard (Native) edition in `asia-southeast1` (Singapore). It was created in production mode with `allow read, write: if false;`, so client access stays denied until the repository's profile-aware rules are reviewed and deployed. No documents or user data have been written. Scheduled backups are disabled; enabling them requires the Blaze pay-as-you-go plan. Existing Firebase projects remain untouched. The exact rule payload will be reviewed before applying any permission change. No database reset or fake account seeding is allowed.

## Web environment

The registered `HomiGo Care Web` Firebase app is shared by the Public and Admin apps. Set its `VITE_FIREBASE_*` values in each app's local/Vercel environment before expecting Firebase auth to work; copy `.env.example` to `.env.local` for local development and do not commit configured values. Public Firebase client configuration is not authorization; Firestore rules enforce access. Server-only Cloudinary credentials must stay in Vercel encrypted environment variables and must never be added to browser bundles or Git.

## Milestone gates

The work follows the four cumulative 25% milestones in `docs/IMPLEMENTATION_MATRIX.md`. M1 includes a small, buildable foundation in all three products and is implemented in this order: Android, public website, Admin. Later milestone work pauses for user acceptance. See `TODO.md` and `docs/FEATURE_AUDIT.md` for current evidence and blockers.

## Current status

M1 implementation is in progress. A successful source build is not a live Vercel deployment, and an email sent is not proof that the email-action link was successfully applied. Only tool-verified builds/deployments and fresh-link tests will be reported as complete.
