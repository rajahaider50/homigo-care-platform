# Firestore M1 rules — review summary

The M1 policy allows a **verified** Firebase identity to create/read only its own minimal `profiles/{uid}` document. Creation requires the authenticated UID and token email to match the document, an immutable `role: patient`, a 2–80 character display name, and server timestamps. An owner may later change only `displayName` and `updatedAt`. Deletion is always denied.

A verified account with the Firebase custom claim `admin == true` may read one profile or list profiles only through a query capped at 100; Admin still cannot write profiles through this rule. All unspecified collections deny all reads and writes. In particular, legacy `presence`, `bookings_live`, and `chat_threads` access is denied by the catch-all rule. This does **not** delete any stored documents, but existing clients using those broad legacy paths will be denied until later phase-specific rules and flows are deployed.

Before deployment, test both allowed and denied cases in the Firestore Rules validator and isolated emulator tests. The exact contents of `firestore.rules` must be shown to the user for final confirmation. No remote rules deployment is authorized by this summary alone.


## Latest M1 verification (2026-10-10)

The candidate rules and isolated emulator tests were rechecked. The suite passes **8/8**, including anonymous profile read/list denial, patient profile-list denial, unverified-admin read/list denial, and denial of reads/writes under `patient_health_records`, `health_passports`, and `payments` even for an Admin claim. Test identities and attempted writes exist only in the isolated Emulator; no shared Firebase records were created.

The live Firestore Data view showed no documents. The Firebase Console Rules editor did not render the active source during this check, and Firebase CLI has no authorized account in the Sandbox. The last verified live state remains production-mode deny-all. **No live rules were edited or deployed.** Continue to require review of the exact rules file and explicit user approval before any deployment; never enable public access or health/payment access as a shortcut.
