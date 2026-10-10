# Security & Privacy — Minimalist MVP

## Required baseline
- Use synthetic demo data only.
- Do not commit API keys, passwords, signing keys, real CNICs, or medical records.
- Gate demo OTP bypass behind an explicit local environment flag and prevent it in production configuration.
- Authenticate every non-public API request.
- Enforce role-based authorization on the server.
- Verify a professional is Approved before accepting a booking.
- Enforce patient authorization before any professional reads Health Passport data.
- Admin does not get unrestricted clinical-record access.
- Validate input on server and client; return generic authentication errors; apply rate limits to login/OTP/SOS endpoints where supported.
- Store password hashes, never plaintext passwords, if password authentication is implemented.
- Keep access logs for Health Passport reads/grants/revokes where implemented.
- Minimize collected fields and retention. Do not collect more medical information than the demo needs.
- Use HTTPS in any deployed environment; local HTTP is for local development only.

## Four-digit PIN
The PIN is a prototype feature, not sufficient by itself to claim production-grade security. If implemented:
- Never store the PIN in plaintext.
- Rate-limit failed attempts and lock temporarily after repeated failures.
- Avoid logging PIN values.
- Tie authorization to a patient, professional, and booking/context.
- Allow the patient to revoke access where supported.
- Deny access by default if authorization is missing, expired, or revoked.

## Admin privacy boundary
Admin can view professional verification documents, booking metadata, and SOS operational details. Admin cannot open the patient's Health Passport merely because they are an Admin.

## Demo honesty
Label seeded documents, simulated OTP, mock location, and non-production integrations. Never claim production security, regulatory compliance, or clinical validation without review and evidence.
