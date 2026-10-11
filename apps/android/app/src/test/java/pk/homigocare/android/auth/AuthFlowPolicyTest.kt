package pk.homigocare.android.auth

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AuthFlowPolicyTest {
    @Test
    fun unverifiedNewRegistrationMustRemainInVerificationFlow() {
        assertTrue(AuthFlowPolicy.shouldRouteToVerificationAfterRegistration(isRegistration = true, isEmailVerified = false))
    }

    @Test
    fun verifiedRegistrationCanContinueToProfileFlow() {
        assertFalse(AuthFlowPolicy.shouldRouteToVerificationAfterRegistration(isRegistration = true, isEmailVerified = true))
    }

    @Test
    fun signInIsNotTreatedAsRegistrationEvenWhenProviderDoesNotMarkEmailVerified() {
        assertFalse(AuthFlowPolicy.shouldRouteToVerificationAfterRegistration(isRegistration = false, isEmailVerified = false))
    }
}
