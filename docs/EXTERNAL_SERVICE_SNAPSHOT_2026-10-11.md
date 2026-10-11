# External service snapshot — 2026-10-11

This file records read-only checks performed while implementing the approved HomiGo M2 slice. It contains no access tokens, API keys, service-account material, or user data.

## Firebase

- The owner selected `homigo-care-dev-20261010` as the authoritative development project. This supersedes earlier ambiguous mentions of `antigravity-full-control` and legacy HomiGo projects.
- Firebase CLI authentication is available in the current Sandbox. The selected project's Android and Web client configs have been fetched to ignored local files only; no Firebase client secret was committed.
- Firebase Console inspection previously confirmed Google and password-based Email/Password sign-in are enabled for the selected dev project. Email Link remains disabled.
- The default Firestore database is in `asia-southeast1`. The expanded M2 rules in `firebase/firestore.rules` were deployed to `homigo-care-dev-20261010` after the owner's explicit approval. The isolated Firestore Rules Emulator suite passes **15/15**. No live booking/profile records were written; rule deployment did not seed data.
- The Sandbox debug signing certificate was registered on the selected dev Android app for a local debug build. No Android device is attached, so Google sign-in has not been end-to-end tested on a phone. The Termux build key is a separate signer and is not required for an APK signed by this Sandbox.

## Vercel

Source: Vercel MCP `get_git_deployment_context` and `list_projects`, read-only.

- The connected Vercel team is `rajahaider50's projects` on Hobby.
- Six existing projects are linked to the different GitHub repository `rajahaider50/homigocare-mvp`: `admin-web`, `website-ywmf`, `mock-api-xqh9`, `mock-api`, `website`, and `api`.
- None of those existing projects will be overwritten or repointed during this work. Separate staging projects for `rajahaider50/homigo-care-platform` are still required; no URL for the current repository is claimed until a deployment succeeds.
- Hobby hosting is being treated as a non-commercial demo/staging environment, not a production environment for identifiable clinical records.

## Cloudinary

Source: Cloudinary Asset MCP folder/asset inspection and the authorized HomiGo lockup upload.

- The account contains HomiGo folder containers including `homigo-care`, `homigo-care/app_assets`, `homigo-care/app_assets/icons`, `homigo-care/app_assets/illustrations`, `homigo-care/app_assets/badges`, and operational subfolders for profile photos, documents, CNIC, prescriptions, receipts, and WhatsApp media.
- Exact `asset_folder` queries for the app-assets root, icons, illustrations, and HomiGo root returned zero assets. This does not prove the account has no assets; the remaining assets/folders have not yet been audited or downloaded.
- The official horizontal lockup `homigo-lockup-horizontal-mvp50-20261011.png` was added under the HomiGo branding folder. Its optimized `f_auto,q_auto,w_520,c_limit` delivery URL returned a 520×130 image successfully in the browser. No existing Cloudinary asset was changed or deleted, and no newly supplied personal credential was used.

## WhatsApp gateway

Source: user-provided screenshot and accompanying note.

- The visible contract documents `POST /api/v1/send-otp` with `{ "number": "923495031007" }`, `POST /api/v1/verify-otp` with `{ "number": "923495031007", "otp": "123456" }`, and an `x-api-key` header. The adapter's tests confirm digits-only numbers (no leading `+`) are forwarded.
- The gateway origin/base URL, API key, sanitized successful/failed verification response examples, pairing-code endpoint, and direct-message endpoint are still not present. The API fails closed on unknown verification responses and does not fake delivery or pairing.

## Phone/password sign-in reference

- Official contract: [Google Identity Platform `accounts.signInWithPassword`](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/signInWithPassword), read 2026-10-11.
- The documented method is `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword`; its request supports `email`, `password`, and `returnSecureToken`, and a successful response includes `idToken` and `localId`.
- HomiGo's server maps a user-entered verified phone to a private HMAC-indexed email, asks the official Firebase Identity API to verify the password, validates the returned ID token with Firebase Admin, discards that ID token, and returns only a Firebase custom token to the client. This keeps email lookup and upstream tokens off the client; it requires a matching Firebase Web API key as server configuration.


## Superseding update — 2026-10-11 08:24 UTC

- **Firebase rules:** local rules now bind profile role to the Firebase `account_role` custom claim; Emulator is 16/16. This changed rules file has not been redeployed. Obtain explicit owner review/approval, then deploy and verify it before public application deployment. Existing dev M2 rules deployment remains the older revision.
- **Vercel:** two new projects are linked to `rajahaider50/homigo-care-platform`: `homigo-care-public` (root `apps/public-web`) and `homigo-care-admin` (root `apps/admin-web`). Public Firebase Web config and official brand URL are set for Production/Preview. No deployment exists yet; production branch is `fresh-rebuild`, and default SSO protection remains enabled. Public links are not yet available. No project under `homigocareo-mvp` was edited.
- **Android:** SDK/lint/unit/debug assemble succeeded. A 15,976,972-byte debug APK was copied to `/home/ubuntu/HomiGoCare-debug-2026-10-11.apk` (SHA-256 `03cd1ec4da33ffee03db2d059a96508d7cd559d5bc98b052e098cca7975231d2`). The local default debug signer does not match the registered dev signer fingerprints checked in this session; no Android device test occurred. The APK build did not have the shared API base URL.
- **WhatsApp/API:** no live gateway/API deployment or OTP. Gateway credentials and API runtime configuration remain unavailable; browser OTP readiness must remain blocked honestly.


## Post-push status — 2026-10-11 08:29 UTC

The previous note that no deployments existed is superseded: Git integration automatically started two Production-target builds for feature SHA `83d490f`. Admin is READY at `https://homigo-care-admin.vercel.app/`; an anonymous browser walkthrough showed only the existing verified Admin-claim sign-in gate. Public was still BUILDING at the last Vercel check; its project's SSO protection is now set to `all` until the revised Firestore rules receive owner approval and are deployed. The Admin page still has a stale footer in the built deployment; a truthful text correction is local and awaits the next push/deployment.

GitHub Actions `38108324820` for `83d490f` completed overall success. Web and Rules checks passed. Android CI validated configuration but skipped SDK/native build/signature verification/APK upload because protected secret `HOMIGO_DEV_DEBUG_KEYSTORE_BASE64` was absent. A separate local debug APK exists but its signer did not match the Firebase-registered dev signer checked here.
