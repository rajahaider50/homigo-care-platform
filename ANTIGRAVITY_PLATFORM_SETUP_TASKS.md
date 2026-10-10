# Antigravity Platform Setup Tasks — HomiGo Care

**Repository:** `rajahaider50/homigo-care-platform`
**Source branch:** `fresh-rebuild`; implementation changes may first appear on short-lived reviewed feature branches.
**Purpose:** Platform-side configuration only. The implementation agent owns application source, APIs, rules source, and tests; Antigravity owns authorized Firebase/Cloudinary/GitHub Actions/Vercel project configuration and deployment. Do not create replacements, expose secrets, seed real services with synthetic records, or claim success without the verification below.

## Operating rules

1. Inspect current project/account ownership, project IDs, linked repos, and environments before changing anything.
2. Keep development project `homigo-care-dev-20261010` separate from production project `homigo-care-76e21`. Work only in development unless separately and explicitly authorized.
3. Preserve existing resources and billing. Do not activate paid services or upgrade plans without owner approval.
4. No service-account keys, keystores, API secrets, OTPs, patient records, or payment proofs in Git, chat, client bundles, browser storage, or logs.
5. For every task, report: exact resource changed, environment/project ID, timestamp, verification evidence, and any access error. Mask secret values. If blocked, name the specific permission/action required; do not retry by weakening security.
6. Source files and test evidence are authored by the implementation agent. Do not rewrite application source, rules, environment templates, or CI workflows during platform setup; request a coordinated source change if a dependency is missing.

## 1. Firebase

### 1.1 Confirm project and app registrations

- **Purpose:** Ensure all clients use the existing development identity/database project, not a new or production project.
- **Required permission:** Firebase project viewer for inspection; Firebase Authentication/Project Editor as needed for app/provider configuration; Firebase Rules/Firestore administrator only for an explicitly approved rules deployment.
- **Project:** `homigo-care-dev-20261010` (development). Historical project records report a production project `homigo-care-76e21`; do not use it for this work.
- **Required registrations:**
  - Android Firebase app package: `pk.homigocare.android`.
  - Shared Firebase Web app used by Public Website and Admin Panel. Confirm existing app registration and exact app ID; do not register duplicates unless the current app is missing and owner authorization allows registration.
- **Source references:** `apps/android/app/build.gradle.kts`, `apps/public-web/src/firebase.ts`, `apps/admin-web/src/firebase.ts`, `apps/public-web/.env.example`, `apps/admin-web/.env.example`, `firebase/.firebaserc`.
- **Actions:** inspect actual project ID, app IDs, project location/plan, API restrictions, and existing registrations. Confirm both web clients are intentionally using the same Web app/config. Report identifiers, but never report secret values.
- **Verify:** compare the Android package and Web app IDs against source/build config; confirm each app's configuration download/source is available through the approved secure channel. Confirm no production project was changed.

### 1.2 Android Google Sign-In and development certificate

- **Purpose:** Allow the Android credential flow to exchange a Google ID token for Firebase Auth only from a build signed with the registered development certificate.
- **Required permission:** Firebase Authentication/Android app settings editor; access to the owner-provided development keystore only through a secure, authorized mechanism.
- **Expected package:** `pk.homigocare.android`.
- **Expected development certificate from the current repository handover:**
  - SHA-1: `F4:4A:F8:1E:50:99:63:1E:5C:49:A2:78:D0:7B:BD:13:57:35:98:E9`
  - SHA-256: `09:BF:4F:EC:5B:FE:A4:23:0E:27:B7:20:36:3C:46:74:CE:BA:54:7E:8E:FD:79:8D:14:44:C2:63:E6:C2:AF:40`
