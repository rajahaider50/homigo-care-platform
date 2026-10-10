# HomiGo Care — Next AI Handoff (2026-10-11)

> **اردو خلاصہ:** M2 کا سورس موجودہ feature branch پر push کیا جا رہا ہے۔ مقامی Web/API/Firestore checks پاس ہیں، مگر دو security blockers کی وجہ سے PR merge نہیں کرنا۔ حقیقی WhatsApp gateway، Android device test، provider data اور Vercel staging ابھی باقی ہیں۔

## Purpose and user constraints

Continue the private repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform). The active feature branch is `fix/android-auth-registration-flow`; [PR #1](https://github.com/rajahaider50/homigo-care-platform/pull/1) targets `fresh-rebuild`.

The user wants all implementation handled by this agent, **not Antigravity**. Keep Android native Kotlin/Jetpack Compose (never a WebView). Use the selected Firebase development project `homigo-care-dev-20261010`; preserve existing production/legacy projects. Do not seed fake users, providers, bookings, patient data, or clinical data. Never commit or print secrets, `.env.local`, `google-services.json`, keystores, or service-account files. The user's approximate goal is 70% functional completion for each product, but **this handoff does not establish that 70% has been reached**. Report implementation and verification separately for Android, Public Website, and Admin.

The user asked to stop feature work, push the current source, and provide this continuation file. Do not merge PR #1 as part of that request. The two security findings below are hard blockers; fix and test them before merge or deployment.

## What is implemented in the current M2 source

- **Shared API (`apps/api`, `@homigo/api`):** Vercel Node handlers for OTP send/verify, account registration, and phone/password sign-in. It keeps gateway credentials server-side, uses HMAC-derived rate-limit bucket identifiers, issues expiring one-use HMAC proofs, and fails closed on unknown gateway verification responses.
- **Native Android:** Kotlin/Compose auth changes, OTP-gated registration, phone/password sign-in, WhatsApp linking for existing accounts, and a patient-care slice that discovers approved professionals and writes booking requests through Firestore. No WebView was introduced.
- **Public Website:** Email/password and Google auth options, WhatsApp-gated registration, phone/password sign-in, WhatsApp linking, and a `/care` discovery/booking page. The auth page checks `/api/health`; when secure OTP configuration is missing/unreachable it tells the user and disables OTP controls without disabling ordinary existing-account sign-in. Home/service messaging was corrected to avoid claiming live gateway or provider availability. The official Cloudinary lockup is visible through an optimized delivery URL.
- **Admin Panel:** Existing email-verified custom-claim gate remains in place; status copy now reflects deployed M2 rules. A real Admin/provider/booking end-to-end workflow has not been demonstrated.
- **Firebase:** Expanded M2 Firestore rules are deployed to the selected **development** project after the owner's approval. No live records were seeded.

## Verification actually performed

On 2026-10-11, the following local commands passed:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`: API **17/17**, Admin **3/3**, Public Web **4/4**
- `pnpm build` (Public and Admin production builds succeeded; Vite reported non-blocking large-chunk warnings)
- `pnpm test:rules`: Firestore Rules Emulator **15/15**

Visual walkthrough: Public home, sign-in, account-creation warning state, signed-out `/care`, and services page; Admin signed-out protected entry. The signup warning was visible and the OTP-send button disabled while the secure verification service was not configured. No real credentials were submitted and no OTP was sent.

The final native Android verification attempt stopped before compilation because this active Sandbox had no `ANDROID_HOME` or configured `sdk.dir`. The official command-line-tools archive was downloaded and checksum-verified, and unpacked under `/home/ubuntu/Android/Sdk/cmdline-tools/latest`; API 35/build-tools packages were **not** installed because the setup command stopped before that step. A previous debug APK exists at `apps/android/app/build/outputs/apk/debug/app-debug.apk`, but its signer was not reverified during this handoff. No physical Android device is attached, so Google Sign-In, the registration crash fix, and booking have not been tested end-to-end on a device.

Prior PR checks predate this full M2 source update. After push, check the newest GitHub Actions run; a green older PR status is not evidence that the new source passed CI.

## Security blockers — fix before merge/deploy

### 1. Registration role is not authoritative

In `apps/api/api/v1/auth/register.ts:22-26`, registration accepts a client-supplied `role`, and at line 39 stores it only in the server-private `phone_index.accountRole`. The API does not bind the role into a trusted claim or create a server-authoritative role profile.

In `firebase/firestore.rules:51-67`, `validNewProfile()` accepts either `patient` or `professional` from the client profile. `allow create` at line 185 checks WhatsApp verification and UID, but does not compare the selected role to a trusted server value. `patient()`/`profileRole()` then trust that client-created profile role. A verified account can therefore choose a role that differs from the server's `phone_index.accountRole`, including gaining patient read/booking privileges when that was not the registered role.

**Required fix:** either make public registration patient-only and keep professional onboarding in a separate server-controlled path, or bind an immutable, trusted role server-side and require Firestore rules to enforce it. Add direct Firestore/API regression tests for mismatched/self-selected roles. Any changed rules must be reviewed and explicitly approved by the owner before redeployment, even though the present M2 rules deployment was approved.

### 2. API origin configuration and health readiness disagree

`apps/api/src/http.ts:9-10` substitutes localhost origins when `HOMIGO_ALLOWED_ORIGINS` is absent and accepts arbitrary non-empty values without validating them as exact origins. `apps/api/api/health.ts:13-15` separately treats any non-empty list as configured. Thus a deployment can report readiness for malformed values, or report configuration-required while API handlers still use the localhost fallback. OTP routes use this shared helper and do not independently require a valid production origin allowlist.

**Required fix:** use one shared origin/readiness validator. Require valid exact HTTPS origins for deployed browser clients, reject wildcards and malformed entries, fail closed for browser `Origin` requests when missing/invalid, and ensure `/api/health` uses the same logic. Preserve the intentional no-`Origin` path needed by native Android; do not replace it with wildcard CORS. Add tests for missing, malformed, localhost-only development, exact allowed production origins, rejected origins, and health/API consistency.

Until these findings are fixed, keep PR #1 draft and do not deploy the API or merge to `fresh-rebuild`.

## External integration gaps

- The WhatsApp request contract is documented and unit-tested (digits-only Pakistani number in the upstream JSON, `x-api-key` server-side), but the gateway base URL, API key, and sanitized success/failure verification examples are missing. **No live OTP was sent or verified.** Never ask the user to paste credentials into chat; use a secure environment/secret workflow.
- Firebase dev project: `homigo-care-dev-20261010`; rules are deployed, but no approved provider or real booking record exists. Booking discovery therefore has no genuine provider data to display.
- Six legacy Vercel projects were previously observed under `rajahaider50/homigocare-mvp`: `admin-web`, `website-ywmf`, `mock-api-xqh9`, `mock-api`, `website`, and `api`. Do not overwrite or repoint them. Fresh projects linked to `rajahaider50/homigo-care-platform` have not been created. Re-check the currently authorized team before setup. A separate API staging deployment will be needed for live OTP; secure runtime configuration is still missing.
- Google is enabled in the selected Firebase project and the Sandbox development certificate was registered, but no physical-device Google Sign-In test has been performed. No Admin claim bootstrap or real Admin workflow test is recorded.
- User-provided GitHub/Vercel/Cloudinary token strings from the earlier chat are intentionally not reproduced here. Do not copy them into code or logs; recommend rotation/revocation when appropriate.

## Ordered continuation plan

1. Confirm the current feature branch and PR head from GitHub; preserve this branch and do not reset it. Review the newest commit and CI.
2. Fix the role-trust issue and origin/readiness issue above; add API, rules-emulator, and Web regression coverage. Re-run workspace typecheck, lint, tests, build, and Firestore rules tests.
3. Install the Android SDK packages in this Sandbox. The verified command-line tools are at `/home/ubuntu/Android/Sdk/cmdline-tools/latest`. Current Android CLI guidance is [officially documented here](https://developer.android.com/tools/agents/android-cli). Suggested command:

   ```bash
   export ANDROID_HOME=/home/ubuntu/Android/Sdk
   export ANDROID_SDK_ROOT="$ANDROID_HOME"
   export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
   android --sdk="$ANDROID_HOME" sdk install platforms/android-35 build-tools/35.0.0 platform-tools
   ```

   Then run `cd apps/android && ./gradlew lint testDebugUnitTest assembleDebug`; verify the APK with `apksigner` and compare its signer to the registered development fingerprint. Do not present an APK as Google-Sign-In-ready until verified. The official [Android 15/API 35 setup guide](https://developer.android.com/about/versions/15/setup-sdk) lists the required platform/build tools.
4. Obtain gateway config through a secure channel, set server-only Vercel environment variables, test actual OTP delivery/verification only with an authorized test number, and set exact allowed origins. Keep secrets out of chat, browser code, Git, and logs.
5. Inspect the Vercel team/project inventory again. Create isolated staging projects for the current repository only if the authorized team and correct monorepo roots are confirmed; preserve the six legacy projects. Configure public Firebase values and private server secrets per environment; verify actual deployments and URLs.
6. Test with authorized real accounts and genuine provider data only: registration/email verification, Google sign-in on Android, approved-provider discovery, booking persistence, role authorization, and Admin visibility. Do not fabricate live records.
7. Keep PR #1 draft until both security findings are closed, latest CI passes, live integrations are accurately described, and the owner reviews/accepts M2. Then report completion separately for Android, Public Website, and Admin; do not infer 70% from code volume.

## Files to read first

- [`PROJECT_HISTORY_AND_CONTINUATION.md`](PROJECT_HISTORY_AND_CONTINUATION.md) — cumulative decisions and current snapshot.
- [`TODO.md`](TODO.md) — milestone acceptance clauses and current blocker note.
- [`docs/EXTERNAL_SERVICE_SNAPSHOT_2026-10-11.md`](docs/EXTERNAL_SERVICE_SNAPSHOT_2026-10-11.md) — secret-free Firebase/Vercel/Cloudinary/WhatsApp facts.
- [`firebase/RULES.md`](firebase/RULES.md) and [`firebase/firestore.rules`](firebase/firestore.rules) — deployment ledger and current policy.
- [`apps/api/README.md`](apps/api/README.md) — API environment and contracts.

No Antigravity use is authorized. Do not claim production readiness, live OTP, real-device authentication, or milestone acceptance without new evidence.


## Push confirmation

The M2 source and initial handoff/history update are on the remote feature branch in commit `20de3d934aa02e29ab54df0e204cd2695d2a4dc2`. PR #1 is **open and Draft** against `fresh-rebuild`; the PR title/body describe the scope and blockers. GitHub Actions run [38084269538](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38084269538) was still **in progress** for that source commit at the last check. Do not infer success; inspect the latest run on the branch when resuming. The current source commit was pushed without force, and `fresh-rebuild` was not changed.


## CI completion update

Follow-up to the in-progress note above: GitHub Actions run [38084269538](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38084269538) completed with overall conclusion **success** for source commit `20de3d934aa02e29ab54df0e204cd2695d2a4dc2`. The Web job passed Firestore Emulator, Public Website, and Admin checks. The Android job validated the Firebase config but reported the registered development-key secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` unavailable; its Android SDK setup, native lint/unit/build, APK certificate verification, and upload steps were skipped. No Android CI APK artifact was created. This does not replace the local Android SDK/device validation still required.
