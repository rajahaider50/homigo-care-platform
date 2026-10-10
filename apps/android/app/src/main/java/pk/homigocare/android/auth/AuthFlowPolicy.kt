package pk.homigocare.android.auth

/** Pure routing rule for newly registered accounts and verified-only profile creation. */
internal object AuthFlowPolicy {
    fun shouldRouteToVerificationAfterRegistration(
        isRegistration: Boolean,
        isEmailVerified: Boolean,
    ): Boolean = isRegistration && !isEmailVerified
}
