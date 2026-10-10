# HomiGo Care — M1 Implementation Status

**As of:** 2026-10-10 (Asia/Karachi)
**State:** Milestone 1 (Foundation & First Vertical Slice) is **in progress and not accepted**. M2 work remains paused pending M1 acceptance.

## M1 progress by product

These scores measure **M1 scope only**, not the complete four-milestone product. Each product has four equally weighted gates. A gate earns full credit only when implementation and the relevant verification are both evidenced; partial implementation without end-to-end verification earns half credit. Scores are rounded half-up to a whole percent. Later M2–M4 workflows are excluded.

| Product | M1 score | Evidence and remaining gates |
|---|---:|---|
| Public Website | **63%** (2.5/4) | Public React/Vite foundation and required routes are built; the temporary preview's `/`, `/services`, `/auth`, and `/auth/action` previously returned HTTP 200. Web typecheck, lint, tests, and production build pass in CI. The Firebase email-action/auth foundation exists, but Web runtime values and real auth verification are pending (half credit). No Vercel deployment is currently verifiable. |
| Admin Panel | **38%** (1.5/4) | Sign-in-only shell, Firebase custom-claim guard, and bounded aggregate-query foundation exist; Admin typecheck, lint, tests, and build pass in CI. The shell/authorization/query gate is only partially verified because no live Firebase runtime or authorized Admin account has been tested (half credit). Firebase environment/bootstrap and a protected live deployment remain unverified. |
| Native Android | **38%** (1.5/4) | Kotlin/Jetpack Compose app foundation, Firebase app registration, unique development signing registration, and Google OAuth metadata are present. Local Gradle configuration/signing checks passed previously, but native CI lint/tests/APK build did not run because the Actions config secret was unavailable (half credit for the implementation/configuration foundation). Real device authentication and Firestore profile persistence are unverified. |

**M1 gate accounting:** Website = previewed route foundation (1) + CI checks (1) + partial auth/runtime gate (0.5) + deployment gate (0) = 2.5/4. Admin = partial shell/claim/query verification (0.5) + CI checks (1) + runtime/bootstrap gate (0) + deployment gate (0) = 1.5/4. Android = partial native foundation/local Gradle checks (0.5) + registered Firebase/signing/OAuth setup (1) + native CI/APK gate (0) + device auth/profile gate (0) = 1.5/4.

## Verified foundation

- **Source of truth:** private GitHub repository [`rajahaider50/homigo-care-platform`](https://github.com/rajahaider50/homigo-care-platform), branch `fresh-rebuild`. Source baseline before the handover documentation change: `53647e5`.
- **Firebase:** development project `homigo-care-dev-20261010`, region `asia-southeast1` (Singapore), Spark plan. Android package: `pk.homigocare.android`; Android and shared Web apps are registered. Google sign-in is enabled. Email/Password Auth and Web runtime values remain pending.
- **Firestore:** default Standard (Native) database is in production mode with live deny-all rules. Repository profile-aware rules pass the isolated Emulator tests (6/6); they have not been deployed. No documents, fake users, or patient data have been seeded.
- **Android signing:** the unique development-only debug keystore is outside Git and its fingerprints are registered in Firebase. It is not a release key. The refreshed Android client config is also outside Git and must never be committed or pasted into chat.
- **Latest completed CI evidence at report time:** [run 38053066423](https://github.com/rajahaider50/homigo-care-platform/actions/runs/38053066423), commit `53647e5`, completed green for Web and Firestore rules. The Android config-restore step completed, but Android SDK setup was skipped because the secret was unavailable; no native APK was produced. The documentation push for this report is expected to trigger a fresh run that will test current secret availability.
- **GitHub access:** authenticated GitHub account `rajahaider50` can access the repository, `fresh-rebuild`, Actions, and repository push/admin operations. Reading Actions secret names and fetching the Actions secret public key both return HTTP 403 (`Resource not accessible by integration`). A user-authorized stdin-only attempt to set `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` also returned that 403. No secret value was printed or added by the integration. The repository-local Git author identity is corrected for future commits; existing history was not rewritten.
- **Vercel access:** the reauthorized connector reports the `rajahaider50` Hobby team, but its project inventory is empty, its Git deployment context has no linked projects or origin connections, and lookups for the historical Public/Admin project names return 404. The Vercel connector also has no alternate authorized accounts available to switch to. Therefore current project settings, deployments, and live URLs cannot be verified. Earlier status records reported the two staging deployments as blocked; that is historical evidence, not a current deployment status. Do not create replacement projects or report old dashboard links as live URLs.
- **Other dependencies:** WhatsApp OTP is waiting on the user's sanitized Java sample/API contract. The initial Admin bootstrap email is still required. Cloudinary signed uploads require a server-side runtime secret and are a later gate.

## Immediate continuation steps

1. In GitHub repository Settings → Secrets and variables → Actions, add or replace `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` with the refreshed Android client configuration. Do not send the JSON in chat or commit it. Inspect the fresh run triggered by the documentation push; Android SDK setup and `./gradlew lint testDebugUnitTest assembleDebug` must execute before an APK can be claimed.
2. Reauthorize the Vercel account/team that actually contains `homigo-care-public-staging` and `homigo-care-admin-staging`, and ensure the GitHub repository is linked there. Then inspect project environment settings, deployment results, and actual app URLs; preserve Admin protection. No deployment URL is currently confirmed.
3. Enable Email/Password Auth in the approved development Firebase project, configure Web client values securely in the correct runtime environments, and test real login/recovery flows. Do not deploy live Firestore rules until the exact rules are reviewed with the user and explicit approval is received.
4. Supply the initial Admin email through the appropriate secure owner workflow, and verify the claim gate before any privileged query.
5. Provide the sanitized WhatsApp Java/API contract when ready. Keep M2 paused until M1's acceptance evidence and user approval are complete.

## Source records

See [`docs/FEATURE_AUDIT.md`](docs/FEATURE_AUDIT.md), [`docs/IMPLEMENTATION_MATRIX.md`](docs/IMPLEMENTATION_MATRIX.md), [`TODO.md`](TODO.md), and [`PROJECT_HISTORY_AND_CONTINUATION.md`](PROJECT_HISTORY_AND_CONTINUATION.md). No secrets, Firebase client-config JSON, keystore, or patient data are included in this report.
