# HomiGo Care — Next AI Handoff (2026-10-11)

> **اردو خلاصہ (current override, 2026-10-11 08:34 UTC):** M2 source کے PR #1 اور follow-up PR #2 کو repository owner نے `fresh-rebuild` میں merge کیا؛ merge commits `3617e98` اور `e1708dc` ہیں (اس agent نے merge نہیں کیا)۔ Latest CI run `38108697367` کامیاب؛ Web/Rules پاس، Android native build/signing steps protected keystore secret غائب ہونے سے skip۔ Corrected role-claim Firestore rules emulator-tested ہیں مگر remote پر redeploy نہیں ہوئیں؛ مالک کی واضح منظوری درکار ہے۔ Admin stable URL login-gated ہے؛ Public deployment/preview SSO all کے پیچھے ہے۔ Debug APK موجود ہے مگر signer Firebase dev signer سے match نہیں کرتا اور API base URL/gateway config غائب ہے۔

## Purpose and user constraints

Continue the private repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform). The active feature branch is `fix/android-auth-registration-flow`; [PR #1](https://github.com/rajahaider50/homigo-care-platform/pull/1) targets `fresh-rebuild`.

The user wants all implementation handled by this agent, **not Antigravity**. Keep Android native Kotlin/Jetpack Compose (never a WebView). Use the selected Firebase development project `homigo-care-dev-20261010`; preserve existing production/legacy projects. Do not seed fake users, providers, bookings, patient data, or clinical data. Never commit or print secrets, `.env.local`, `google-services.json`, keystores, or service-account files. The user's approximate goal is 70% functional completion for each product, but **this handoff does not establish that 70% has been reached**. Report implementation and verification separately for Android, Public Website, and Admin.

The user asked to push current source, host Public/Admin, and provide an Android APK. PR #1 and follow-up PR #2 were merged by the repository owner. The changed Firestore rules still need explicit owner approval before remote redeployment. Keep Public SSO protection on until those rules are deployed and verified; do not expose Public registration sooner.

## What is implemented in the current M2 source

- **Shared API (`apps/api`, `@homigo/api`):** Vercel Node handlers for OTP send/verify, account registration, and phone/password sign-in. It keeps gateway credentials server-side, uses HMAC-derived rate-limit bucket identifiers, issues expiring one-use HMAC proofs, and fails closed on unknown gateway verification responses.
- **Native Android:** Kotlin/Compose auth changes, OTP-gated registration, phone/password sign-in, WhatsApp linking for existing accounts, and a patient-care slice that discovers approved professionals and writes booking requests through Firestore. No WebView was introduced.
- **Public Website:** Email/password and Google auth options, WhatsApp-gated registration, phone/password sign-in, WhatsApp linking, and a `/care` discovery/booking page. The auth page checks `/api/health`; when secure OTP configuration is missing/unreachable it tells the user and disables OTP controls without disabling ordinary existing-account sign-in. Home/service messaging was corrected to avoid claiming live gateway or provider availability. The official Cloudinary lockup is visible through an optimized delivery URL.
- **Admin Panel:** Existing email-verified custom-claim gate remains in place. Stable alias is accessible only as a sign-in shell while signed out; a prior screenshot still showed the older rules-status footer, while the follow-up preview has accurate pending-approval copy. A real Admin/provider/booking workflow has not been demonstrated.
- **Firebase:** Baseline M2 Firestore rules were deployed to the selected **development** project after owner approval. New role-claim-bound rules pass the emulator but are **not deployed**. No live records were seeded.

## Verification actually performed

On 2026-10-11, the following local commands passed (including the corrective security patch):

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`: API **22/22** at the full-suite run before the final production-only origin test was added; that test is covered by the subsequent API-only run. Admin **3/3**, Public Web **4/4**
- `pnpm build` (Public and Admin production builds succeeded; Vite reported non-blocking large-chunk warnings)
- `pnpm test:rules`: Firestore Rules Emulator **16/16** (includes role/claim mismatch checks)

Visual walkthrough: Public home, sign-in, account-creation warning state, signed-out `/care`, and services page; Admin signed-out protected entry. The signup warning was visible and the OTP-send button disabled while the secure verification service was not configured. No real credentials were submitted and no OTP was sent.

Android SDK was installed from Google's official packages. `cd apps/android && ./gradlew --no-daemon lint testDebugUnitTest assembleDebug` passed and produced a 15.98 MB debug APK at `apps/android/app/build/outputs/apk/debug/app-debug.apk`, copied to `/home/ubuntu/HomiGoCare-debug-2026-10-11.apk` (SHA-256 `03cd1ec4da33ffee03db2d059a96508d7cd559d5bc98b052e098cca7975231d2`). The APK is structurally valid, but the local default debug certificate did **not** match the registered Firebase development signer fingerprints checked in this session; Google Sign-In must not be represented as device-ready. It also has no `HOMIGO_API_BASE_URL`, so server-backed WhatsApp OTP/linking is unavailable. No physical Android device is attached.

Latest GitHub Actions run [38108697367](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38108697367) for commit `b8657a7` completed overall **success**. Web typecheck/lint/tests/build and Rules Emulator passed. Android job validated config, but SDK setup/native lint/build/signature verification/APK upload were skipped because repository secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` was unavailable. Local Android build passed separately; the local signer did not match Firebase.

## Security findings — code fixed; Firebase redeployment awaits owner approval

### 1. Registration role is not authoritative

The original issue was that registration accepted a client role stored only in `phone_index.accountRole`, while Firestore trusted the client-created profile role. The local corrective implementation now also issues `account_role` as a Firebase custom claim in registration, the existing-account WhatsApp claim flow establishes a bounded role, phone sign-in checks its phone-index role matches the claim, and `firebase/firestore.rules` requires profile role to equal the trusted token claim.

Regression coverage was added to the Firestore Rules Emulator for both mismatched directions and a valid professional role claim. The Rules Emulator now passes **16/16**. These changed rules are only local/source control at this point; the deployed development project still has the prior rules version.

**Next action:** obtain explicit owner approval for the exact role-claim rule change before deploying `firebase/firestore.rules` to `homigo-care-dev-20261010`. Review legacy accounts that have no `account_role` claim and test authorized sign-in/profile creation after claim refresh.

### 2. API origin configuration and health readiness disagree

The original API-origin/readiness mismatch is fixed in source: a shared strict exact-origin parser is used by `applyCors` and `/api/health`; deployed origins require HTTPS; HTTP loopback is only permitted outside production; browser requests fail closed if the allowlist is absent or invalid; no-Origin native calls remain supported. Regression tests cover these cases.

API-only tests/typecheck pass after the fix. The live gateway/API is still not deployed; gateway URL/key and OTP proof secret are not available, so no real OTP has been sent.

Keep PR #1 draft and do not deploy the public apps until the corrected Firestore rules are approved and deployed. Do not deploy the API without its server-only Firebase Admin, exact origin, proof-secret, and real gateway settings.

## External integration gaps

- The WhatsApp request contract is documented and unit-tested (digits-only Pakistani number in the upstream JSON, `x-api-key` server-side), but the gateway base URL, API key, and sanitized success/failure verification examples are missing. **No live OTP was sent or verified.** Never ask the user to paste credentials into chat; use a secure environment/secret workflow.
- Firebase dev project: `homigo-care-dev-20261010`; baseline M2 rules are deployed, but the newly tested role-claim rules await owner approval and deployment. No approved provider or real booking record exists, so discovery has no genuine provider data.
- Six legacy Vercel projects remain under `rajahaider50/homigocare-mvp`; do not overwrite/repoint them. New Public/Admin projects are linked to `rajahaider50/homigo-care-platform`, roots `apps/public-web` and `apps/admin-web`, with public Firebase client config and official brand URL. PR #1/#2 merge commits are `3617e98`/`e1708dc`. At 08:33 UTC, latest `fresh-rebuild` Admin deployment was READY and Public deployment BUILDING; the stable Admin URL returned HTTP 200 and showed only the Admin-claim-gated sign-in shell (its footer still appeared to be the older wording). Public project SSO protection is `all`; anonymous Public alias requests redirect to Vercel SSO. Previews from `c7832ca` and `b8657a7` were READY: Public `https://homigo-care-public-git-fix-android-auth-reg-1f2b37-rajahaider50.vercel.app/`, Admin `https://homigo-care-admin-git-fix-android-auth-regi-b36779-rajahaider50.vercel.app/`. Do not assume Vercel's reported Production branch changed from `fresh-rebuild`. A separate API deployment/runtime config remains missing.
- Google is enabled in the selected Firebase project and the Sandbox development certificate was registered, but no physical-device Google Sign-In test has been performed. No Admin claim bootstrap or real Admin workflow test is recorded.
- User-provided GitHub/Vercel/Cloudinary token strings from the earlier chat are intentionally not reproduced here. Do not copy them into code or logs; recommend rotation/revocation when appropriate.

## Ordered continuation plan

1. Confirm the current feature branch and PR head from GitHub; preserve this branch and do not reset it. Review the newest commit and CI.
2. Review the locally implemented role-claim and origin/readiness corrections, their new tests, and exact Firestore diff. Obtain owner approval, then deploy the rules to the dev project and verify existing accounts/claim refresh.
3. Android SDK/build are already installed and verified; before claiming Google Sign-In readiness, obtain the correct registered debug keystore securely and rebuild, or register this exact sandbox certificate with owner approval. Then test on a physical device.

4. Obtain gateway config through a secure channel; set server-only API variables, exact allowed Vercel origins, and test OTP delivery only with an authorized test number. Keep secrets out of chat, browser code, Git, and logs.
5. At last check, latest `fresh-rebuild` Admin deployment was READY and Public deployment was BUILDING. Keep Public project SSO `all` until Firebase rule approval/deployment; then enable intended public access and verify readiness. Admin stable alias is publicly reachable but only exposes the verified-Admin login shell; check its footer after the new build.
6. Test with authorized real accounts and genuine provider data only: registration/email verification, Google sign-in on Android, approved-provider discovery, booking persistence, role authorization, and Admin visibility. Do not fabricate live records.
7. PR #1 and PR #2 were both merged by repository owner `rajahaider50` (merge commits `3617e987c4b482bbe365a04c1672a2d9713198b0` and `e1708dcd505584ee898877b3b251186721a78195`); this agent did not merge them. No follow-up PR was open at the last check. The latest run passed Web/Rules; Android build/signing was skipped due missing protected keystore secret. The Firebase rules still need explicit owner approval/deployment. Report completion separately for Android, Public Website, and Admin; do not infer 70% from code volume.

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
