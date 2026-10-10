package pk.homigocare.android.api

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HomigoApiClientTest {
    @Test fun acceptsOnlyTenPakistaniMobileDigitsStartingWithThree() {
        assertTrue(HomigoApiClient.isPakistaniMobileDigits("3495031007"))
        assertFalse(HomigoApiClient.isPakistaniMobileDigits("03495031007"))
        assertFalse(HomigoApiClient.isPakistaniMobileDigits("2495031007"))
        assertFalse(HomigoApiClient.isPakistaniMobileDigits("349503100"))
        assertFalse(HomigoApiClient.isPakistaniMobileDigits("34950310070"))
        assertFalse(HomigoApiClient.isPakistaniMobileDigits("34950x1007"))
    }

    @Test fun acceptsOnlySixAsciiOtpDigits() {
        assertTrue(HomigoApiClient.isOtp("123456"))
        assertFalse(HomigoApiClient.isOtp("12345"))
        assertFalse(HomigoApiClient.isOtp("1234567"))
        assertFalse(HomigoApiClient.isOtp("12 456"))
        assertFalse(HomigoApiClient.isOtp("１２３４５６"))
    }
}
