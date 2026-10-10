# HomiGo Care — M1 Implementation Status

**As of:** 2026-10-10 (Asia/Karachi)
**State:** Milestone 1 (Foundation & First Vertical Slice) is **in progress and not accepted**. M2 work remains paused until M1 acceptance and explicit approval.

## M1 progress by product

Scores cover **M1 scope only**. Each product has four equally weighted gates; full credit requires implementation plus relevant verification, partial unverified implementation earns half credit, and blocked/unimplemented gates earn zero. Scores are rounded half-up. Later M2–M4 workflows are excluded.

| Product | M1 score | Evidence and remaining gates |
|---|---:|---|
| Public Website | **63%** (2.5/4) | Current source passes typecheck, lint, tests, and production build. The fresh local preview returned HTTP 200 for `/`, `/services`, `/auth`, `/auth/action`, and `/manus-routes.json`. Web runtime Firebase values, real authentication, and a verifiable Vercel deployment remain outstanding. |
| Admin Panel | **38%** (1.5/4) | Current source passes typecheck, lint, tests, and production build; the local preview root returned HTTP 200. The sign-in-only/custom-claim shell is not verified against a live Firebase runtime or authorized Admin account. A protected Vercel deployment remains unverified. The temporary external Vite preview returned a host-validation 403; this is not evidence of product-level authorization. |
| Native Android | **50%** (2/4) | Kotlin/Jetpack Compose foundation, Firebase app registration, Google provider/OAuth metadata, and registered development-certificate fingerprints are verified. Earlier CI run `38055840563` built an APK, but it used the runner's default key, not the registered key. The updated CI now refuses to build/upload unless the registered key is supplied and the final APK fingerprints match. The required GitHub key-secret write returned HTTP 403; no correct-signer Actions artifact or real-device sign-in has been verified. |

**M1 gate accounting:** Website = route foundation/local smoke (1) + CI-equivalent checks (1) + partial auth/runtime gate (0.5) + deployment gate (0) = **2.5/4**. Admin = partial shell/claim/query verification (0.5) + CI-equivalent checks (1) + runtime/bootstrap gate (0) + deployment gate (0) = **1.5/4**. Android = partial native foundation (0.5) + Firebase registration/OAuth and registered certificate (1) + partial CI build/signing gate (0.5; prior build used the wrong signer and the new gate is not yet supplied a key) + real-device auth/profile gate (0) = **2/4**.

## Verified foundation and current findings

