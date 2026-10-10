# HomigoCare Phase 0 status — 2026-09-28

## Decision

**Phase 0 is not yet complete for live integration.** The repository and service foundations are in place, but the blueprint's end-to-end proof and several production credentials/configurations remain outstanding. Feature-phase work can begin on typed interfaces and UI foundations, but it would be inaccurate to call Phase 0 fully closed.

## Completed

- Four private GitHub repositories created and actively pushed:
  - HOMIGO-CARE-ANDROID
  - HOMIGO-CARE-IOS
  - HOMIGO-CARE-WEB
  - HOMIGO-CARE-ADMIN
- Firebase production and development projects selected and Android apps registered.
- Production Android app has debug and release SHA-1/SHA-256 fingerprints.
- Development Android app now has separate debug and release SHA-1/SHA-256 fingerprints, avoiding package/SHA collisions.
- Firebase Storage removed from active repository configuration and architecture; Cloudinary is the only media/document storage decision.
- Cloudinary HomigoCare folder structure created for documents, profile photos, prescriptions, receipts, and public app assets.
- Supabase schema/RLS migration and repository contracts are present.
- Web and Admin Vite production builds pass.
- Supplied platform image bundles installed:
  - Android: 20 PNGs in `assets_pending/generated/`
  - iOS: 20 PNGs in `HomigoCare/Resources/Assets.xcassets/Illustrations/`
  - Web: 20 supplied JPEG illustrations in `public/illustrations/`
  - Admin: 20 supplied JPEG illustrations in `public/illustrations/`
- Each platform's `01_ai_images.json` now points to its own real assets and screen mappings; the old identical cross-platform file is gone.

## Important icon clarification

The supplied `assets.zip` contains four AI image bundles, not a new master app logo, launcher icon, favicon, or Android adaptive-icon foreground/background. Therefore the existing founder-provided brand icon was **not deleted**. The old Android generated illustration bundle was replaced with the supplied Android bundle. A replacement launcher/logo must be supplied separately before changing the authoritative launcher assets.

## Remaining Phase 0 blockers

1. Verify/create Cloudinary upload presets:
   - `homigo_public_assets` (unsigned, app_assets restricted)
   - `homigo_user_documents` (signed)
2. Add Cloudinary cloud name/presets and signed-upload endpoint secrets to the Admin deployment environment; never put the API secret in client apps.
3. Configure Supabase project URLs/anon keys and Admin service-role secret in the appropriate deployments.
4. Configure Admin API base URL and deploy the Admin API endpoints.
5. Configure EmailJS service/template/private key for OTP delivery.
6. Configure Firebase Admin service account for server-side push notifications.
7. Generate/configure Web Push VAPID key; configure APNs only after Apple Developer access exists.
8. Perform the blueprint's real cross-platform round-trip test: real account -> Supabase/Admin visibility, real verification update -> client realtime update, and push delivery checks.
9. Run Android Gradle and iOS Xcode builds on their appropriate build environments; Sandbox did not produce signed mobile builds.

## Recommendation

Proceed to the next phase only as **UI/feature foundation work**, while treating live integration Phase 0 as open until the blockers above are configured and the round-trip test passes.
