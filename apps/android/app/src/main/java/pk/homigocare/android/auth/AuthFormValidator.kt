package pk.homigocare.android.auth

object AuthFormValidator {
    private val emailPattern = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")

    fun validate(isSignUp: Boolean, name: String, email: String, password: String): String? {
        if (isSignUp && name.trim().length !in 2..80) return "Enter your full name (2–80 characters)."
        if (!emailPattern.matches(email.trim())) return "Enter a valid email address."
        if (password.isBlank()) return "Enter your password."
        if (isSignUp && password.length < 8) return "Use a password with at least 8 characters."
        return null
    }

    fun validateEmail(email: String): Boolean = emailPattern.matches(email.trim())

    fun validatePhoneLogin(phoneDigits: String, password: String): String? {
        if (!Regex("^3[0-9]{9}$").matches(phoneDigits)) return "Enter the 10-digit Pakistani mobile number linked to your account."
        if (password.isBlank()) return "Enter your password."
        return null
    }
}
