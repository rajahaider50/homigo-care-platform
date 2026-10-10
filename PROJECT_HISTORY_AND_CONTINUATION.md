# HomiGo Care — Project History and Continuation

**Updated:** 2026-10-10
**Purpose:** Preserve project decisions, verified state, and safe next steps for a future AI or developer session. Treat this document as a handover, not as permission to bypass any approval gate.

## User-authorized scope and non-negotiable constraints

- The user selected **full scope with Firebase/Firestore** as authoritative over the minimalist build kit's Express/PostgreSQL outline.
- Continue on the private repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform), branch `fresh-rebuild`. Do not replace or reset old repositories or Firebase projects.
- The product is a shared Firebase/Firestore backend with three separate clients: native Android, Public Website, and protected Admin panel. Android must be real Kotlin/Jetpack Compose, not a web wrapper.
- Use genuine backend data only. Do not seed fake users, providers, availability, bookings, payments, patient records, or clinical data. Emulator-only synthetic test identities are acceptable only in the isolated Rules Emulator project.
- Never commit secrets or credentials. The Firebase Android client JSON and development signing keystore are outside the repository. Do not display them in logs or chat. The debug keystore is development-only, not a release key.
- The project follows four cumulative 25% milestones. M1 is Foundation & First Vertical Slice; M2, M3, and M4 are not started and require acceptance of the preceding milestone. No M2 work without explicit M1 acceptance.
- Report progress separately for Website, Admin, and Android. Scores must reflect implementation **and** verification, not code volume.

## Platform progress at handover

The scores below apply only to M1 scope. Four equally weighted gates are used per product; full credit requires implementation plus evidence, partial unverified implementation earns half credit, and blocked/unimplemented gates earn zero. Scores are rounded half-up.

| Product | M1 completion | Basis |
|---|---:|---|
| Public Website | **63%** | Route/UI foundation and temporary-preview smoke checks pass (1/4); Web CI checks pass (1/4); auth/action foundation exists but real Firebase runtime is unconfigured (0.5/4); Vercel deployment cannot be verified (0/4). |
| Admin Panel | **38%** | Shell, claim guard, and bounded query foundation exist but live authorization is untested (0.5/4); Admin CI checks pass (1/4); Firebase bootstrap/runtime and a protected deployment are not verified (0/4 each). |
| Native Android | **63%** | Native source and Firebase app/signing/OAuth setup are present. CI run `38055108814` passed Android SDK setup, lint, unit tests, and `assembleDebug`, making the native CI gate complete (1/4). The run did not upload an artifact, and its APK used the runner's default debug key rather than the Firebase-registered development key. Device auth/profile persistence remain unverified. |

These percentages do **not** mean the full product is 38–63% complete. Discovery/booking, Health Passport, SOS, payment review, and final stabilization remain later milestones.

## Repository and architecture

- Repository: `https://github.com/rajahaider50/homigo-care-platform`
- Working branch: `fresh-rebuild`
- Source baseline before this handover-doc change: `53647e5` (documentation refresh)
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
- CI uses Node 22, pnpm 11.25.0, and Java 21. Web scripts run typecheck, lint, tests, and production builds. Android runs `lint testDebugUnitTest assembleDebug` only when the repository secret is available.

## Project history and verified decisions

