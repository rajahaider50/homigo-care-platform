# HomiGo Care — Project History and Continuation

**Updated:** 2026-10-11
**Purpose:** Preserve project decisions, verified state, and safe next steps for a future AI or developer session. Treat this document as a handover, not as permission to bypass any approval gate.

## User-authorized scope and non-negotiable constraints

- The user selected **full scope with Firebase/Firestore** as authoritative over the minimalist build kit's Express/PostgreSQL outline.
- Continue on the private repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform), active feature branch `fix/android-auth-registration-flow`, with PR #1 targeting `fresh-rebuild`. Do not replace or reset old repositories or Firebase projects; do not merge while the current security blockers remain open.
- The product is a shared Firebase/Firestore backend with three separate clients: native Android, Public Website, and protected Admin panel. Android must be real Kotlin/Jetpack Compose, not a web wrapper.
- Use genuine backend data only. Do not seed fake users, providers, availability, bookings, payments, patient records, or clinical data. Emulator-only synthetic test identities are acceptable only in the isolated Rules Emulator project.
- Never commit secrets or credentials. The Firebase Android client JSON and development signing keystore are outside the repository. Do not display them in logs or chat. The debug keystore is development-only, not a release key.
- The project follows four cumulative 25% milestones. The user authorized proceeding into M2 on 2026-10-10; M2 implementation is in progress but has not been accepted. M3 and M4 remain gated. Do not describe authorization to proceed as milestone acceptance.
- Report progress separately for Website, Admin, and Android. Scores must reflect implementation **and** verification, not code volume.

## Current M2 snapshot — 2026-10-11 (authoritative over older notes below)

