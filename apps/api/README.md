# HomiGo shared API

This Vercel Node API is the single server-side boundary for Android and the Web clients. It forwards WhatsApp OTP requests to the supplied Java gateway; `x-api-key` is never sent to a browser or mobile client.

## Routes

- `GET /api/health` — returns only readiness flags; reports `ready` only when the WhatsApp gateway, Firebase Admin, Firebase Identity Toolkit key, OTP signing secret, and Web origin allowlist are configured. It never returns a secret value.
- `POST /api/v1/send-otp` — `{ "number": "3495031007" }`; accepts a Pakistani mobile with 10 local digits beginning in `3` or its `+92` form, then forwards `{ "number": "923495031007" }` (digits only, without a leading plus) to the documented gateway path.
- `POST /api/v1/verify-otp` — `{ "number": "3495031007", "otp": "123456" }`; requires an explicit success response from the gateway and returns a short-lived signed, one-use proof.
- `POST /api/v1/auth/register` — creates a Firebase Auth account only after a valid proof; supported roles are `patient` and `professional`.
- `POST /api/v1/auth/claim-whatsapp` — links an already email-verified Firebase/Google account to a freshly verified WhatsApp number. Send the Firebase ID token as `Authorization: Bearer …` and the signed proof in the JSON body.
- `POST /api/v1/auth/sign-in-phone` — `{ "number": "3495031007", "password": "…" }`; resolves the HMAC-protected phone index, verifies the password through Firebase Identity Toolkit, validates the returned ID token against the mapped user, and returns only a Firebase custom token to the client.

Unknown upstream verification response shapes fail closed. Do not loosen this check until the gateway provides a sanitized success/failure response example.

## Rate limits

- OTP send: at most 3 per phone per hour with a 60-second cooldown, and 15 per source IP per hour.
- OTP verification: at most 5 per phone per hour and 30 per source IP per hour.
- Phone/password sign-in: at most 5 per phone per 15 minutes and 20 per source IP per 15 minutes.
- Only HMAC-derived bucket IDs are persisted; raw phone numbers and IP addresses are not stored in limiter documents. Rate limiting fails closed if Firebase Admin/Firestore is unavailable.

## Vercel environment (API project only)

Set the following on the API project. Keep server credentials in encrypted/sensitive Vercel environment variables; never add them to Git, `.env.example`, Web build variables, Android resources, or screenshots:

- `WHATSAPP_GATEWAY_BASE_URL` — HTTPS origin/base for the external gateway (without the endpoint path).
- `WHATSAPP_GATEWAY_API_KEY` — gateway's `x-api-key` value.
- `HOMIGO_ALLOWED_ORIGINS` — comma-separated exact Public/Admin staging origins after Vercel assigns domains; do not use `*`.
- `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` — dedicated least-privilege service-account JSON for `homigo-care-dev-20261010` only.
- `FIREBASE_WEB_API_KEY` — Firebase Web API key for the selected dev project; used server-side for Firebase Identity Toolkit password sign-in.
- `OTP_PROOF_SECRET` — at least 32 random bytes, used to sign expiring verification proofs, hash phone-index keys, and derive rate-limit bucket IDs.

The Admin SDK initializer intentionally refuses a service account for any project other than `homigo-care-dev-20261010`.

## Current integration boundary

The Firebase development project and Web/Android client SDK configs are connected, the tested Firestore rules are released to the selected development project, and the API is live on Vercel. The gateway base URL, gateway key, Firebase Admin service account, and OTP proof secret are stored server-side in sensitive Vercel variables. The live health endpoint reports Firebase Admin, Identity Toolkit, OTP gateway, proof signing, and allowed origins as ready. Local API tests still use synthetic values and mocked upstream responses; no unsolicited real OTP was sent during this update. Rate-limited OTP, bot pairing, direct chat, and changing gateway-side settings remain outside this adapter's contract.

## External protocol reference

The phone/password proxy follows Google's [Identity Platform `accounts.signInWithPassword` REST reference](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/signInWithPassword). The server verifies the returned ID token before exchanging it for a custom token; neither the user's password nor the upstream ID token is returned to the HomiGo client.
