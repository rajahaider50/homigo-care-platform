# HomiGo Care — four-milestone implementation matrix (2026-10-10)

## Confirmed architecture

| Area | Decision | Verified state / guardrails |
|---|---|---|
| Android | Native Kotlin + Jetpack Compose, one package `pk.homigocare.android` for Patient and shared Doctor/Nurse interface | M1 begins with Android auth, patient profile, dashboard and original PDF brand assets. Doctor/Nurse workflows follow the MVP's role model; no separate role-specific APK. |
| Public website | Separate React/TypeScript Vite SPA on Vercel | M1 adds branded, responsive home/service routes, Firebase auth entry and custom email-action handling foundation; the main patient-facing booking journey is later. Older MVP_SCOPE excludes marketing website, but the later explicit user directive requires a minimal public site; no extra marketing/SEO claims. |
| Admin panel | Separate React/TypeScript Vite SPA on Vercel | M1 adds protected sign-in, a server-issued custom-claim gate and a bounded aggregate profile-count query only after authorization. No public admin registration. Actual admin privilege is Firebase backend-enforced and requires the user's initial Admin email for secure bootstrap. |
| Backend/database | New development project `homigo-care-dev-20261010`; Firestore is the intended primary source of truth | Project is on Spark; Google Analytics and Gemini are disabled. Repository `default`/`dev` aliases target the new project; `prod` remains `homigo-care-76e21`. The default Firestore database is active in Standard (Native) edition in `asia-southeast1` (Singapore), with scheduled backups disabled. Live production-mode rules deny all reads/writes; the repository's profile-aware rules have not been deployed. No documents or user data were written, and existing projects remain untouched. Firebase CLI still has no authorized account; validate and review the exact rule payload before any deployment. No Supabase/Realtime DB/Firebase Storage/Hosting. |
| Authentication | Firebase email/password, email verification, password reset, Google sign-in; WhatsApp OTP uses user's service when sample/config arrives | Screenshot link has documented `mode=verifyEmail` and `apiKey`; never reuse/log one-time `oobCode`. Existing app uses `sendEmailVerification()`. Android debug SHA-1/SHA-256 were registered only on the previous development Android app; the new project's web/Android app registrations and Android CI config are still pending. A freshly resent link must be tested; custom website handler is part of M1. |
| WhatsApp OTP | Trusted server-side adapter for the user's existing Java/WhatsApp service | Java sample/API contract and endpoint are pending; no OTP bypass, fixed code or fake success. Secrets never in chat or client code. |
| Cloudinary | Existing connected Free account, new isolated media folder and signed/server-side uploads | Read-only usage: 0.18/25 credits (0.72%), 73 existing assets, 182,035,524 bytes storage. Preserve existing assets. Runtime API secret is not available to Vercel yet. |
| Manual payments | Manual payment methods/proof review only, no gateway or automated transfer verification | Explicitly required by the newer directive despite older MVP_SCOPE excluding payments; the secure operational workflow is later milestone work. |
| Realtime SOS | Real Firestore docs/listeners; no simulated dispatch or medical claims | Implement after admin permissions and shared data access are proven. |
| GitHub | Fresh private monorepo; the existing default branch `fresh-rebuild` is preserved | `https://github.com/rajahaider50/homigo-care-platform`; the cloned remote currently has no `main` branch. Old repositories are preserved. Never commit secrets or user data. |
| Vercel | Separate Public and Admin staging projects on Hobby | `homigo-care-public-staging` and `homigo-care-admin-staging` are already linked to this repo. Public access is open; Admin SSO protection is enabled for all deployments. Their latest Git deployments are `BLOCKED` with Vercel's account-configuration troubleshooting link; the owner must connect/verify the matching Git identity before redeploying. Older projects remain untouched. |

## Four cumulative milestones (25% each)

1. **M1 — Foundation and first vertical slice across all three products:** implementation order inside the milestone is Android first, Public Website second, Admin third. Android: real Firebase auth, verification recovery, Google sign-in, patient profile persistence and branded dashboard. Website: brand/responsive home+service entry/auth routes and action-handler foundation. Admin: protected entry/dashboard shell with real-query empty states. Add validated least-privilege rules, repo/CI, and separate Vercel demo projects where access permits. No fake accounts/business records. Report builds, tests, working integrations, blockers and artifacts; then wait for approval.
2. **M2 — Core authentication and booking workflows across all three products:** patient/professional registration, discovery, profiles, booking persistence and shared Admin/professional views; WhatsApp OTP only if the user's Java sample/config is available. Gate on M1 approval.
3. **M3 — Health Passport and real SOS operations:** patient-controlled scoped grants, secure record authorization, actual SOS persistence and Admin acknowledge/resolve; manual payment instructions/proof and Admin review as specified. Gate on M2 approval.
4. **M4 — Stabilize, secure, build and release:** final authorization/rules, audit history, integration tests, Android APK/AAB instructions, reproducible GitHub Actions, two Vercel deployments, end-to-end acceptance and incomplete-item report. Gate on M3 approval.

## Inputs still needed

- Sanitized Java WhatsApp OTP sample/API contract and endpoint/config requirements (no secrets in sample/chat).
- Initial Admin's Firebase email address; never password.
- Cloudinary runtime API secret through Vercel secure environment configuration.
- Release keystore only if a signed release APK/AAB is required. Debug APK can be built without it.
