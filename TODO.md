# Delivery milestones and acceptance clauses

This is the project progress ledger. Do not mark a clause complete without the described evidence. Later milestones remain gated on explicit user approval.

## Current snapshot — 2026-10-11

M2 source work is merged by the repository owner via [PR #1](https://github.com/rajahaider50/homigo-care-platform/pull/1) into `fresh-rebuild` (merge commit `3617e98`); this is not milestone acceptance. Workspace checks passed; API-origin and role-claim security fixes are covered; Firestore Emulator is 16/16. Corrected rules are not redeployed—owner review/approval is required. The debug APK builds but its signer does not match the registered Firebase debug fingerprint and it lacks an API base URL. Admin stable alias `https://homigo-care-admin.vercel.app/` is READY and shows only verified Admin-claim login. Both follow-up Vercel previews from [draft PR #2](https://github.com/rajahaider50/homigo-care-platform/pull/2) are READY; Public project SSO is enabled for all targets until rule approval. GitHub Actions Web/Rules passed; Android CI skipped native build because its registered keystore secret is unavailable. Real WhatsApp gateway credentials are absent.

Do not deploy the public apps until the corrected Firestore rules have explicit owner approval and are deployed. Do not deploy the API without server-only secrets and real gateway settings. Do not claim live OTP, Google Sign-In on a physical device, real-provider booking, or 70% completion for any product. The compiled APK is debug-only and not Google Sign-In-ready. See [`NEXT_AI_HANDOFF_2026-10-11.md`](NEXT_AI_HANDOFF_2026-10-11.md). No Antigravity is authorized or used.

## Milestone 1 — first 25% (historical baseline; see current snapshot)

- [ ] Native Android project, official design system, correct navigation, auth screens, initial patient dashboard, basic profile flow, validation, loading/error/empty/success states.
- [ ] Firebase Auth email/password with sign-up, verified-email gate/resend/reload, logout, password reset, Google sign-in using the registered Android OAuth fingerprints; do not store passwords in plaintext.
- [ ] Firestore profile create/read for the authenticated owner only; no fake users/business records and no clinical data in profile; least-privilege rules deny unverified, other-user and default paths.
- [ ] Public Website project setup, brand, responsive home/service overview, login/sign-up entry points, initial shared Firebase configuration and email-action handler foundation.
- [ ] Separate Admin project setup with secure sign-in-only entry, no public Admin registration, Admin-claim authorization enforced before privileged queries, initial dashboard/professional/booking empty-state foundation backed by actual bounded queries where authorized.
- [ ] Firestore rules validated and tested; before remote deployment, show the complete exact rules source and explain denied legacy access, then wait for user confirmation.
- [ ] New private GitHub repository, `fresh-rebuild` development branch, source pushed without secrets, and GitHub Actions for web/mobile checks and automated tests.
- [ ] Two separate Vercel projects and environment setup where permissions permit; public project labelled non-commercial demo/staging, Admin remains protected; verify actual deployment URLs before reporting them.
- [ ] Preserve existing Firebase data, old repos/projects and supplied ZIP/PDF/assets. Never seed fake production records.
- [ ] Report exact build/test/deployment artifacts, integrations actually working, blocked inputs, and required owner actions; then wait for approval before M2.

## Milestone 2 — cumulative 50% (implementation in progress; not accepted)

- [ ] Complete the working patient and professional authentication/onboarding paths, including Google sign-in and WhatsApp OTP only when the user's Java API sample and configuration are available.
- [ ] Add real Doctor/Nurse discovery and professional profiles that show only approved professionals and accurate stored qualification/status/availability.
- [ ] Let a patient create a validated booking request and receive a persistent confirmation/status.
- [ ] Let the Admin Panel inspect the same database booking with backend-enforced authorization.
- [ ] Let an approved professional see and act on the same booking; a pending/unapproved professional cannot accept it.
- [ ] Patient website workflows use the shared backend and consistent states where supported.
- [ ] Demonstrate an authorized real workflow, without frontend-only mock bookings or fake production records; report provider blockers honestly.

## Milestone 3 — cumulative 75% (not started; approval-gated)

- [ ] Add Health Passport PIN and protected record access without storing the PIN in plaintext or logging it.
- [ ] Scope each patient-approved access grant to a professional/booking; support revoke/expiry where specified; deny access server-side without valid consent.
- [ ] Add real SOS creation with confirmation and persisted status; show the same alert to Admin and support acknowledgement/resolution; never claim dispatch.
- [ ] Add manual payment instructions/methods and proof submission/review only; isolate proofs, separate submit/approve privileges, prevent double approval and preserve audit history.
- [ ] Add the Cloudinary server-mediated upload path only after secure runtime credentials are available; do not expose API secrets or upload real health records as public media.

## Milestone 4 — cumulative 100% (not started; approval-gated)

- [ ] Stabilize all three connected products, final rules, server-side validation, audit logging and critical business-rule/integration tests.
- [ ] Run reproducible GitHub Actions for web lint/type/build, Android build, rules tests and controlled release checks.
- [ ] Build/install instructions for native Android debug APK; provide AAB/release signing instructions if requested, without requesting private key material in chat.
- [ ] Deploy separate Vercel Public and Admin projects; verify actual URLs, Firebase environment, Public availability and Admin auth/claim enforcement.
- [ ] Complete end-to-end acceptance for booking, authorization, SOS and manual payment review; no fake production records.
- [ ] Document backups/recovery, exact remaining blockers and honest production-readiness limits.
