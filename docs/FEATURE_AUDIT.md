

## Latest verification update (2026-10-10)

This dated snapshot supersedes older status-row details where they differ. The current working tree passes Firestore Rules Emulator tests **8/8** and Public/Admin typecheck, lint, tests, and production builds; fresh local previews returned HTTP 200 for required Public routes and the Admin root. Google is enabled in the live Firebase Auth provider list, the Web client ID is populated, and the local development keystore fingerprints match the Android app's live Firebase registration. Email/Password is not enabled. No real Android device or `adb` is available, so Google sign-in and profile persistence remain unverified on device.

The prior downloadable Actions APK is integrity-verified but signed with GitHub's runner key, not the Firebase-registered development key. CI has been hardened to require `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`, verify the supplied key and built APK fingerprints, and skip Android build/artifact steps rather than use a default key. Attempts to write both the signing-key and Firebase JSON secrets returned HTTP 403; the existing Firebase JSON secret had been available to the prior run and passed metadata validation. The connected Vercel Hobby team reports zero projects and no Git-linked project context; no replacement projects were created and no live URL is verified. The live Firestore Rules editor did not render source in the current Console check; the last verified live state remains deny-all, no rules were deployed, and no shared data was written.

Current M1 scores are Public Website **63%**, Admin Panel **38%**, and Android **50%**. M1 remains open; M2 is paused pending acceptance and explicit user approval.
