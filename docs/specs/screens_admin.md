# Admin Web Panel — Minimalist MVP Screen Specification

**Admin UI IDs are proposed** because the source material does not define a complete Admin screen-by-screen UI.

| ID | Screen/group | MVP | Purpose | Main actions | Next |
|---|---|---|---|---|---|
| A-01 | Login | Yes | Protected Admin entry | Sign in | A-02 |
| A-02 | Dashboard | Yes | Three operational summaries | Verification / Bookings / SOS | A-03/A-05/A-06 |
| A-03/A-03A | Verification queue/detail | Yes | Review Doctor/Nurse applications | Approve / Reject / Request changes | A-03 |
| A-05/A-05A | Booking monitoring/detail | Yes | Inspect booking metadata/status | Open booking / Return | A-05 |
| A-06/A-06A | SOS monitoring/detail | Yes | Respond to patient alert | Acknowledge / Update status / Resolve | A-06 |

## Screen details

### A-01 — Login
- Fields: authorized Admin username/email and password; optional second factor only if it is already implemented.
- Generic errors and rate limiting where supported.
- No public Admin registration.

### A-02 — Dashboard
- Three compact summary cards: Pending Verifications, Active/Upcoming Bookings, Open SOS Alerts.
- Recent items list for verification and SOS.
- SOS banner is visually prominent and remains until the alert is acknowledged.
- No charts or analytics beyond these operational counts.

### A-03/A-03A — Professional Verification
- Queue shows name, type (Doctor/Nurse), submitted status, and application date.
- Detail shows identity/credential documents and relevant profile data.
- Actions: Approve, Reject, Request Changes; rejection/change requests require a reason.
- Approval status must update Professional access; unapproved professionals cannot accept bookings.
- Keep document access restricted to authorized Admin users.

### A-05/A-05A — Booking Monitoring
- Show booking ID, patient display name/identifier, professional, service type, scheduled time, and status.
- Admin may monitor operational metadata; no unrestricted Health Passport or clinical-record access.
- Do not add payment, commissions, disputes, or export tools.

### A-06/A-06A — SOS Monitoring
- List active alerts first.
- Detail shows alert timestamp, status, patient contact/ emergency contact only if configured, and location only if actually available and permissioned.
- Actions: Acknowledge, Update Status, Resolve; record a short note if supported.
- Never show a fake dispatch ID, ETA, or ambulance status.
- Persist alert status so it survives refresh and remains consistent with patient UI.

## Out of scope
User-management suite, disputes, advanced analytics, audit explorer, broadcast messaging, CSV exports, knowledge base, and unrestricted medical records.
