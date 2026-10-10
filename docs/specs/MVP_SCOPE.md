# MVP Scope — Authoritative Product Requirements

## 1. Product definition
HomiGo Care is a minimalist healthcare booking prototype connecting a patient with a verified Doctor or Nurse, with patient-controlled Health Passport access and an Admin safety-monitoring workflow.

**Product promise:** Convenience + Privacy + Safety.

## 2. Target roles (only these are exposed in the MVP)
1. **Patient** — searches for a Doctor or Nurse, books care, manages booking status, grants Health Passport access, and can trigger SOS.
2. **Professional** — one shared app/interface with a professional type of Doctor or Nurse; submits credentials, waits for Admin verification, receives/accepts bookings, and marks service complete.
3. **Admin** — verifies professionals, monitors bookings, and acknowledges/updates SOS alerts.

Do not implement the 29-role ecosystem in this build. Doctor and Nurse are professional types, not separate apps.

## 3. Must-have user stories
### Patient
- As a patient, I can log in using a demo-friendly authentication flow.
- I can view a simple home dashboard with Doctor, Nurse, Health Passport, and SOS.
- I can browse verified professionals and see basic name, type/specialty, qualification summary, rating (seeded if needed), and availability.
- I can open a professional profile and choose a service date/time and address.
- I can submit a booking and see a confirmation/status.
- I can set/use a four-digit Health Passport PIN and grant access for the selected booking.
- I can trigger SOS and see a clear confirmation that the Admin alert was created.

### Professional
- I can register as Doctor or Nurse and provide basic profile details.
- I can submit required identity/qualification documents or seeded sample documents for a demo.
- I can see Pending, Approved, Rejected, or Changes Required verification status.
- An approved professional can see an incoming booking, open details, accept/decline it, and mark it complete.
- A professional can view Health Passport data only after valid patient authorization for that booking.

### Admin
- I can sign in through a protected demo/admin flow.
- I can see pending professional verification, booking status, and open SOS alerts.
- I can open a professional record and approve/reject/request changes with a reason.
- I can inspect booking metadata and status, not unrestricted medical records.
- I can open an SOS alert, view available alert/location/contact information, acknowledge it, and update response status.

## 4. Required demo features
1. **Connected booking:** Patient creates booking; Professional receives same booking; status updates are visible.
2. **Health Passport PIN and authorization:** patient-controlled access with a visible grant/revoke or authorization status; log access events where implemented.
3. **SOS to Admin:** patient triggers SOS; Admin sees a real app/backend alert and can acknowledge it.
4. **Professional verification:** Admin approves a professional; only approved professionals may accept live bookings.

## 5. Screen inventory
Screen groups can be composed of reusable views; the listed groups are the minimum functional route map, not a demand for a separate Activity per item.

### Patient (8 core groups)
P-05 Login; P-06 Sign Up/OTP flow; P-11 Home Dashboard; P-13 Browse Professionals; P-14 Professional Profile; P-15 Booking Details; P-18/P-19 Booking Summary and Confirmation; P-16/P-24 Health Passport PIN/Passport; P-25 SOS. P-01 splash is optional if already in starter app.
Onboarding is optional. Keep profile/address fields minimal but collect required booking contact/location.

### Professional (5 core groups)
PR-02 Login; PR-03/PR-04 Registration and details; PR-05 Credential Upload; PR-07 Verification Status; PR-08 Dashboard; PR-11/PR-12 Booking Request and Details; PR-13/PR-14 Accept/Active Visit; PR-16 Complete Service. Reuse existing canonical IDs where available.

### Admin (5 core groups; proposed UI)
A-01 Login; A-02 Dashboard; A-03/A-03A Verification Queue/Detail; A-05/A-05A Booking Monitoring/Detail; A-06/A-06A SOS Monitoring/Alert Detail.
Admin IDs and UI are proposed because the source material did not define a complete Admin screen specification.

## 6. Explicitly out of scope
- The other 27 roles and role-specific portals.
- Public marketing website, waitlist, SEO pages and bilingual website.
- Medicine orders and pharmacy integrations.
- Lab test ordering and lab partner workflows.
- Wallet, real payments, commissions, payouts, coupons, referrals.
- Family profiles/account manager.
- Complex professional assessment/exam engine.
- Messaging/chat, reviews, earnings, full booking history, advanced schedules.
- Disputes, bulk notifications, broadcast tools, CSV exports, advanced analytics.
- Production ambulance dispatch, emergency-service integration, guaranteed offline SOS, SMS fallback unless separately implemented and tested.
- Production medical-record migration, clinical diagnosis or treatment recommendations.

## 7. Minimal UI principles
- White/light backgrounds; teal primary action; red reserved for SOS; orange used sparingly.
- One primary action per screen.
- Show only fields needed for the current task.
- Reuse existing design tokens, official logo, and icon set. No emoji as interface icons.
- Clear loading, empty, error, success, and disabled states.
- Accessible contrast, readable text, touch targets, and keyboard/back navigation.
- Keep dashboard cards to the four core entry points: Doctor, Nurse, Health Passport, SOS.

## 8. Data and security boundaries
- Use synthetic demo data only.
- Do not commit secrets or real patient records.
- Passwords must be hashed if real auth is used; development OTP bypass must be explicitly environment-gated.
- Enforce authorization on the backend, not only in UI.
- Patient medical data must not be visible to Admin by default.
- Store only the minimum medical demo data needed for the PIN/access flow.
- Health Passport access must be tied to a patient-approved professional/booking context.
- Log access events where the implementation supports them.
- SOS may show only location/contact details actually available and permissioned.
- Clearly label mocked location, SMS, payments, and verification if used.

## 9. MVP acceptance criteria
- A patient can complete one booking without dead ends.
- The booking appears in the professional panel and can be accepted and completed.
- An unapproved professional cannot accept a booking.
- The patient can authorize Health Passport access; unauthorized access is denied.
- SOS creates a persistent alert visible in Admin; Admin can acknowledge/update it.
- No Admin view exposes unrestricted patient medical records.
- Main screens use the existing design system and remain visually minimal.
- Demo data is clearly synthetic; no fake real-world dispatch/ETA claims.
- Build/test results are reported honestly.
