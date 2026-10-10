# Android authentication implementation references

Checked 2026-10-10 while wiring M1. These external sources informed the SDK integration:

1. Firebase, **Authenticate with Google on Android**: https://firebase.google.com/docs/auth/android/google-signin
   - Recommends Firebase Android BoM for Firebase library compatibility and Credential Manager + Google ID dependencies.
   - Shows `GetGoogleIdOption`, the `default_web_client_id` server client ID, `GoogleIdTokenCredential.createFrom(...)`, and exchanging the ID token using `GoogleAuthProvider.getCredential(...)` with `FirebaseAuth.signInWithCredential(...)`.
   - Lists `androidx.credentials:credentials:1.3.0`, `credentials-play-services-auth:1.3.0`, and `googleid:1.1.1` in the fetched guide.
2. Android Developers, **About Sign in with Google**: https://developer.android.com/identity/sign-in/credential-manager-siwg
   - Describes the Credential Manager bottom sheet and the need for an explicit persistent sign-in action; it notes that an app may need another action when no device account is available.

Build compatibility note: Firebase BoM `35.0.0` resolved Auth `25.0.0`, whose Kotlin metadata was `2.4.0`, while this project's Kotlin compiler is `2.0.21`; the actual Gradle build failed on that incompatibility. The project therefore pins the already-used `firebase-bom:33.7.0` for the M1 build. Credential Manager versions follow Firebase's fetched guide. The failed build is recorded as a finding, not as successful test evidence.
