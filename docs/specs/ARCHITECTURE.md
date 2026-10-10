# Architecture — Minimalist MVP

## Surfaces
- `apps/android-patient`: native Android Kotlin/Compose patient interface if the starter architecture supports separate apps.
- `apps/android-professional`: native Android Kotlin/Compose shared Doctor/Nurse interface.
- `apps/admin-web`: protected Admin interface.
- `services/api`: API service or existing mock API for auth, professionals, bookings, Health Passport authorization, and SOS.
- `04_DESIGN_SYSTEM`: shared visual tokens, logo, icons, illustrations.

If the current repository layout differs, inspect it and preserve working architecture rather than restructuring blindly. No public website is required for MVP.

## Core domain objects
- `User` with role Patient / Professional / Admin.
- `ProfessionalProfile` with type Doctor/Nurse, credentials metadata, and verification status.
- `Booking` with patient, professional, service type, time, address, and status.
- `HealthPassport` with minimal synthetic demo data.
- `PassportGrant` scoped to patient + professional + booking, with expiry/revocation as supported.
- `PassportAccessLog` for grant/revoke/read events where implemented.
- `SosAlert` with status and optional location/contact metadata.
- `AdminActionLog` for verification and SOS status changes where supported.

## Core state machines
Professional verification: `DRAFT -> PENDING -> APPROVED | REJECTED | CHANGES_REQUIRED`.
Booking: `REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED`, with `DECLINED` or `CANCELLED` where supported.
Health Passport grant: `NOT_GRANTED -> GRANTED -> REVOKED | EXPIRED`.
SOS: `CREATED -> ACKNOWLEDGED -> RESOLVED`.

## Integration rule
Use the existing OpenAPI/mock API where it supports the MVP. If routes are missing, add only the minimum required endpoints and update the contract. Do not implement unrelated legacy endpoints just because they are in the old contract.
