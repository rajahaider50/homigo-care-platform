# Professional Android App — Minimalist MVP Screen Specification

One shared app for two professional types: Doctor and Nurse.

| ID | Screen/group | MVP | Purpose | Main actions | Next |
|---|---|---|---|---|---|
| PR-02 | Login | Yes | Authenticate professional | Login / Register | PR-08 / PR-03 |
| PR-03/PR-04 | Registration + details | Yes | Select Doctor/Nurse and enter basic profile | Continue | PR-05 |
| PR-05 | Credential Upload | Yes | Submit identity and relevant qualification documents | Upload / Submit | PR-07 |
| PR-07 | Verification Status | Yes | Show Pending/Approved/Rejected/Changes Required | Refresh / Return | PR-08 when approved |
| PR-08 | Dashboard | Yes | Show availability/verification and incoming bookings | Open request | PR-11/PR-12 |
| PR-11/PR-12 | Booking list/detail | Yes | Review booking details | Accept / Decline | PR-13 / PR-11 |
| PR-13/PR-14 | Accepted/Active service | Yes | View accepted booking and update status | Start / Complete | PR-16 |
| PR-15 | Authorized Health Passport | Yes, minimal | View permitted synthetic patient details | View after authorization | PR-14/PR-16 |
| PR-16 | Complete Service | Yes | Mark service complete | Complete | PR-08 |

## Screen details

### PR-02 — Login
- Existing professional login and register actions.
- Route approved professionals to dashboard; pending/rejected accounts to verification status.
- Use generic auth errors.

### PR-03/PR-04 — Registration and details
- Choose exactly Doctor or Nurse.
- Collect name, phone, contact details, professional type, specialty/service description, and relevant registration details.
- Do not show 29-role selector.
- Keep only fields needed to create the profile and verify credentials.

### PR-05 — Credential Upload
- Identity document and relevant qualification/license/certification upload.
- Show upload status and validation errors.
- Use synthetic demo files when necessary and label them as demo data.

### PR-07 — Verification Status
- Status values: Pending, Approved, Rejected, Changes Required.
- Explain that only Approved professionals can accept bookings.
- Do not implement the full assessment/exam engine in MVP.

### PR-08 — Dashboard
- Show verification state and a simple incoming/upcoming booking list.
- Approved professional: open booking.
- Unapproved professional: show status and do not allow accept action.
- No earnings, advanced analytics, chat, reviews, or complex schedule controls.

### PR-11/PR-12 — Booking request
- Show patient display name or safe identifier, service, date/time, address needed for visit, and patient-provided reason if supplied.
- Actions: Accept, Decline.
- Update server-side status; the patient/admin views must reflect the same status.

### PR-13/PR-14/PR-16 — Service status
- Show accepted booking and essential contact/service details.
- Support Start/In Progress and Complete only if this status is in the current state machine.
- Do not claim live GPS tracking unless implemented and tested.

### PR-15 — Health Passport access
- Require a valid patient authorization for the selected booking.
- If authorization is missing, expired, or revoked, show access denied.
- Display only the minimum synthetic data required by the demo.
- Do not let professional access persist outside the allowed context.

## Out of scope
Certification exam engine, earnings/wallet, ratings/reviews, messaging, full booking history, complex availability settings, multiple professional sub-roles, and advanced notifications.
