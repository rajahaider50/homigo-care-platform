# HomiGo Care — M1 Implementation Status

**As of:** 2026-10-10 (Asia/Karachi)
**State:** Milestone 1 (Foundation & First Vertical Slice) is **in progress and not accepted**. M2 remains paused until M1 acceptance and explicit approval.

## M1 progress by product

Scores cover **M1 scope only**. Each product has four equally weighted gates; full credit requires implementation plus relevant verification, partial unverified implementation earns half credit, and blocked/unimplemented gates earn zero. Scores are rounded half-up. Later M2–M4 workflows are excluded.

| Product | M1 score | Evidence and remaining gates |
|---|---:|---|
| Public Website | **63%** (2.5/4) | Current source passes typecheck, lint, tests, and production build. Fresh local preview returned HTTP 200 for `/`, `/services`, `/auth`, `/auth/action`, and `/manus-routes.json`. Web Firebase runtime values, real authentication, and a verifiable Vercel deployment remain outstanding. |
| Admin Panel | **38%** (1.5/4) | Current source passes typecheck, lint, tests, and production build; the local preview root returned HTTP 200. The sign-in-only/custom-claim shell is not verified against live Firebase runtime or an authorized Admin account. A protected Vercel deployment remains unverified. The temporary external Vite preview returned a host-validation 403, not an authorization test. |
| Native Android | **50%** (2/4) | Kotlin/Jetpack Compose foundation, Firebase app registration, live Google provider/OAuth metadata, and registered development-certificate fingerprints are verified. Prior run `38055840563` built an APK using the runner's default key, not the registered key. Follow-up run `38057851529` confirmed the new fail-closed workflow works, but the key secret is absent, so Android build/signature/artifact steps were skipped. No correct-signer Actions artifact or real-device sign-in has been verified. |

**M1 gate accounting:** Website = route foundation/local smoke (1) + CI-equivalent checks (1) + partial auth/runtime gate (0.5) + deployment gate (0) = **2.5/4**. Admin = partial shell/claim/query verification (0.5) + CI-equivalent checks (1) + runtime/bootstrap gate (0) + deployment gate (0) = **1.5/4**. Android = partial native foundation (0.5) + Firebase registration/OAuth and registered certificate (1) + partial CI build/signing gate (0.5; prior build used the wrong signer and the latest build was safely skipped) + real-device auth/profile gate (0) = **2/4**.

## Verified foundation and current findings