- **Source references:** `apps/android/docs/firebase-environment-status.md`, `apps/android/docs/firebase-android-fingerprints.md`, `.github/workflows/ci.yml`.
- **Actions:** inspect the registered fingerprints in the development Android app settings; compare with the authorized keystore certificate via `keytool` without printing/committing keystore contents. Confirm Google provider configuration contains the expected Android and Web OAuth client relationship and the generated `default_web_client_id` is available to the Android build. If a fingerprint is missing, register only the verified fingerprint on the development app.
- **Verify:** rebuild with the intended key, run `apksigner verify --print-certs`, compare SHA-1 and SHA-256 to Firebase settings, and report only whether each matches. A CI runner's default debug signer is not acceptable evidence. Follow with an authorized device test; build success is not Google Sign-In verification.

### 1.3 Email/password, verification, and recovery

- **Purpose:** Support account creation/login, email verification, resend/refresh, and password reset using the implemented Firebase Auth flows.
- **Required permission:** Firebase Authentication provider/settings editor for the development project.
- **Current reported state:** Google was previously reported enabled; Email/Password was previously reported disabled. Recheck current state before acting.
- **Source references:** `apps/android/app/src/main/java/pk/homigocare/android/auth/AuthRepository.kt`, `apps/android/app/src/main/java/pk/homigocare/android/MainActivity.kt`, `apps/public-web/src/auth`, `apps/public-web/src/pages/AuthActionPage.tsx`, `apps/admin-web/src/admin-access.ts`.
- **Actions:** enable Email/Password in the development project if not already enabled, as required by the user's explicit request to implement/test registration and login. Preserve email-verification enforcement. Review authorized domains/action URL templates for only the real approved app/site domains; do not add wildcard/public access as a workaround. Keep admin access separately claim-gated.
- **Verify:** use a controlled, owner-authorized test account; verify registration creates an unverified identity, newest verification link works once, refresh detects verified state, reset email flow produces safe UX, and unauthenticated/unverified/ordinary-user access is denied where applicable. Do not create fake accounts in production/shared data.

### 1.4 Firestore, indexes, and rules

- **Purpose:** Deploy only the reviewed least-privilege development policy after source implementation and explicit approval.
- **Required permission:** Firestore Rules administrator; explicit owner approval is required before deployment because rules alter live access.
- **Source of truth to review:** `firebase/firestore.rules`, `firebase/firestore.indexes.json`, `firebase/firebase.json`, `firebase/RULES.md`, `tests/firestore/firestore.rules.test.mjs`.
- **Current repository policy:** owner-only verified patient profile reads/writes; narrowly bounded Admin reads require a verified `admin` custom claim; all unspecified collections deny access. No broad test mode. The latest repository report says live rules were deny-all and candidate rules were not deployed; confirm current live state.
- **Location discrepancy to resolve:** historical status reports the existing development Firestore location as `asia-southeast1`; checked-in `firebase/firebase.json` says `asia-south1`. Inspect the actual database location and determine whether this config field affects the intended operation before any database/rules action. Do not create a second database or change location; report the discrepancy to the implementation agent.
- **Actions:** inspect actual live policy and database/project location. Compare exact live rules with the candidate file. Do not deploy or modify rules until the owner reviews the complete candidate `firebase/firestore.rules` payload and confirms deployment. Never weaken rules to make a test pass. Do not enable public reads/writes or expose health/payment namespaces.
- **Verify:** run the isolated Firestore Emulator suite (`pnpm test:rules`; expected coverage currently includes allow/deny tests) before requesting deployment. After explicit approval, deploy only rules/indexes that are part of the approved change and verify authorized owner operations and unauthorized anonymous/other-user/unverified/Admin-without-claim denials in a non-production test path. No synthetic records in shared/live Firestore.

### 1.5 WhatsApp OTP backend secret readiness

- **Purpose:** Prepare the secure server-side gateway configuration after the source agent has implemented a trusted API adapter.
- **Required permission:** permission to set secrets in the selected backend runtime; Firebase Functions/Secret Manager access only if the implementation chooses Firebase Functions.
- **Gateway contract supplied by owner:**
  - `POST https://whatsapp-otp.bot-keep.xyz/api/v1/send-otp`
  - `POST https://whatsapp-otp.bot-keep.xyz/api/v1/verify-otp`
  - `x-api-key` is server-only; source must validate the real response schema and error behavior.
