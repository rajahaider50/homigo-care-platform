

## Current M1 status update (2026-10-10)

This update supplements and supersedes older implementation-status statements above. M1 remains **in progress and not accepted**; M2 must not begin without the user's explicit approval.

- Current M1 progress: Public Website **63%**, Admin Panel **38%**, native Android **50%**, calculated from implementation plus verification.
- Current local verification passes Firestore Rules Emulator **8/8**, plus Public/Admin typecheck, lint, tests, and production builds. The live Google provider is enabled and the registered development SHA-1/SHA-256 match the local keystore. Email/Password is currently disabled. No Android device/ADB test has occurred.
- The previous Actions APK was built, but signed with the runner's default key. The updated CI workflow requires the registered key, checks its fingerprints and the final APK certificate, and skips the build rather than fall back. GitHub secret writes for the key and Firebase JSON returned HTTP 403. Owner action: add `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` under repository Settings → Secrets and variables → Actions, then rerun `ci.yml` on `fresh-rebuild`.
- The reauthorized Vercel team currently exposes zero projects and no linked Git context. Reconnect the account/team owning the existing Public and Admin projects; do not create replacements without approval.
- The Firestore candidate rules remain undeployed. The latest live Rules editor did not render source; the last verified live policy remains production-mode deny-all. Keep it that way until the exact repository rules are reviewed and explicitly approved. No shared data was written.

See `M1_IMPLEMENTATION_STATUS_2026-10-10.md`, `PROJECT_HISTORY_AND_CONTINUATION.md`, `docs/FEATURE_AUDIT.md`, and `docs/IMPLEMENTATION_MATRIX.md` for detailed evidence and continuation steps.
