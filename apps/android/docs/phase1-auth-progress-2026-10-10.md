# Android Phase 1 — Authentication foundation

## Implemented in this phase
- Native Jetpack Compose sign-up and sign-in screens using Firebase Authentication email/password.
- Sign-up validates full name, email, and an 8-character minimum password; it creates a Firebase account, saves the display name, and sends an email-verification link. A Terms/Privacy consent box is intentionally not shown until the actual policy text/pages are available.
- Sign-in reloads the Firebase account and blocks entry until the email is verified; the verification state supports resend, refresh, and sign-out.
- Loading and user-facing error states are provided. Debug and release Firebase config files already exist in the repository; debug builds select the development config.
- The first signed-in screen deliberately states that domain features are not connected yet. No medical, booking, document, or emergency data is read/written from this screen.

## Not yet complete / not represented as live
- This is an authentication and navigation foundation, not the complete Patient + Professional Android MVP.
- Firebase Email/Password provider availability and a real account round-trip must be verified in Firebase Console/device testing.
- The shared Supabase project is `homigo-care` (`oatuzfbcxxfoiumigywn`) and is healthy; project tables exist. However, the repository's setup notes still require Firebase third-party JWT trust, a client-safe Supabase URL/key configuration, the server-owned user/profile bridge, and an end-to-end RLS test. These have not been inferred or bypassed.
- Patient booking, verified professional browse/registration, Health Passport authorization, SOS, and real-time/admin visibility remain pending. Do not use the legacy mock API as a production integration.
- No signed release or Android device test is claimed in this phase.

## Next implementation order
1. Complete Firebase-to-Supabase identity bridging and test it against a dedicated development environment, not production patient records.
2. Implement Patient profile/dashboard, approved professional browsing, booking creation/status, and verification/error/empty states using the protected data layer.
3. Implement shared Doctor/Nurse onboarding, verification state, booking actions, and booking-scoped Health Passport authorization.
4. Implement safe Health Passport PIN/grants and SOS end-to-end with server-side authorization and Admin monitoring.
5. Run Android build/lint and device-flow checks; record any unavailable integrations explicitly.

## Validation performed
`./gradlew --no-daemon testDebugUnitTest lintDebug assembleDebug` completed successfully on 2026-10-10. The debug APK was produced. No Firebase account round-trip or physical-device/emulator flow was performed, so live provider availability remains unverified.
