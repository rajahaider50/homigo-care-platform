package pk.homigocare.android.auth

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AuthFormValidatorTest {
    @Test fun signupRequiresNameEmailAndStrongPassword() {
        assertEquals("Enter your full name (2–80 characters).", AuthFormValidator.validate(true, "A", "user@example.com", "Password123"))
        assertEquals("Enter a valid email address.", AuthFormValidator.validate(true, "Ada Patient", "bad-email", "Password123"))
        assertEquals("Use a password with at least 8 characters.", AuthFormValidator.validate(true, "Ada Patient", "user@example.com", "short"))
        assertNull(AuthFormValidator.validate(true, "Ada Patient", "user@example.com", "Password123"))
    }

    @Test fun loginAllowsAnExistingShorterPasswordButRequiresIt() {
        assertEquals("Enter your password.", AuthFormValidator.validate(false, "", "user@example.com", ""))
        assertNull(AuthFormValidator.validate(false, "", "user@example.com", "123456"))
    }

    @Test fun phoneLoginRequiresLinkedPakistaniNumberAndPassword() {
        assertEquals("Enter the 10-digit Pakistani mobile number linked to your account.", AuthFormValidator.validatePhoneLogin("234", "secret"))
        assertEquals("Enter your password.", AuthFormValidator.validatePhoneLogin("3495031007", ""))
        assertNull(AuthFormValidator.validatePhoneLogin("3495031007", "existing-password"))
    }

    @Test fun emailValidationRejectsWhitespaceAndMissingDomain() {
        assertTrue(AuthFormValidator.validateEmail(" user@example.com "))
        assertEquals(false, AuthFormValidator.validateEmail("user example.com"))
        assertEquals(false, AuthFormValidator.validateEmail("user@localhost"))
    }
}
