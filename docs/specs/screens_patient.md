# Patient Android App — Minimalist MVP Screen Specification

Only the screens below are in scope. Legacy IDs are preserved where possible; combine related screens into reusable routes where that reduces complexity.

| ID | Screen/group | MVP | Purpose | Main actions | Next |
|---|---|---|---|---|---|
| P-05 | Login | Yes | Enter patient app | Login / Create account | P-11 / P-06 |
| P-06/P-07 | Sign-up + OTP/demo verification | Yes | Create patient account | Submit details / Verify | P-11 |
| P-11 | Home Dashboard | Yes | Four clear entry points | Doctor / Nurse / Health Passport / SOS | P-13 / P-24 / P-25 |
| P-13 | Browse Professionals | Yes | List approved providers | Search/filter basic; select provider | P-14 |
| P-14 | Professional Profile | Yes | Show provider essentials | Book | P-15 |
| P-15 | Booking Details | Yes | Choose date/time/address/service | Confirm details | P-18 |
| P-18/P-19 | Booking Summary + Confirmation | Yes | Submit and show booking | Confirm / View status | PR-11 / P-11 |
| P-16/P-24 | Health Passport PIN + Passport | Yes | PIN and authorization | Enter PIN / Grant or revoke access | PR-15 / P-11 |
| P-25 | SOS | Yes | Create safety alert | Confirm SOS / View status | A-06/A-06A |
| P-08/P-09/P-10 | Minimal profile fields | Supporting | Collect only name, phone, booking address, emergency contact if used | Save | P-11 |

## Minimal screen details

### P-05 — Login
- Fields: phone/email and password or existing demo authentication method.
- Actions: Login, Create account.
- States: loading, invalid credentials, success.
- Do not add social login or unnecessary authentication methods.

### P-06/P-07 — Sign-up and verification
- Fields: name, phone, password only if required by existing auth; OTP when enabled.
- Do not require family-member setup.
- Demo OTP bypass must be environment-gated and labeled as development behavior.

### P-11 — Home Dashboard
- Show HomiGo Care logo/wordmark, brief greeting, and four primary actions: Doctor, Nurse, Health Passport, SOS.
- Optional small booking-status card if a booking exists.
- Avoid medicine, lab, wallet, referral, family, and rewards cards.

### P-13 — Browse Professionals
- Show only approved Doctors/Nurses.
- Each card: name, professional type/specialty, concise qualification summary, availability, and seeded rating only if clearly demo data.
- Action: Open profile.
- Include loading, no-results, and error states.

### P-14 — Professional Profile
- Show name, type, relevant qualifications, experience/service summary, available times, and service price if the project has a configured demo price.
- Action: Book.
- Do not imply credential checks beyond the verification status actually stored.

### P-15 — Booking Details
- Fields: service type (Doctor consultation or Nurse home visit), date/time, address, concise optional reason for visit.
- Action: Continue/Confirm.
- Validate required fields; prevent booking with an unapproved provider.

### P-18/P-19 — Booking Summary and Confirmation
- Show professional, service, date/time, address, booking ID/status.
- Action: Confirm booking; view booking status.
- No real payment flow. If an old payment component appears, remove it from the MVP path or label it as a non-blocking sandbox placeholder.

### P-16/P-24 — Health Passport PIN and record
- Patient creates/enters four-digit PIN.
- Display only minimal synthetic demo health data.
- Patient explicitly grants access to the selected professional for the relevant booking.
- Show authorization state and revoke action if implemented.
- Never show PIN in logs. Unauthorized access must fail server-side.

### P-25 — SOS
- Explain briefly what SOS does in the prototype.
- Confirmation step to avoid accidental activation.
- After submit, show alert status, timestamp, and location status if available.
- Never claim an ambulance was dispatched.

## Navigation rule
Keep the bottom navigation minimal, if needed: Home, Booking, Health Passport, Profile. SOS should be prominent but not a permanent competing primary CTA on every sub-screen. Red is reserved for emergency state.

## Out of scope
Onboarding carousel, family management, lab/medicine ordering, wallet, referrals, rewards, full medical history, advanced live tracking, chat, review flow, complex settings, and advanced booking history.