- **Source of truth:** private GitHub repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform), branch `fresh-rebuild`. Changes in this continuation are being kept on that branch; no secrets or client configuration are committed.
- **Local Web verification:** Firestore Rules Emulator **8/8**; Public and Admin typecheck, lint, tests, and production builds all pass on the current working tree. Fresh local previews returned HTTP 200. The external Vite preview host check is not a Vercel deployment or an authentication test.
- **Firebase project:** `homigo-care-dev-20261010`, region `asia-southeast1` (Singapore), Spark plan. Android package `pk.homigocare.android` and the shared Web app are registered.
- **Google Sign-In / OAuth:** The authorized [Firebase Authentication provider page](https://console.firebase.google.com/project/homigo-care-dev-20261010/authentication/providers) lists Google as enabled. The Google provider dialog has a Web client ID populated; its client secret was masked and not read. The refreshed local Android JSON has the expected project/package and both Android and Web OAuth client types; prior CI validated the available repository config without printing its values. The app's live Firebase settings show these registered development fingerprints, which match the local keystore:
  - SHA-1: `F4:4A:F8:1E:50:99:63:1E:5C:49:A2:78:D0:7B:BD:13:57:35:98:E9`
  - SHA-256: `09:BF:4F:EC:5B:FE:A4:23:0E:27:B7:20:36:3C:46:74:CE:BA:54:7E:8E:FD:79:8D:14:44:C2:63:E6:C2:AF:40`
- **Email/Password:** The live Authentication provider list showed only Google; Email/Password is currently **not enabled**. It was left unchanged because enabling it changes available sign-in behavior. Web runtime values are also still missing.
- **Android CI:** Existing run [38055840563](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38055840563) passed project/package/OAuth validation, Android lint, unit tests, and `assembleDebug`, and uploaded a private seven-day artifact. The downloaded APK was 15,371,248 bytes, SHA-256 `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`; its signer is **not** the registered development certificate, so it is not Google-Sign-In-ready.
- **GitHub secrets:** A fresh, stdin-only retry to set both `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` and `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` returned HTTP 403 for both; no values were printed or logged. The existing Firebase JSON secret was demonstrably available to the prior workflow and passed metadata validation, so it does not need manual replacement unless it is intentionally being refreshed. The registered-keystore secret is required for the new fail-closed signing gate.
- **Vercel:** The reauthorized `rajahaider50` Hobby team lists zero projects and no linked Git deployment contexts; lookups for the historical Public/Admin staging names return 404. No alternate authorized Vercel account/team is available to switch to. Current deployment status and URLs therefore remain unverified. No replacement projects were created.
- **Firestore:** The candidate least-privilege policy in `firebase/firestore.rules` remains undeployed. The isolated emulator now passes 8/8, including anonymous and patient list denials, unverified-admin denial, and denial for health/payment namespaces. No shared Firestore writes or test records were created. The live Firestore data view showed no documents; the Console Rules editor did not render rule text during this check. The last verified live state remains production-mode deny-all; no deployment/change was performed. Firebase CLI in this Sandbox has no authorized account.
- **Device test:** No Android SDK, `adb`, or physical device is available in this Sandbox. No real-device installation, Google sign-in, email verification, or profile-persistence test has been performed.
- **Other dependencies:** WhatsApp OTP awaits the user's sanitized Java/API contract. The initial Admin bootstrap email is still needed. Cloudinary signed uploads require a secure server-side runtime secret and are later-scope work.

## Updated Android CI behavior

The workflow now supports `workflow_dispatch` and requires the repository Actions secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`. Before the native build, it validates the supplied key against the two registered fingerprints. After `assembleDebug`, it verifies the APK signer again and only then uploads the artifact. If the key secret is absent, native Android build and artifact steps are deliberately skipped instead of silently using GitHub's runner key. These changes are in the current `fresh-rebuild` work and will be verified by the next Actions run.

## Manual actions genuinely required

1. **GitHub signing key:** In GitHub, open `rajahaider50/homigo-care-platform` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Set the name to `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`. Use a single-line Base64 encoding of the development-only keystore linked separately; do not paste the Base64 value into chat or commit the keystore. On Linux, create the value with `base64 -w 0 <keystore-file>`. Once saved, the workflow will verify the fingerprints and publish a private seven-day APK artifact if all checks pass.
2. **Vercel access:** Reconnect/select the Vercel account or team that already owns the two HomiGo projects, and ensure it can see the GitHub repository `rajahaider50/homigo-care-platform`. Then the existing projects can be inspected and redeployed if needed. Do **not** create replacements without approval.
3. **Optional product choice:** Confirm whether Email/Password should be enabled in the development Firebase project; it is currently off. No provider setting was changed.
4. **Device validation:** After a correctly signed APK is available, install it on an authorized Android device and test Google sign-in and owner-only profile persistence. Until then, these remain unverified.
5. **Rules deployment:** Review the exact contents of `firebase/firestore.rules` and obtain explicit approval before deploying any non-deny-all rules. No public access or health/payment access should be enabled.

## Immediate continuation and milestone gate

- Commit and push the current workflow/tests/status updates to `fresh-rebuild`, then inspect the resulting Actions run. If the keystore secret is unavailable, use the manual action above; do not produce an APK signed by an unregistered key and call it verified.
- Recheck Vercel only after the correct team/project authorization is available. Continue testing Public/Admin locally meanwhile, but report no Vercel URL until a deployment and HTTP response are verified.
- Keep **M1 open**. Do not start M2 until all M1 acceptance criteria are evidenced and the user explicitly approves moving forward.

## Source records

See [`PROJECT_HISTORY_AND_CONTINUATION.md`](PROJECT_HISTORY_AND_CONTINUATION.md), [`docs/FEATURE_AUDIT.md`](docs/FEATURE_AUDIT.md), [`docs/IMPLEMENTATION_MATRIX.md`](docs/IMPLEMENTATION_MATRIX.md), [`firebase/RULES.md`](firebase/RULES.md), and [`TODO.md`](TODO.md). No Firebase JSON, keystore contents, API secrets, user records, or patient data are included in this report.
