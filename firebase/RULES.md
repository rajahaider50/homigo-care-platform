# Firestore M1 rules — review summary

The M1 policy allows a **verified** Firebase identity to create/read only its own minimal `profiles/{uid}` document. Creation requires the authenticated UID and token email to match the document, an immutable `role: patient`, a 2–80 character display name, and server timestamps. An owner may later change only `displayName` and `updatedAt`. Deletion is always denied.

A verified account with the Firebase custom claim `admin == true` may read one profile or list profiles only through a query capped at 100; Admin still cannot write profiles through this rule. All unspecified collections deny all reads and writes. In particular, legacy `presence`, `bookings_live`, and `chat_threads` access is denied by the catch-all rule. This does **not** delete any stored documents, but existing clients using those broad legacy paths will be denied until later phase-specific rules and flows are deployed.

Before deployment, test both allowed and denied cases in the Firestore Rules validator and isolated emulator tests. The exact contents of `firestore.rules` must be shown to the user for final confirmation. No remote rules deployment is authorized by this summary alone.
