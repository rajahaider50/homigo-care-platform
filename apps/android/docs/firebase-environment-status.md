# Firebase environment and Android signing status

## Firebase projects and app

- Production: `homigo-care-76e21`
- Previous development project: `homigo-care-dev-76e21`
- Current development project: `homigo-care-dev-20261010`
- Android package: `pk.homigocare.android`
- Android app ID in the current project: `1:835894740292:android:85ef8ad75baeaf4ca7c311`

## Current project development signing key

A unique RSA 2048-bit development-only debug keystore was generated outside the Git repository. Its SHA fingerprints are registered on the Android app in the current development Firebase project:

- SHA-1: `F4:4A:F8:1E:50:99:63:1E:5C:49:A2:78:D0:7B:BD:13:57:35:98:E9`
- SHA-256: `09:BF:4F:EC:5B:FE:A4:23:0E:27:B7:20:36:3C:46:74:CE:BA:54:7E:8E:FD:79:8D:14:44:C2:63:E6:C2:AF:40`
- Alias: `androiddebugkey`
- Standard debug store/key password: `android`
- Gradle opt-in: set `HOMIGO_DEV_DEBUG_KEYSTORE` to the absolute path of the separately supplied keystore file. Optional overrides: `HOMIGO_DEV_DEBUG_STORE_PASSWORD`, `HOMIGO_DEV_DEBUG_KEY_ALIAS`, and `HOMIGO_DEV_DEBUG_KEY_PASSWORD`.

The Gradle override applies only to the Android `debug` signing config. If the path variable is unset, Android Gradle uses the machine's normal debug keystore; such a build will not have the Firebase-registered development fingerprint. Never commit or use this development keystore for a release. Release signing remains owner-controlled and unchanged.

## Previous development project fingerprints

The following four fingerprints remain on the previous development Android app only; they were not copied to the new project:

- Previous Dev Debug SHA-1: `E0:75:5E:5E:CC:34:B4:F0:CB:D7:73:3B:6C:73:49:F2:FD:0C:6E:2A`
- Previous Dev Debug SHA-256: `A4:48:15:32:9D:28:8A:F3:F4:1B:66:C6:00:B6:8B:E3:A6:DF:4E:E7:6D:07:34:73:B0:EB:D0:19:C0:C0:B6:FC`
- Previous Dev Release SHA-1: `DF:8B:ED:09:D6:AE:7E:A4:25:45:E3:59:1F:22:0A:9C:9F:1F:92:50`
- Previous Dev Release SHA-256: `08:25:65:E9:68:35:87:DC:CA:6A:FA:10:C2:21:C3:D2:34:82:06:A4:6E:17:F1:B9:2A:88:E4:7A:9F:24:EA:5F`

During setup, an attempted reuse of the previous debug SHA-1 on the new app triggered Firebase's cross-project OAuth warning. That just-added fingerprint was removed. The new unique development-only pair listed above was registered instead. The previous development and production projects remain unchanged.

## Google sign-in, client configuration and CI

Google Sign-In is enabled in the current development project with public-facing name `HomiGo Care` and support email `zarghamabbas859@gmail.com`. The Android auth screen and Credential Manager flow are present in source. Enabling the provider generated OAuth client entries, so **use the newly refreshed** `google-services.json`; do not reuse a copy downloaded before Google Sign-In was enabled. This file is Firebase client config, not a service-account key, and must not be committed.

The owner must add or replace the encrypted GitHub Actions secret `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` using the refreshed config. Post-refresh CI run `38052808485` completed successfully overall, but Android SDK setup/native verification were still skipped. GitHub secret listing currently returns HTTP 403 to this integration; no secret value was read or changed. Do not paste config values into chat. The Google sign-in flow still needs a debug build signed with the registered development key and an authorized on-device sign-in test. Firebase Email/Password is not yet enabled; release signing remains separate and owner-controlled.

## Media storage

Firebase Storage is not used. Images, videos, PDFs, CNICs, documents, prescriptions, receipts, and other files use Cloudinary only.
