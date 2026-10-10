

## Latest M1 verification snapshot (2026-10-10)

**M1 remains open; M2 is paused.** Current scores are Public Website **63%**, Admin Panel **38%**, and native Android **50%**, based on implementation plus verification. Current local checks pass: Firestore Emulator **8/8**, and Public/Admin typecheck, lint, tests, and production builds. Local previews return HTTP 200; these do not establish a Vercel deployment.

Live Firebase Console evidence confirms Google provider enabled, Web OAuth client ID populated, and the registered Android development SHA-1/SHA-256 matching the local keystore. Email/Password is not enabled. There is no real-device Google sign-in/profile test. GitHub secret updates for both the keystore and Firebase config returned HTTP 403; the previous CI run successfully consumed and validated the existing Firebase config but uploaded an APK signed by the runner's default key. CI now requires the registered keystore and checks the APK signer before artifact upload. The user must add the keystore secret manually before a correct-signer Actions artifact can be generated.

The authorized Vercel team still lists zero projects and no Git-linked context; no replacement projects were created. The Firestore candidate rules remain undeployed; the emulator suite tests patient/anonymous/admin boundaries and denies health/payment namespaces. The live Rules editor did not render source in this check; last-verified live status is deny-all. No shared data or rules were changed. The M1 acceptance gate remains closed until the correct Vercel authorization, signed APK/device test, configured auth flows, and all other M1 acceptance evidence are resolved and the user explicitly approves progression.
