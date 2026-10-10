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

The debug SHA-1/SHA-256 have been registered for the Firebase development Android app. A separately signed release build still needs an owner-controlled release keystore; never send that key/password in chat.

## Firebase development project

The local CLI context in `firebase/.firebaserc` targets `homigo-care-dev-76e21`. The Firestore schema starts with a verified user's private `profiles/{uid}` record; all other collections deny by default until their phase-specific rules are implemented. Rules are validated before deployment. The exact rule payload will be reviewed before applying any permission change. No database reset or fake account seeding is allowed.

## Web environment

Each web application will use the same Firebase Web app configuration via environment variables. Copy `.env.example` to each app's `.env.local` after the M1 web projects are created. Public Firebase client configuration is not authorization; Firestore rules enforce access. Server-only Cloudinary credentials must stay in Vercel encrypted environment variables and must never be added to browser bundles or Git.

## Milestone gates

The work follows the four cumulative 25% milestones in `docs/IMPLEMENTATION_MATRIX.md`. M1 includes a small, buildable foundation in all three products and is implemented in this order: Android, public website, Admin. Later milestone work pauses for user acceptance. See `TODO.md` and `docs/FEATURE_AUDIT.md` for current evidence and blockers.

## Current status

M1 implementation is in progress. A successful source build is not a live Vercel deployment, and an email sent is not proof that the email-action link was successfully applied. Only tool-verified builds/deployments and fresh-link tests will be reported as complete.
