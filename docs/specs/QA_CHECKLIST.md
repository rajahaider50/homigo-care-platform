# MVP QA Checklist

## Patient
- [ ] Login/demo entry works and invalid inputs show clear errors.
- [ ] Home dashboard contains only Doctor, Nurse, Health Passport, and SOS as primary actions.
- [ ] Unverified professionals are not offered as bookable options.
- [ ] Patient can open a professional profile and submit a booking.
- [ ] Booking confirmation shows the correct service, professional, time, and status.
- [ ] Patient can set/use the demo Health Passport PIN without PIN exposure in logs.
- [ ] Unauthorized Health Passport access is denied.
- [ ] Patient can trigger SOS and sees honest submission/status feedback.

## Professional
- [ ] Professional can register as Doctor or Nurse.
- [ ] Required fields/documents are validated.
- [ ] Pending professional cannot accept a booking.
- [ ] Approved professional sees the patient booking.
- [ ] Professional can accept/decline and update completion status.
- [ ] Health Passport is accessible only after patient authorization.

## Admin
- [ ] Admin route requires authentication.
- [ ] Admin dashboard shows verification queue, booking status, and active SOS.
- [ ] Admin can approve/reject/request changes with a reason.
- [ ] Admin can inspect booking metadata without unrestricted medical-record access.
- [ ] Admin can acknowledge and resolve an SOS alert.
- [ ] Alert updates are reflected across relevant views.

## Design and quality
- [ ] Existing design tokens/logo/icons are used consistently.
- [ ] Screens remain uncluttered with one primary action.
- [ ] Loading, empty, error, and success states exist on core routes.
- [ ] Keyboard/back navigation and form labels work.
- [ ] No emoji icons, placeholder lorem ipsum, or unlabelled mock claims.
- [ ] No real credentials or patient data in the repository.

## End-to-end acceptance
- [ ] Patient creates booking -> Professional receives/accepts -> status updates.
- [ ] Patient grants Health Passport access -> authorized Professional access succeeds.
- [ ] Patient triggers SOS -> Admin alert appears -> Admin acknowledges/resolves.
- [ ] Run build/lint/tests; report only actual results.