- **Source of truth:** private GitHub repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform), branch `fresh-rebuild`. The fail-closed workflow and expanded tests are in implementation commit [`e6249c9`](https://github.com/rajahaider50/homigo-care-platform/commit/e6249c9). No secrets or Firebase client configuration are committed.
- **Latest CI:** [Run 38057851529](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38057851529) on `e6249c9` completed overall **success**. The Firestore Emulator, Public Website, and Admin Panel jobs passed. Android config validation passed, but `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` was absent; Android SDK setup, native build, APK fingerprint verification, and artifact upload were skipped. The run uploaded **zero artifacts**. This is intentional fail-closed behavior, not a successful native build.
- **Local Web verification:** Firestore Rules Emulator **8/8**; Public and Admin typecheck, lint, tests, and production builds pass on the current source. Fresh local previews returned HTTP 200. Temporary previews are not Vercel deployments or authentication tests.
- **Firebase project:** `homigo-care-dev-20261010`, region `asia-southeast1` (Singapore), Spark plan. Android package `pk.homigocare.android` and the shared Web app are registered.
- **Google Sign-In / OAuth:** The [Firebase Authentication provider page](https://console.firebase.google.com/project/homigo-care-dev-20261010/authentication/providers) lists Google as enabled. The provider dialog has a Web client ID populated; its client secret was masked and not read. The refreshed local Android JSON has the expected project/package and Android plus Web OAuth client types. The [live Android app settings](https://console.firebase.google.com/project/homigo-care-dev-20261010/settings/general/android:pk.homigocare.android) show these registered development fingerprints, matching the local keystore:
  - SHA-1: `F4:4A:F8:1E:50:99:63:1E:5C:49:A2:78:D0:7B:BD:13:57:35:98:E9`
  - SHA-256: `09:BF:4F:EC:5B:FE:A4:23:0E:27:B7:20:36:3C:46:74:CE:BA:54:7E:8E:FD:79:8D:14:44:C2:63:E6:C2:AF:40`
- **Email/Password:** The live provider list showed only Google; Email/Password is **not enabled**. It was left unchanged because enabling it changes available sign-in behavior. Web runtime values are also still missing.
- **Prior Android artifact:** Run [38055840563](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38055840563) passed Android lint, unit tests, `assembleDebug`, and uploaded an integrity-verified private artifact. The APK was 15,371,248 bytes, SHA-256 `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`; it was signed with the runner's default key, **not** the registered development key, and is not Google-Sign-In-ready.
- **GitHub secrets:** Stdin-only retries to set `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` and `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` both returned HTTP 403; no values were printed or logged. The existing Firebase JSON secret was available to the prior workflow and passed project/package/OAuth validation. The new CI run confirms the registered-keystore secret is absent.
- **Vercel:** The reauthorized `rajahaider50` Hobby team lists zero projects and no linked Git deployment contexts; lookups for historical Public/Admin staging names return 404. No alternate authorized account/team is available. Current deployment state and URLs remain unverified. No replacement projects were created.
- **Firestore:** Candidate least-privilege rules in `firebase/firestore.rules` remain undeployed. The emulator passes 8/8, including anonymous/patient list denial, unverified-admin denial, and health/payment namespace denial. No shared Firestore writes or test records were created. The live Firestore data view showed no documents; the [live Rules editor](https://console.firebase.google.com/project/homigo-care-dev-20261010/firestore/databases/-default-/security/rules) did not render its source. Last verified live state remains production-mode deny-all; no deployment/change was performed. Firebase CLI in this Sandbox has no authorized account.
- **Device test:** No Android SDK, `adb`, or physical device is available in this Sandbox. No real-device installation, Google sign-in, email verification, or profile-persistence test has been performed.
- **Other dependencies:** WhatsApp OTP awaits the user's sanitized Java/API contract. The initial Admin bootstrap email is still needed. Cloudinary signed uploads require a secure server-side runtime secret and are later-scope work.

## Updated Android CI behavior and result

The workflow supports `workflow_dispatch`, requires repository Actions secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`, validates the supplied key against the registered fingerprints, verifies the final APK signer, and uploads only a matching APK. Run `38057851529` completed successfully overall; its Android job validated the Firebase config, found the signing-key secret absent, then skipped Android SDK setup, build, signature verification, and upload. No artifact was created. The workflow will not fall back to GitHub's runner key.

## Manual actions genuinely required

1. **GitHub signing key:** Open [repository Actions secrets settings](https://github.com/rajahaider50/homigo-care-platform/settings/secrets/actions) → **New repository secret**. Set the name to `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`. Use a single-line Base64 encoding of the development-only keystore linked separately; do not paste the value into chat or commit the keystore. On Linux, create the value with `base64 -w 0 <keystore-file>`. After saving, rerun `ci.yml` on `fresh-rebuild`; a private seven-day artifact will be uploaded only if the signing fingerprints match.
2. **Vercel access:** Reconnect/select the account or team that already owns the two HomiGo projects and ensure it can see `rajahaider50/homigo-care-platform`. Then the existing projects can be inspected. Do **not** create replacements without approval.
3. **Optional product choice:** Confirm whether Email/Password should be enabled in the development Firebase project; it is currently off. No provider setting was changed.
4. **Device validation:** After a correctly signed APK is available, install it on an authorized Android device and test Google sign-in and owner-only profile persistence. Until then, these remain unverified.
5. **Rules deployment:** Review the exact contents of `firebase/firestore.rules` and obtain explicit approval before deploying any non-deny-all rules. No public access or health/payment access should be enabled.

## Immediate continuation and milestone gate

Add the keystore secret first, then rerun the workflow and verify a correct-signer artifact before attempting device sign-in. Recheck Vercel only after the correct team/project authorization is available; report no Vercel URL until a deployment and HTTP response are verified. Keep **M1 open** and do not start M2 until all M1 acceptance criteria are evidenced and the user explicitly approves moving forward.

## Source records

See [`PROJECT_HISTORY_AND_CONTINUATION.md`](PROJECT_HISTORY_AND_CONTINUATION.md), [`docs/FEATURE_AUDIT.md`](docs/FEATURE_AUDIT.md), [`docs/IMPLEMENTATION_MATRIX.md`](docs/IMPLEMENTATION_MATRIX.md), [`firebase/RULES.md`](firebase/RULES.md), and [`TODO.md`](TODO.md). No Firebase JSON, keystore contents, API secrets, user records, or patient data are included in this report.

## Follow-up source fix (2026-10-10; isolated feature branch)
On `fix/android-auth-registration-flow` from base `3906b045`, successful unverified email registration now routes to the verification UI instead of clearing verification state and proceeding to the verified-only profile load. A missing Google web-client-ID resource is handled as a recoverable UI error. New pure-policy tests cover unverified registration, verified registration, and sign-in routing. Local Android `lint`, 6 unit tests, and `assembleDebug` passed; the temporary compile-only Firebase JSON was removed. Repository Public/Admin typecheck, lint, 7 Web tests, production builds, and Firestore Rules Emulator (8/8) also passed. This does not verify the reported crash cause, Firebase integration, Google OAuth, correct signer, or device behavior; no device is connected. No source has yet merged to `fresh-rebuild`. See `PROJECT_HISTORY_AND_CONTINUATION.md` and `ANTIGRAVITY_PLATFORM_SETUP_TASKS.md` for continuation and platform tasks.