- **Source dependency:** no production-ready provider adapter, transaction binding, rate limit, or Admin settings API is present yet. Wait for the implementation agent's source review before configuring secrets. Do not request or send the owner's key in chat.
- **Secret name:** use `WHATSAPP_OTP_API_KEY` in the selected trusted server-side secret store, only after the implementation agent confirms the exact runtime contract. Never expose it as `VITE_*`, Android resources, or client config.
- **Actions:** after the source endpoint is ready, store the owner-provided key through the approved secret-entry flow. Configure endpoint URLs only if the provider contract confirms them; do not let ordinary Admins/patients change arbitrary outbound URLs. No connection test that sends an OTP to an arbitrary number.
- **Verify:** use a provider-approved safe test number/flow, check send/verify response handling, expiry/replay protection, per-number/IP limits, and audit redaction. Confirm the key is masked after save and absent from client bundles/logs. Record the provider's actual result schema/status without storing OTP values.

## 2. Cloudinary

- **Purpose:** Media storage for approved profile/professional imagery and authorized document workflows; Cloudinary is the intended media store, not Firebase Storage.
- **Required permission:** Cloudinary project viewer for inspection; API/Upload Preset configuration access for approved media settings; secure Vercel secret write access for the trusted server runtime.
- **Source references:** `apps/android/cloudinary/README.md`, `apps/android/secrets.properties.example`, `apps/android/docs/phase0-status-2026-09-28.md`.
- **Current source dependency:** the repository says clients must request signed upload parameters from a trusted API, but this repo does not yet define a shipped server-side Cloudinary signing endpoint or complete environment contract. Do not add credentials or enable broad unsigned uploads while it is absent. Ask the implementation agent to specify the signed upload endpoint, authorization claims, limits, and metadata once the code is ready.
- **Expected folders:** `homigo_public_assets` for public app assets; `homigo_user_documents` for signed user documents. Do not place medical records, identity documents, or payment proof in a publicly deliverable folder. Confirm existing folder/assets before changing them.
- **Server-only secret variable names (to be finalized against implementation before entry):** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. The API secret must be available only to the trusted server runtime. Do not put it in `VITE_*`, Android resources, `secrets.properties`, or browser/mobile storage. A client-visible cloud name/API key is not an upload authorization mechanism.
- **Actions after code readiness:** verify private/signed upload settings, MIME/type and size limits, authenticated-user ownership, access-control/delivery policy, and deletion/retention rules. Do not enable unrestricted unsigned upload for user documents.
- **Verify:** test with synthetic non-sensitive files in an isolated test folder. Confirm unauthorized upload/signature requests fail, authorized upload returns only the intended delivery URL/ID, sensitive documents cannot be fetched without authorization, and API secrets never appear in a client bundle or logs. Remove test assets after verification.

## 3. GitHub Actions and Android APK

- **Purpose:** Run reproducible Web/rules/native checks and publish a development APK only when its signer matches the Firebase-registered development certificate.
- **Required permission:** repository Actions workflow read/run access; repository Actions secret write access for the secret owner; artifact read access. Do not send secret values to the implementation agent.
- **Repository/workflow:** `rajahaider50/homigo-care-platform`, `.github/workflows/ci.yml`, branch `fresh-rebuild` (or the exact reviewed feature branch/PR head).
- **Required Actions secrets (names only):**
  - `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` — development Android Firebase config; never commit it.
  - `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` — Base64 development-only keystore whose certificate matches the Firebase fingerprints.
  - Existing workflows may use other environment-specific values; inspect workflow references and report names only.
