# Firebase environment and Android signing status

## Firebase projects

- Production: `homigo-care-76e21`
- Previous development project: `homigo-care-dev-76e21`
- Current development project: `homigo-care-dev-20261010`
- Android package: `pk.homigocare.android`

## Development signing fingerprints

The development Android app uses separate keys from production to avoid Firebase package/SHA collisions.

- Dev Debug SHA-1: `E0:75:5E:5E:CC:34:B4:F0:CB:D7:73:3B:6C:73:49:F2:FD:0C:6E:2A`
- Dev Debug SHA-256: `A4:48:15:32:9D:28:8A:F3:F4:1B:66:C6:00:B6:8B:E3:A6:DF:4E:E7:6D:07:34:73:B0:EB:D0:19:C0:C0:B6:FC`
- Dev Release SHA-1: `DF:8B:ED:09:D6:AE:7E:A4:25:45:E3:59:1F:22:0A:9C:9F:1F:92:50`
- Dev Release SHA-256: `08:25:65:E9:68:35:87:DC:CA:6A:FA:10:C2:21:C3:D2:34:82:06:A4:6E:17:F1:B9:2A:88:E4:7A:9F:24:EA:5F`

All four fingerprints above remain registered on the previous development Android app (`homigo-care-dev-76e21`). The current project now has the Android app `HomiGo Care Android` registered (app ID `1:835894740292:android:85ef8ad75baeaf4ca7c311`), but no fingerprints are registered on it. Firebase warned that reusing the existing debug SHA-1/package pair would collide with an OAuth 2.0 client in another project and that Google API calls signed with it may fail. I removed only the just-added fingerprint; the previous development and production projects remain unchanged. Resolve the signing/OAuth conflict before enabling Android Google sign-in.

The current project's `google-services.json` was downloaded but not committed. Writing `FIREBASE_ANDROID_GOOGLE_SERVICES_JSON` to GitHub Actions failed with HTTP 403 (`Resource not accessible by integration`); no secret was written or overwritten. The workflow's Android SDK and native verification steps were therefore skipped. Do not paste config contents into chat or commit them.

## Media storage

Firebase Storage is not used. Images, videos, PDFs, CNICs, documents, prescriptions, receipts, and other files use Cloudinary only.