1. The supplied build-kit ZIP and directive were audited. The user explicitly selected full scope with Firebase/Firestore, overriding the kit's minimalist Express/PostgreSQL option.
2. A private monorepo was created/cloned and work continued on its existing `fresh-rebuild` branch. Old repos and projects were preserved.
3. The user approved the new Firebase development project `homigo-care-dev-20261010` in `asia-southeast1` (Singapore). The project remains on Firebase Spark; Analytics and Gemini are disabled. No billing upgrade or production project mutation was made.
4. Android (`pk.homigocare.android`) and a shared Web app were registered. A unique development-only debug signing certificate was generated outside Git and registered in Firebase. Google sign-in was enabled; the Android config was refreshed afterward to include OAuth client metadata.
5. The default Firestore database is Standard (Native), created in production mode with live deny-all rules. Profile-aware repo rules passed 6/6 isolated Emulator tests. Live rules have not been deployed, no records were seeded, and no user data was written.
6. Native Android, Public Website, and Admin foundations were implemented. Public preview smoke checks previously returned HTTP 200 on `/`, `/services`, `/auth`, and `/auth/action`. Admin remains sign-in-only and claim-gated in source; no public Admin registration was added.
7. CI run [38055108814](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38055108814), on commit `12a5cc1`, completed successfully. Web and Firestore Rules checks passed. Android SDK setup, lint, unit tests, and `assembleDebug` all passed. The run has zero retained artifacts because the workflow did not yet upload the APK; its signing configuration used the runner's default debug key.
8. The task was reauthorized and access retried. GitHub repo/branch, push/admin permission, workflow, run, and Actions read access work. Secret listing and a user-authorized stdin-only write attempt returned HTTP 403 (`Resource not accessible by integration`); no value was read or written by this integration. The later Actions run proves a nonempty config secret is available to the workflow and Gradle accepted it, but the exact secret contents and whether it includes refreshed OAuth metadata remain unverified through the API.
9. The Vercel connector now identifies the `rajahaider50` Hobby team, but `list_projects` returned zero projects both with a HomiGo filter and for the whole team. Git deployment context lists no linked projects/origin connections. Lookups for historical project names `homigo-care-public-staging` and `homigo-care-admin-staging` return 404. Previous records said deployments were blocked, but their present existence/status and URLs cannot be confirmed from the reauthorized account.
10. WhatsApp OTP remains blocked until the user supplies a sanitized Java sample/API contract. The initial Admin bootstrap email is pending. Cloudinary server-side signed uploads need a secure runtime secret and belong to later work.

## Current external-service state

### GitHub

The authenticated GitHub user is `rajahaider50`; repository access and push permission were confirmed, and `gh workflow list` and `gh run view` succeeded. Actions secret endpoints remain inaccessible to this integration (403). CI run `38055108814` proves a nonempty config secret is available to the workflow: Android SDK setup and `./gradlew lint testDebugUnitTest assembleDebug` passed. The workflow update in this continuation adds a silent expected-project/package/OAuth metadata validation and uploads the APK artifact for seven days. The APK from run `38055108814` used the runner's default debug key because `HOMIGO_DEV_DEBUG_KEYSTORE` was not configured; do not claim Google Sign-In is ready.

**Continuation:** inspect the fresh run triggered by the workflow update. It validates the expected Firebase project/package and OAuth metadata without printing values, builds the native app, and uploads the debug APK as a private 7-day artifact. Download and hash the artifact after success. If the validator fails, tell the user to replace `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` with the refreshed config via GitHub Settings → Secrets and variables → Actions; do not retry the same 403 indefinitely. The current CI signer is not Firebase-registered, so Google Sign-In still needs a build using the registered development key and an authorized on-device test.

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

1. Inspect the fresh GitHub Actions run triggered by the workflow update. It should validate the Firebase config without printing values, build the native app, and upload a private 7-day APK artifact. Download and hash the artifact after success. If the OAuth metadata check fails, tell the user to replace `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` with the refreshed config via GitHub Settings → Secrets and variables → Actions; do not retry the same 403 indefinitely.
2. Use the registered development keystore for any Google Sign-In device test; the current CI runner defaults to its own debug key. Never ask the user to paste the Firebase config or signing key into chat.
3. Have the user reauthorize the correct Vercel account/team with the Public and Admin projects. Then verify current project IDs, Git repository linkage, environment keys by name/status only, build logs, deployment state, actual Public URL, and Admin protection.
4. Configure Email/Password Auth and Web client runtime values in the approved development project and appropriate secure runtime environment; then test real auth/recovery flows.
5. Verify native APK build, authorized Google sign-in, and owner-only profile persistence without inserting fake/shared test records. Keep the live Firestore rules deny-all until reviewed and approved.
6. Obtain the initial Admin email through the owner's secure workflow; validate claim enforcement before privileged reads.
7. Await the sanitized WhatsApp integration contract. Keep discovery/booking, Health Passport, SOS, payments, and other M2–M4 work paused until M1 is accepted.

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