- Source work is on `fix/android-auth-registration-flow`; PR [#1](https://github.com/rajahaider50/homigo-care-platform/pull/1) targets `fresh-rebuild`. This user requested that all current source and handoff instructions be pushed to GitHub. Keep the PR unmerged and mark it draft until both security findings below are fixed, relevant checks pass, and milestone status is reviewed.
- Implemented source includes the shared server-side OTP/auth API, OTP-gated Web/Android onboarding, phone/password sign-in, verified WhatsApp linking for existing Web email accounts, Public patient provider discovery/booking requests, Admin claim-gated shell, and expanded Firestore rules. Android remains native Kotlin/Compose.
- The authoritative dev project is `homigo-care-dev-20261010`. M2 Firestore rules were deployed after owner approval; the isolated Rules Emulator suite passes 15/15. No live users/providers/bookings were seeded.
- Local verification on 2026-10-11: workspace typecheck, lint, unit tests (API 17/17, Admin 3/3, Public Web 4/4), production builds, and Firestore Rules Emulator 15/15 passed. Public Website home/auth signup/care signed-out/services and Admin signed-out screens were visually reviewed. The signup page accurately shows that live WhatsApp verification is not configured and disables OTP controls.
- The final native Android rerun did not start because the active Sandbox had no Android SDK path (`ANDROID_HOME`/`sdk.dir`). A checksum-verified command-line-tools archive was unpacked under `/home/ubuntu/Android/Sdk`, but API 35/build-tools packages were not installed. An older debug APK exists, but its signer was not reverified in this latest environment; no physical-device test was performed.
- **Do not merge or deploy this code yet.** Independent review identified two concrete security/configuration blockers: client-selected profile roles can elevate account behavior (details in the handoff file), and API CORS/health readiness does not consistently fail closed when `HOMIGO_ALLOWED_ORIGINS` is absent or malformed. Keep the API undeployed until fixed and tested.
- Live WhatsApp testing remains blocked on a gateway base URL, API key, and sanitized success/failure verification responses. Six legacy Vercel projects belong to `rajahaider50/homigocare-mvp`; no fresh staging projects for this repository were created. No real provider records or approved provider exist for end-to-end booking. Do not claim the approximately 70% per-product target has been met.
- Historical entries below are retained for audit. In particular, any previous reference to using Antigravity is superseded by the user's explicit instruction not to use Antigravity; the related planning file is removed on this branch.

## Platform progress at handover

The scores below apply only to M1 scope. Four equally weighted gates are used per product; full credit requires implementation plus evidence, partial unverified implementation earns half credit, and blocked/unimplemented gates earn zero. Scores are rounded half-up.

| Product | M1 completion | Basis |
|---|---:|---|
| Public Website | **63%** | Route/UI foundation and temporary-preview smoke checks pass (1/4); Web CI checks pass (1/4); auth/action foundation exists but real Firebase runtime is unconfigured (0.5/4); Vercel deployment cannot be verified (0/4). |
| Admin Panel | **38%** | Shell, claim guard, and bounded query foundation exist but live authorization is untested (0.5/4); Admin CI checks pass (1/4); Firebase bootstrap/runtime and a protected deployment are not verified (0/4 each). |
| Native Android | **50%** | Native source, live Google provider/OAuth configuration, and Firebase-registered development fingerprints are verified. CI run `38055840563` built an APK, but its signature is the runner's default key. The workflow now requires the registered key and verifies the APK fingerprints before upload; the required secret write returned 403. Correct-signer Actions artifact and device auth/profile persistence remain unverified. |

These percentages do **not** mean the full product is 38–63% complete. Discovery/booking, Health Passport, SOS, payment review, and final stabilization remain later milestones.

## Repository and architecture

- Repository: `https://github.com/rajahaider50/homigo-care-platform`
- Working branch: `fix/android-auth-registration-flow` (PR #1 to `fresh-rebuild`)
- Source baseline before this M2 handoff update: `4fc33b6`; current M2 source/documentation changes are being committed to the feature branch, not directly to `fresh-rebuild`.
- The repo was confirmed clean before the handover edits. The authenticated GitHub user has repository admin/push permission and Actions access. The repository-local Git author email was corrected to the authenticated account's exact GitHub no-reply format for future commits; no existing commit was amended or rewritten.
- Monorepo layout:
  - `apps/android` — native Kotlin/Jetpack Compose Patient and shared Doctor/Nurse foundation.
  - `apps/public-web` — React/TypeScript/Vite Public site.
  - `apps/admin-web` — separate React/TypeScript/Vite protected Admin panel.
  - `packages/design-system` — supplied HomiGo brand assets/tokens.
  - `firebase` — project aliases and Firestore rules; no Firebase Hosting or Storage.
  - `tests/firestore` — isolated Firestore Rules Emulator tests.
  - `.github/workflows/ci.yml` — Web/Rules CI plus secret-gated Android CI.
  - `docs/FEATURE_AUDIT.md`, `docs/IMPLEMENTATION_MATRIX.md`, `TODO.md` — current scope and evidence ledgers.
- CI uses Node 22, pnpm 11.25.0, and Java 21. Web scripts run typecheck, lint, tests, and production builds. Android requires both Firebase config and registered development-keystore secrets, validates key fingerprints, then validates the APK signer before upload.

## Project history and verified decisions

1. The supplied build-kit ZIP and directive were audited. The user explicitly selected full scope with Firebase/Firestore, overriding the kit's minimalist Express/PostgreSQL option.
2. A private monorepo was created/cloned and work continued on its existing `fresh-rebuild` branch. Old repos and projects were preserved.
3. The user approved the new Firebase development project `homigo-care-dev-20261010` in `asia-southeast1` (Singapore). The project remains on Firebase Spark; Analytics and Gemini are disabled. No billing upgrade or production project mutation was made.
4. Android (`pk.homigocare.android`) and a shared Web app were registered. A unique development-only debug signing certificate was generated outside Git and registered in Firebase. Google sign-in was enabled; the Android config was refreshed afterward to include OAuth client metadata.
5. The default Firestore database is Standard (Native), created in production mode with last-verified deny-all rules. Profile-aware repository rules pass 8/8 isolated Emulator tests. The live Console Rules editor did not render source during the latest check; no rules were deployed, no records were seeded, and no user data was written.
6. Native Android, Public Website, and Admin foundations were implemented. Public preview smoke checks previously returned HTTP 200 on `/`, `/services`, `/auth`, and `/auth/action`. Admin remains sign-in-only and claim-gated in source; no public Admin registration was added.
7. CI run [38055840563](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38055840563), on commit `837af9b`, passed Web and Firestore Rules checks plus the expected project/package/OAuth config validation, Android SDK setup, lint, unit tests, `assembleDebug`, and artifact upload. Private 7-day artifact: `homigo-care-debug-apk-837af9b35da552d02214476a4fcef8881ce08a43`. The downloaded APK is 15,371,248 bytes, SHA-256 `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`. CI uses the runner's default debug key, not the Firebase-registered development key.
8. The task was reauthorized and access retried. GitHub repo/branch, push/admin permission, workflow, run, and Actions read access work. Secret listing and a user-authorized stdin-only write attempt returned HTTP 403 (`Resource not accessible by integration`); no value was read or written by this integration. Run `38055840563` validates that the config available to CI matches the expected development project, Android package, and OAuth metadata without printing identifiers. The exact secret remains unreadable through the API.
9. The Vercel connector now identifies the `rajahaider50` Hobby team, but `list_projects` returned zero projects both with a HomiGo filter and for the whole team. Git deployment context lists no linked projects/origin connections. Lookups for historical project names `homigo-care-public-staging` and `homigo-care-admin-staging` return 404. Previous records said deployments were blocked, but their present existence/status and URLs cannot be confirmed from the reauthorized account.
10. WhatsApp OTP remains blocked until the user supplies a sanitized Java sample/API contract. The initial Admin bootstrap email is pending. Cloudinary server-side signed uploads need a secure runtime secret and belong to later work.

## Current external-service state

### GitHub

The authenticated GitHub user is `rajahaider50`; repository access and push permission were confirmed. Secret management endpoints remain inaccessible to this integration (403), but run `38055840563` validated the available configuration without exposing values. Web, Rules, and native Android checks passed, and the workflow uploaded private artifact `homigo-care-debug-apk-837af9b35da552d02214476a4fcef8881ce08a43` with 7-day retention. The verified APK SHA-256 is `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`. It uses the runner's default debug key because `HOMIGO_DEV_DEBUG_KEYSTORE` is not configured; do not claim Google Sign-In is ready.

**Continuation:** the APK from run [38055840563](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38055840563) was downloaded and integrity-checked; SHA-256 is `c69f646d1756492ec809afe0bb2b429ff0f0337ad064e49e8e4f75e27ad09478`. The GitHub artifact expires after seven days. For Google Sign-In, use a build signed with the registered development key and perform an authorized on-device test; the available CI signer is not Firebase-registered.

### Vercel

The only team visible after reauthorization is `rajahaider50`'s Hobby team, and it contains zero projects and zero Git-linked project contexts in the current connector response. Thus no current Vercel build configuration, environment values, deployment status, or public URL can be validated. Earlier project names and blocked deployment URLs are historical only.

**Continuation:** ask the user to reconnect/select the Vercel account/team that contains the two HomiGo projects and confirm its GitHub organization/repository link. Then inspect existing projects and latest deployments. Preserve Admin SSO/protection. Do not create substitute projects, change billing, expose runtime secrets, or report a URL as live unless a successful deployment and HTTP response are verified.

### Firebase

- Project: `homigo-care-dev-20261010`; region: `asia-southeast1`.
- Android package: `pk.homigocare.android`; Android and Web app registrations exist.
- Google provider is enabled; Email/Password provider and Web runtime values are still pending.
- Live rules are deny-all. Do not deploy the repo's profile-aware rules until the exact rules are shown to the user and they explicitly approve the change.
- Keep the development and production Firebase projects separate. No account reset, fake data, or production rule change is authorized.

## Immediate next steps

1. Add the repository Actions secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` using a single-line Base64 encoding of the private development keystore; never paste the value into chat or commit the key.
2. Once saved, rerun `ci.yml` on `fresh-rebuild` using `workflow_dispatch`. The workflow will verify the registered key and final APK fingerprints, then upload a private artifact only if they match. Install it on an authorized Android device and test Google sign-in and owner-only profile persistence.
3. Reauthorize/select the Vercel account/team that owns the existing Public and Admin projects. Inspect only those projects after visible; do not create replacements.
4. Google is enabled, but Email/Password is currently disabled. Ask the user before changing that sign-in behavior; configure Web runtime values only in the correct secure environments.
5. Keep Firestore rules undeployed until the exact payload is reviewed and explicitly approved. The candidate policy passes 8/8 isolated Emulator tests; live access remains deny-all per the last verified state.
6. Obtain the initial Admin email and sanitized WhatsApp API contract when ready. Keep all M2–M4 work paused until M1 acceptance and explicit approval.

## Safety notes

- Never commit `google-services.json`, keystores, service-account credentials, runtime `.env` files, or API secrets. Keep the refreshed Android client config and development keystore outside Git; `apps/android/app/google-services.json` is intended to be ignored.
- Never run live Firestore writes as test data. All shared-data testing must use actual authorized records only.
- Do not disable Admin protections, impersonate a user, alter billing, deploy unreviewed rules, or claim a deployment/APK/auth flow passed without evidence.
- The available CI debug APK is not signed with the Firebase-registered development key unless `HOMIGO_DEV_DEBUG_KEYSTORE` is explicitly provided through an authorized secure workflow; do not ship it as Google-Sign-In-verified.
- The repo's Git author identity correction applies only to future commits; old commit authorship has not been rewritten.

## Useful references

- [M1 status report](M1_IMPLEMENTATION_STATUS_2026-10-10.md)
- [Feature audit](docs/FEATURE_AUDIT.md)
- [Implementation matrix](docs/IMPLEMENTATION_MATRIX.md)
- [Acceptance ToDo](TODO.md)
- [GitHub Actions](https://github.com/rajahaider50/homigo-care-platform/actions)


## Latest verification update (2026-10-10)

This snapshot supersedes earlier progress and blocker notes wherever they differ.

- **Current M1 scores:** Public Website **63%** (2.5/4), Admin Panel **38%** (1.5/4), native Android **50%** (2/4). M1 remains open; M2 remains paused.
- **Local checks:** Firestore Rules Emulator 8/8; Public and Admin typecheck, lint, tests, and production builds pass. Fresh local previews returned HTTP 200 for the Public root, services/auth/action routes and route manifest, and for the Admin root. The temporary external Vite host check returned 403 due to Vite host validation; this is not a Vercel deployment or an authentication test.
- **Google OAuth:** Live Firebase Console lists Google as enabled. The Web client ID field is populated; the client secret was masked and not read. The registered development fingerprints match the local key: SHA-1 `F4:4A:F8:1E:50:99:63:1E:5C:49:A2:78:D0:7B:BD:13:57:35:98:E9`; SHA-256 `09:BF:4F:EC:5B:FE:A4:23:0E:27:B7:20:36:3C:46:74:CE:BA:54:7E:8E:FD:79:8D:14:44:C2:63:E6:C2:AF:40`. The refreshed Android JSON contains both Android and Web OAuth client types. Email/Password is not enabled. No real-device sign-in has been tested; the Sandbox has no Android SDK or `adb`.
- **GitHub secrets and APK:** Retried stdin-only writes for `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` and `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON`; both returned HTTP 403. The existing Firebase config secret was available to CI run `38055840563` and passed metadata validation. The existing downloaded APK is integrity-verified but signed with the runner's default key, not the registered certificate. CI now fails closed: it requires the registered key, checks its fingerprints, checks the final APK signer, and uploads only a matching APK. A correctly signed Actions artifact does not yet exist.
- **Vercel:** The reauthorized Hobby team has zero projects and no Git-linked deployment context; historical Public/Admin project lookups return 404. No replacement projects were created. The user must authorize the team/account containing the existing projects.
- **Firestore:** No shared data or rules changed. The candidate profile-aware policy passes 8/8 isolated tests, including anonymous/patient list denial, unverified-admin denial, and health/payment namespace denial. The live database's Data view showed no documents. The live Rules editor source did not render; the prior verified production-mode deny-all state remains the basis for status. Firebase CLI has no authorized account in the Sandbox.

**Required owner actions:** add `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` in repository Settings → Secrets and variables → Actions (single-line Base64 of the private development keystore; never paste the value in chat), then request a `ci.yml` rerun. Reconnect the correct existing Vercel team/project. Decide whether Email/Password should be enabled. No rules deployment or M2 work is authorized by this update.


## Follow-up CI verification (2026-10-10)

The fail-closed workflow and security tests are committed on `fresh-rebuild` at `e6249c9`. GitHub Actions [run 38057851529](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38057851529) completed overall success: Firestore Emulator, Public Website, and Admin Panel jobs passed. Android Firebase config validation passed, but the workflow reported `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` absent; Android SDK setup, native build, APK fingerprint verification, and upload were skipped. Artifact count was **zero**. This is safe behavior; the previous runner-signed APK is still the only build artifact and is not registered for Google Sign-In.

For direct source verification, the live [Firebase Android app settings](https://console.firebase.google.com/project/homigo-care-dev-20261010/settings/general/android:pk.homigocare.android) show the SHA-1/SHA-256 listed above. The live [Firestore Rules page](https://console.firebase.google.com/project/homigo-care-dev-20261010/firestore/databases/-default-/security/rules) did not render its source during review; no rules were deployed. Owner action remains to add the Base64 development key in [GitHub Actions secrets](https://github.com/rajahaider50/homigo-care-platform/settings/secrets/actions), then request a workflow rerun. M1 remains open and M2 remains paused.

## Follow-up implementation in progress (2026-10-10)
The owner clarified that implementation should proceed alongside Antigravity platform setup. The previous M1 scores remain milestone-specific: Public Website 63%, Admin 38%, native Android 50%; do not describe these as full-product completion. A separate handoff checklist was added at `ANTIGRAVITY_PLATFORM_SETUP_TASKS.md` for Firebase, Cloudinary, GitHub Actions/APK signing, and existing Vercel projects. It requires inspecting current ownership, preserves the dev/prod separation, disallows replacement projects and secret disclosure, flags a Firebase Firestore location discrepancy (`asia-southeast1` in historical status vs `asia-south1` in `firebase/firebase.json`), and lists exact verification criteria.

A focused Android auth fix is on feature branch `fix/android-auth-registration-flow` from starting head `3906b045ebbcda0f0dd8472a4e2bd95ca3eeadff`. Files: `MainActivity.kt`, new `auth/AuthFlowPolicy.kt`, new `AuthFlowPolicyTest.kt`. Unverified account creation now routes to email verification instead of the verified-only profile flow; missing Google client-ID resource is surfaced as a recoverable UI message. Native lint, unit tests (6/6), and debug build passed locally after installing Android SDK/JDK tooling. For compile only, a temporary dummy `google-services.json` was created and automatically removed; it must not be used for live auth or deployment. No emulator/device is attached, so the reported crash and Google Sign-In remain unverified. The APK build uses no owner-provided config/registered signer and is not deliverable for device auth verification.

The requested platform task list is in `ANTIGRAVITY_PLATFORM_SETUP_TASKS.md`. Outstanding: inspect/reconfigure existing Firebase and Vercel projects only with Antigravity permissions, owner-approve any Firestore rules deployment, set the registered keystore secret through GitHub secure settings, and provide the OTP API key only when server-side connection testing is ready. Next: run full repo CI on this feature branch, review/push changes, then update this history with exact commit/run evidence. Do not claim full-product 70% completion or authentication/device acceptance based on compilation.

### Verified feature-branch check results (2026-10-10)
The following checks passed on local feature branch `fix/android-auth-registration-flow` from base `3906b045`: Android `lint`, `testDebugUnitTest` (2 test classes, 6 tests passed), and `assembleDebug`; monorepo `pnpm typecheck`, `pnpm lint`, `pnpm test` (7 Web tests passed), `pnpm build` (Public/Admin succeeded, existing >500 kB chunk warnings), and `pnpm test:rules` (Firestore Emulator 8/8). The Android build used an isolated dummy Firebase JSON solely so the Gradle plugin could configure resources; the file was automatically removed and is not valid for service use. `adb devices -l` listed no devices. Therefore no device crash reproduction, actual Firebase login, Google Sign-In, registered-certificate verification, or deliverable APK has been achieved.

The branch has not yet been pushed or reviewed as of this entry. Next: inspect staged diff/secrets, commit and push only this feature branch, open a PR to `fresh-rebuild`, inspect feature-branch Actions job details (Android job may skip due missing owner signing secret), and update this history with exact commit and CI results. Do not merge without reviewing CI and source diff. Mainline `fresh-rebuild` remains unchanged at base commit until a reviewed merge.

### Pull request and hosted CI result (2026-10-10)
Feature implementation commit `401ca65846d6bc8aa1189157b67e59fdca5a2f3b` was pushed to `fix/android-auth-registration-flow`; [PR #1](https://github.com/rajahaider50/homigo-care-platform/pull/1) is open against `fresh-rebuild` and mergeable, not merged. GitHub Actions [run 38065423373](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38065423373) completed with both workflow jobs concluding success. Web/Rules CI completed, including Emulator, Public, and Admin checks. Android job checked Firebase config and reported missing `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64`; Android SDK setup, native lint/tests/build, signer verification, and artifact upload were skipped. Thus hosted CI success does not mean Android ran in CI; local Android checks passed separately as detailed above. No CI artifact was produced. Review the PR and do not merge until an authorized reviewer accepts it; user-facing claim remains limited to source-level flow correction plus local tests, not real-device crash/Google Sign-In validation.

### Final PR head snapshot (2026-10-10)
The branch was subsequently updated with documentation-only commit `324839497b130b62979507cc466cd4426d46d5e2`. Current PR #1 head is `3248394`, base `fresh-rebuild` remains `3906b04`, PR state OPEN and mergeable; it has not been merged. Latest CI run [38065526937](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38065526937) completed with both check jobs successful. As in the source commit's run, the Android job's overall success is fail-closed: Firebase config validation succeeded, signing secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` was absent, and native CI build/signature/artifact steps were skipped. The Web/Rules check passed. Local native lint/tests/build remain the only Android build evidence for this source change; no CI APK or device authentication verification exists.


## M2 implementation and handoff update (2026-10-11)

The user requested that feature work stop at this point, all current source be pushed to GitHub, and a continuation guide be saved for the next AI. The current branch is `fix/android-auth-registration-flow`, with open PR #1 against `fresh-rebuild`; this update must remain unmerged until the security findings are fixed. No Antigravity was used. The old Antigravity task-list file is removed on this branch because the user explicitly prohibited its use.

**Implemented source in this branch:** shared Vercel Node API for WhatsApp OTP, OTP-gated registration, phone/password sign-in and one-use verification proofs; native Kotlin/Compose auth, WhatsApp linking and patient provider-discovery/booking slice; Public Website OTP-aware auth and `/care` workflow; updated Admin claim-gated shell copy; expanded Firestore rules and emulator coverage; truthful home/services copy and Cloudinary brand lockup. No secret files are intended for Git.

**Checks actually passed on 2026-10-11:** `pnpm typecheck`; `pnpm lint`; workspace tests (API 17/17, Admin 3/3, Public Web 4/4); `pnpm build`; `pnpm test:rules` (15/15). Visual QA covered Public home, sign-in/sign-up pending-gateway notice, signed-out care, services, and Admin signed-out access. The last Android Gradle attempt stopped before compilation because the active Sandbox had no Android SDK path. Official command-line tools were checksum-verified and extracted to `/home/ubuntu/Android/Sdk/cmdline-tools/latest`, but API 35/build-tools were not installed. No physical device, live WhatsApp OTP, or live booking test was available.

**Independent read-only security review found two hard blockers:** (1) `apps/api/api/v1/auth/register.ts` accepts a client-selected role, stores it only in server-private `phone_index.accountRole`, while `firebase/firestore.rules` permits a verified user to create a profile as either `patient` or `professional`; the profile role then drives patient/professional authorization. Bind roles to a trusted server-side claim/profile or make public registration patient-only, then add direct negative tests. (2) `apps/api/src/http.ts` falls back to localhost origins when `HOMIGO_ALLOWED_ORIGINS` is absent and does not validate origin syntax, while `/api/health` independently considers any non-empty string list configured. Use one fail-closed exact-origin validator for readiness and handlers; preserve no-Origin requests for native Android and reject malformed/unapproved browser origins. Add route tests. Do not merge/deploy until these are fixed.

**External gaps:** the selected Firebase dev project's M2 rules are deployed after owner approval and pass emulator tests, but no live records were seeded. No real approved provider exists. WhatsApp gateway base URL/API key and sanitized success/failure verification response examples are still missing; no live OTP was tested. Six legacy Vercel projects remain tied to `rajahaider50/homigocare-mvp`; no fresh staging projects for the current repository have been created. No physical Android device test or end-to-end Google Sign-In has been performed. Do not claim approximately 70% completion for any product yet.

The full ordered handoff, exact source paths, SDK command, security fixes, and acceptance steps are in [`NEXT_AI_HANDOFF_2026-10-11.md`](NEXT_AI_HANDOFF_2026-10-11.md). This update supersedes the older M1-only state entries above wherever they conflict. The final pushed PR head and CI run must be recorded after GitHub push; older successful PR checks do not cover this full M2 update.


### Push confirmation — 2026-10-11

The M2 source and initial handoff/history update were pushed to `fix/android-auth-registration-flow` as commit `20de3d934aa02e29ab54df0e204cd2695d2a4dc2`. PR #1 remains open and is Draft, retitled `M2: auth and booking slice (security follow-up required)`; its body records the security blockers and verification limits. GitHub Actions run [38084269538](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38084269538) was **in progress** for commit `20de3d9` at the last check; do not infer its result. A later documentation-only commit may trigger a newer run, so inspect the latest checks before continuing. The push was non-force; `fresh-rebuild` was not changed.


### CI completion update — 2026-10-11

Run [38084269538](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38084269538) for source commit `20de3d934aa02e29ab54df0e204cd2695d2a4dc2` completed with overall conclusion **success**. The Web job passed Firestore Emulator, Public Website, and Admin checks. The Android job validated the Firebase config, but the registered debug-keystore secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` was unavailable; therefore Android SDK setup, native lint/unit/build, signer verification, and APK upload were skipped. This run produced no Android artifact and is not evidence of an Android CI build or device test.


## 2026-10-11 — security hardening, Vercel project setup, and Android debug APK

Continued the user's request to host the two web products and provide an APK. Before any public deployment, re-reviewed the two known security findings and corrected them in the feature branch source:

- Registration now issues Firebase custom claim `account_role` from the selected role; WhatsApp linking gives an existing account a bounded account role; phone/password login verifies the private phone-index role matches the Firebase custom claim.
- Firestore profile creation now requires `request.resource.data.role == request.auth.token.account_role` for the allowed `patient`/`professional` roles. Added emulator regression cases for both mismatched directions and a valid professional claim.
- Replaced the API origin fallback with a shared strict allowlist parser; exact HTTPS origins only in production, HTTP loopback only outside production, browser-origin requests fail closed when config is missing/invalid, native no-Origin requests remain supported, and `/api/health` uses the same parser. Added HTTP/CORS regression tests.
- Tests/build evidence from the Sandbox: full workspace test/typecheck/lint/build passed; Firestore emulator passed 16/16. API-only tests and typecheck passed again after the production-loopback regression was added. Public/Admin Vite builds report only existing non-blocking bundle-size warnings.
- Installed official Android SDK packages and ran `./gradlew --no-daemon lint testDebugUnitTest assembleDebug`: passed. Debug APK: `/home/ubuntu/HomiGoCare-debug-2026-10-11.apk`, 15,976,972 bytes, SHA-256 `03cd1ec4da33ffee03db2d059a96508d7cd559d5bc98b052e098cca7975231d2`. The Sandbox default debug certificate did not match the registered dev signer fingerprints checked here, and the build had no `HOMIGO_API_BASE_URL`; it is a debug build only, not confirmed Google-Sign-In or WhatsApp-ready.
- Created Vercel projects `homigo-care-public` (`prj_6EIHM1Ahdhu4q6Lxb4e9gVUK7L2N`, root `apps/public-web`) and `homigo-care-admin` (`prj_oCSD3AcSxrwZHgt70BThKg8EAetZ`, root `apps/admin-web`), both linked to `rajahaider50/homigo-care-platform`. Set only public Firebase Web configuration and the official Cloudinary logo URL on Production/Preview. No deployment was created; both projects still show production branch `fresh-rebuild`, and default SSO protection remains enabled. Six projects under the distinct `homigocareo-mvp` repository were not touched.
- The corrected `firebase/firestore.rules` has passed emulator tests but is not deployed remotely. Its access policy change must be reviewed and explicitly approved by the owner before redeploy. Do not expose the feature source publicly until that rule version is deployed and verified. Do not deploy the OTP API without server-only Firebase Admin/proof-secret variables, approved exact origins, and the actual gateway base URL/key/sample responses; none were present here. Vercel Projects are created but no public website links are claimable yet.
- PR #1 remains draft; do not merge to `fresh-rebuild`. Recheck and push the current source/docs, then review newest CI; prior Android GitHub job skipped actual compilation/signing. No provider records, booking records, or test OTPs were created/sent.


## 2026-10-11 — automatic Vercel deploy check and CI completion

GitHub Actions run `38108324820` for commit `83d490f488f4282df40d39edbd167fc2d3670d71` completed overall success. Web typecheck/lint/tests/build and Firestore Emulator passed. The Android CI job restored/validated Firebase config but skipped SDK/native lint/build/APK upload because the required repository secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` is unavailable; its success status is not evidence of a CI-built APK. Local Android lint/unit/debug APK had passed earlier, but the local signer is not Firebase-registered.

Pushing the feature branch automatically triggered Vercel Production-target deployments (without a separate manually requested deployment call). Admin deployment `dpl_EpY95ac97NEV3rZzMvPEHQkcHSsk` reached READY at stable alias `https://homigo-care-admin.vercel.app/`; anonymous HTTP returned 200 and the browser showed only the existing verified-email/Admin-custom-claim sign-in shell, no data. The Public deployment `dpl_EnUoRbXLGFLaDoyNGTrH4rzVUyQu` was still BUILDING at the last check; its project was switched to SSO protection `all` before it could be exposed, because the revised Firestore role-claim rules are not yet owner-approved/deployed. The current Vercel project still reports `fresh-rebuild` as its configured production branch even though the automatic deployment metadata points to feature ref `fix/android-auth-registration-flow`; do not claim the branch setting changed.

Visual QA caught a stale Admin footer claiming the newest Firestore rules were deployed. That copy has now been corrected locally to say the current emulator-tested role-claim rules await owner approval before deployment. This last footer correction and corresponding handoff notes are not yet pushed at this entry point. No live WhatsApp OTP/API deployment, Android device test, provider record, or booking record was created.


## 2026-10-11 — post-merge follow-up and Vercel preview readiness

GitHub now reports PR #1 merged by repository owner `rajahaider50` at `2026-10-11T03:27:54Z`, merge commit `3617e987c4b482bbe365a04c1672a2d9713198b0`. This agent did not issue a merge command. The later commit `c7832ca3b8522f5b7bafbb2df220e6694bd3b314` is pushed to `fix/android-auth-registration-flow` and is tracked by draft follow-up PR #2. PR #2 carries the truthful Admin footer and latest handoff/snapshot updates; its Web CI was pending at the last check. Admin Web tests/typecheck/lint/build passed locally after the footer edit.

Vercel follow-up deployment `dpl_6NYHXqcfxxzYkWffsjKGqS7VizTA` (Public) and `dpl_H7uYF1ArPJwvLFTbuJZiE1TgSY83` (Admin) from `c7832ca` are both READY. The Public preview alias is behind SSO because the Public project has `ssoProtection: all`; the newer rules remain awaiting owner approval and are not deployed. The Admin stable alias remains `https://homigo-care-admin.vercel.app/` and only exposes the verified-email/Admin-claim sign-in shell; the Admin follow-up preview contains the truthful footer copy. No broad public-access switch, Firebase rules deployment, API deployment, gateway call, or booking write was performed.