- **Build requirements:** Java 21, Android SDK/platform/build tools per `apps/android/app/build.gradle.kts`, Gradle wrapper `apps/android/gradlew`. The repo's CI validates Firebase project/package/OAuth metadata before native build. Build steps must remain fail-closed if secrets are absent or signer mismatch.
- **Actions:** confirm the two named secrets exist without retrieving values. Run `ci.yml` for the target commit/branch. Do not substitute the runner's generic debug key when the expected signer secret is absent. Do not alter or rotate secret values without owner authorization.
- **Verify:** inspect job-level outcomes (not just overall workflow success); confirm Android lint, `testDebugUnitTest`, and `assembleDebug` ran; verify `apksigner` fingerprints match expected Firebase SHA-1/SHA-256; confirm the APK artifact exists, download it through authorized Actions access, compute SHA-256, and record artifact/run URLs, commit, checksum, and expiration. Then request an authorized device test; CI alone does not verify Firebase sign-in or prevent the reported device crash.

## 4. Vercel

- **Purpose:** Configure/deploy existing Public Website and Admin Panel as separate projects without replacing or weakening existing protections.
- **Required permission:** Vercel team/project read access to inspect; project deployment/environment write access for authorized changes; GitHub repository integration access. Preserve existing ownership, billing, and Admin SSO/protection.
- **Repository/branch:** `rajahaider50/homigo-care-platform`, intended deployment branch `fresh-rebuild` after reviewed source changes. Use branch previews for feature changes where existing policy permits.
- **Historical project-name candidates only:** `homigo-care-public-staging` and `homigo-care-admin-staging`. These names are historical; prior status said the currently visible team returned zero projects. They are **not** confirmed project IDs. Inspect team/account ownership and project IDs before any action. Do not create replacement projects until existing ownership/links are verified and the owner approves.
- **Public project settings:**
  - Root: `apps/public-web`
  - Framework: Vite (React/TypeScript)
  - Install: `pnpm install --frozen-lockfile` from the monorepo root as supported by existing Vercel settings; inspect current project configuration before changing.
  - Build: `pnpm --filter @homigo/public-web build`
  - Output: `apps/public-web/dist`
  - Route rewrites: preserve `apps/public-web/vercel.json` for `/auth`, `/auth/action`, `/auth/reset`, `/auth/verified`, `/services`.
- **Admin project settings:**
  - Root: `apps/admin-web`
  - Framework: Vite (React/TypeScript)
  - Install: `pnpm install --frozen-lockfile` from monorepo root as supported by existing settings.
  - Build: `pnpm --filter @homigo/admin-web build`
  - Output: `apps/admin-web/dist`
  - Preserve any existing SSO/protection settings; frontend Firebase custom-claim checks are also required.
- **Environment variable names for both separate projects:** `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. These Firebase Web config fields are client-visible identifiers, not server secrets. Set the values for the existing approved development Web app; keep Admin and Public environments aligned with that project. Do not add Admin/service secrets as `VITE_*` values.
- **Actions:** inspect current project/team IDs, Git links, branch, root, framework, build/output, env-variable names (not values), latest deployments, protection settings, and deployment logs. Fix only within authorized existing projects. No replacement creation or production deployment without owner approval.
- **Verify:** run the exact configured production build, deploy only the intended branch/environment, confirm deployment is READY, fetch the real deployment URLs, and smoke-test Public routes (`/`, `/services`, `/auth`, `/auth/action`) and Admin root. Confirm Admin access is denied before privileged queries for a user without the verified `admin` custom claim. Verify mobile layout and no client bundle contains Firebase service-account/Cloudinary/OTP secrets. Report exact commit, deployment IDs/URLs, and HTTP responses.

## 5. Coordination handback format

For each service, return:

- What was inspected and the resource/project IDs (no secrets).
- Which tasks were completed, with timestamp and direct verification evidence.
- Exact blockers/errors and the permission/owner action required.
- Any discrepancy between deployed state and source, especially Firestore location/rules, OAuth certificate, Vercel project links, or environment variable names.
- Confirmation that no production data, billing, rules, project ownership, or secret values were changed outside explicit authorization.

Do not report a setting or deployment complete based on source code, a passing build, a historical note, or a masked secret alone.
