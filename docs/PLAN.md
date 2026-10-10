# Implementation plan

## Product and design

HomiGo Care is a minimalist home-healthcare MVP centered on **Convenience + Privacy + Safety**. The visual system follows the supplied PDF: trust-first healthcare minimalism; white/light surfaces; primary teal `#1B6B63`, dark teal `#0D4A44`, sparing orange `#F5823A`, and red reserved for emergency states. Only the supplied palette, spacing, radius, typography and original logo/icon assets are used. Layouts keep one primary action, readable text, accessible contrast and clear loading/empty/error/success states. Latin font uses the specified Plus Jakarta Sans stack; Urdu fallback remains Noto Naskh Arabic/Noto Nastaliq Urdu. The app must never claim dispatch, provider verification, payment, or clinical readiness beyond actual stored state.

## Architecture and responsibilities

- `apps/android`: native Kotlin/Compose; Firebase email/password and Google Auth, verified-email gate and recovery; Firestore patient profile; branded patient dashboard. Doctor/Nurse workflows remain a later gated milestone.
- `apps/public-web`: separate React/Vite client for the public home/service overview and auth entry/action handler. Firebase client uses the same project; client permissions remain rules-enforced.
- `apps/admin-web`: separate React/Vite client; sign-in only, no public registration. A user must hold a Firebase `admin` custom claim before any privileged query. Initial account bootstrap awaits an owner-provided email.
- `packages/design-system`: original Android vectors, SVG icons, PNG logos and design token source.
- `firebase`: the existing development project's Firestore config/rules; no Hosting, Storage, Supabase or second database.
- `tests/firestore`: local isolated rules tests; synthetic test identities only in the emulator, never in the shared Firebase project.

## Data and security

M1's only persisted domain document is `profiles/{uid}` with `uid`, `email`, `displayName`, `role: patient`, and server timestamps. Profile creation requires a verified Firebase identity and the document UID must equal `request.auth.uid`; client code cannot assign Admin/Professional privileges. Admin reads require a verified `admin` custom claim. All other collections default deny. Existing remote records are preserved; rule tightening can deny legacy collection access but must not delete data. The final exact rules source is shown and confirmed before deployment.

## Delivery sequence

M1 is a buildable foundation across all three products, implemented in order: (1) Android auth/profile/dashboard, (2) public website/auth-action foundation, (3) protected Admin entry and truthful empty states. Add CI, rule validation and separate Vercel demo projects where access/config allows. No fake business records.

M2 adds shared discovery/booking/auth workflows; M3 adds Health Passport authorization, real SOS and manual payments; M4 stabilizes security, tests, APK/AAB release instructions and separate Vercel deployments. Stop for user acceptance at each 25% milestone.
