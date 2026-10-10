# Firebase email-action verification findings

## What the Firebase action URL must contain

Firebase's official custom-handler guide says user-management action links include `mode`, one-time `oobCode`, and the project's `apiKey`; an optional `continueUrl` and `lang` can also be present. For email verification the supported mode is `verifyEmail`; the app applies the code with `applyActionCode`. For password reset, the handler first calls `verifyPasswordResetCode`, then calls `confirmPasswordReset` after the user enters a new password. An action code is single-use, so the code in the user's old screenshot must not be replayed.

Firebase allows a custom action handler hosted on the product's own website, but the Firebase Auth email template must be configured to point to that handler. The official Firebase Help Center says to edit the relevant email template and choose **Customize action URL**; Firebase then appends `mode` and `oobCode` to that URL. The website route should therefore accept both query parameters and clearly report invalid/expired codes.

`ActionCodeSettings.url` is the state/continue URL, not the setting that selects the email action handler. The continue-URL domain must be added to Firebase Authentication's authorized domains. With `handleCodeInApp: false`, Firebase handles the code on the web action page and can then return the user to the app/site. Direct mobile-app handling requires Android App Links/intent-filter setup; do not use the deprecated `dynamicLinkDomain` option.

## HomiGo repair path

1. The app/site sends verification and password-reset requests with a continue URL pointing to the deployed Public Website.
2. After Vercel has assigned a stable domain, add that exact domain to Firebase Auth's authorized domains.
3. Configure the Firebase email-verification template's custom action URL to `https://<public-site-domain>/auth/action`; configure the password-reset template similarly if the custom reset handler is used.
4. The route dispatches only supported Firebase action modes and consumes codes without logging them. It displays a clear success, expired, or invalid state and refreshes signed-in Firebase state before any profile write.
5. Test using a newly generated development verification email; never test the screenshot's old one-time code.

The error text in the screenshot says the selected mode is invalid, but the screenshot URL shows `mode=verifyEmail`, which Firebase documents as valid. The official documentation does not establish the exact cause of that specific screenshot. A fresh link after configuring the handler is the required end-to-end confirmation; until then, the root cause is not claimed as proven.

## References

- Firebase custom email-action handler: https://firebase.google.com/docs/auth/custom-email-handler
- Firebase Android user management: https://firebase.google.com/docs/auth/android/manage-users
- Firebase action-link generation and `ActionCodeSettings`: https://firebase.google.com/docs/auth/admin/email-action-links
- Firebase continue-URL and mobile-link behavior: https://firebase.google.com/docs/auth/web/passing-state-in-email-actions
- Firebase email-template action URL customization: https://support.google.com/firebase/answer/7000714?hl=en
