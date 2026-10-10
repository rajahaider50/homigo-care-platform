# MVP State Machines

## Professional verification
`DRAFT -> PENDING -> APPROVED | REJECTED | CHANGES_REQUIRED`
Only `APPROVED` professionals can accept bookings. Rejected/changes-required accounts must not appear as verified/bookable.

## Booking
`REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED`
Alternative terminal paths: `DECLINED`, `CANCELLED` if supported by current implementation.
All panels must show the same server-side status. Do not fake a status change in only one UI.

## Health Passport authorization
`NOT_GRANTED -> GRANTED -> REVOKED | EXPIRED`
Grant must be patient-controlled and scoped to the relevant professional/booking. Read access requires a valid grant. Log access events where implemented.

## SOS
`CREATED -> ACKNOWLEDGED -> RESOLVED`
An alert is active while `CREATED`; the Admin dashboard should show it until acknowledged. Keep the status persisted so refreshing the page does not remove it.
