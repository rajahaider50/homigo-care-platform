# Android brand refresh — 2026-10-10

## Source review
- Read all 31 pages of `HomiGoCare_AI_Build_Kit/01_MASTER_GUIDE/HomiGoCare_Master_Guide.pdf` and the included design-system specification/token files.
- The design system and its `design/tokens.json` are the source of truth; logo artwork may retain only its own documented brand accents.

## Integrated assets
- Copied all **107 original Android VectorDrawable icons** (`hg_ic_*.xml`) into `app/src/main/res/drawable/` and added the supplied `HgIcon` catalog/composable helper.
- Copied the **2 official transparent horizontal logo lockups** used by the UI into `drawable-nodpi/` unchanged; authentication, verification, home and splash screens use the supplied original artwork.
- Copied all **17 supplied Android launcher resources** (density-specific, round and adaptive icon resources) without resizing; the manifest now references both official launcher icons.
- No emoji or replacement/redrawn logo is used.

## Palette and components
- The centralized Compose palette uses the PDF tokens: primary `#1B6B63`, dark teal `#0D4A44`, secondary `#F5823A`, neutral white/`#F5F5F5`, text `#333333`/`#888888`, emergency red `#E53935`, and success green `#43A047`, plus the specified tonal/border values. XML system-bar colors reference the same exact dark-teal and white tokens.
- Logo-only accents remain confined to the original supplied logo artwork. SOS is the only emergency-red feature. Corner radii, type sizes, and touch heights follow the supplied design tokens.
- The ZIP has no `.ttf`/`.otf` font files although the PDF names Plus Jakarta Sans and Noto families; therefore Android's native sans fallback remains in use. No external font was substituted.

## Scope and integrity
- APK version was raised from `0.1.0 (1)` to `0.2.0 (2)`.
- Firebase Auth is still the actual dev Firebase sign-up/login/verifications integration. The shared booking, patient-profile, Health Passport, provider, and SOS API flows are not claimed complete or connected in this phase. The Home screen labels those features as not yet connected; the emergency action only opens the phone dialer for 1122, it does not place a call or claim an alert was dispatched.
- The provided screenshot shows a verification email from the configured development Firebase project. The screenshot's verification action URL contains a one-time code/API key and should not be posted publicly.

## Validation
- `./gradlew --no-daemon testDebugUnitTest lintDebug assembleDebug` succeeded; APK package/version: `pk.homigocare.android`, `0.2.0` (version code `2`).
- Lint reports **0 errors and 6 warnings**: four dependency-version advisories and two expected `IconXmlAndPng` advisories because the original density PNG launcher fallbacks and adaptive launcher XML intentionally share resource names.
