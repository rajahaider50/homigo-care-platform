package pk.homigocare.android.api

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import pk.homigocare.android.BuildConfig
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** Native client for public HomiGo endpoints. Provider keys and Firebase Admin credentials never ship in the app. */
object HomigoApiClient {
    data class OtpProof(val proof: String, val number: String)
    data class Registration(val uid: String, val role: String)

    fun isPakistaniMobileDigits(value: String): Boolean = Regex("^3[0-9]{9}$").matches(value)
    fun isOtp(value: String): Boolean = Regex("^[0-9]{6}$").matches(value)

    suspend fun sendWhatsAppOtp(numberDigits: String) {
        require(isPakistaniMobileDigits(numberDigits)) { "Enter exactly 10 Pakistani mobile digits beginning with 3." }
        val response = post("v1/send-otp", JSONObject().put("number", numberDigits))
        check(response.optBoolean("sent", false)) { "The server did not confirm that the WhatsApp code was sent." }
    }

    suspend fun verifyWhatsAppOtp(numberDigits: String, code: String): OtpProof {
        require(isPakistaniMobileDigits(numberDigits)) { "Enter exactly 10 Pakistani mobile digits beginning with 3." }
        require(isOtp(code)) { "Enter the six-digit WhatsApp code." }
        val response = post("v1/verify-otp", JSONObject().put("number", numberDigits).put("otp", code))
        val proof = response.optString("proof")
        val number = response.optString("number")
        check(response.optBoolean("verified", false) && proof.isNotBlank() && number.matches(Regex("^\\+923[0-9]{9}$"))) {
            "The secure verification service did not return a usable one-time proof."
        }
        return OtpProof(proof, number)
    }

    suspend fun registerVerifiedPatient(proof: String, displayName: String, email: String, password: String): Registration {
        require(proof.isNotBlank()) { "Verify the WhatsApp code before creating an account." }
        val response = post(
            "v1/auth/register",
            JSONObject()
                .put("proof", proof)
                .put("displayName", displayName.trim())
                .put("email", email.trim())
                .put("password", password)
                .put("role", "patient"),
        )
        val uid = response.optString("uid")
        val role = response.optString("role")
        check(response.optBoolean("created", false) && uid.isNotBlank() && role == "patient") {
            "The server did not confirm patient account creation."
        }
        return Registration(uid, role)
    }

    suspend fun signInWithPhonePassword(numberDigits: String, password: String): String {
        require(isPakistaniMobileDigits(numberDigits)) { "Enter the 10-digit Pakistani mobile number linked to your account." }
        require(password.isNotBlank() && password.length <= 128) { "Enter a valid password." }
        val response = post("v1/auth/sign-in-phone", JSONObject().put("number", numberDigits).put("password", password))
        val customToken = response.optString("customToken")
        check(response.optBoolean("signedIn", false) && customToken.isNotBlank()) {
            "The secure service did not confirm phone sign-in."
        }
        return customToken
    }

    suspend fun linkWhatsApp(proof: String, idToken: String) {
        require(proof.isNotBlank()) { "Verify a new WhatsApp code before linking the number." }
        require(idToken.isNotBlank()) { "Sign in before linking a WhatsApp number." }
        val response = post("v1/auth/claim-whatsapp", JSONObject().put("proof", proof), idToken)
        check(response.optBoolean("linked", false)) { "The server did not confirm WhatsApp linking." }
    }

    private suspend fun post(path: String, payload: JSONObject, idToken: String? = null): JSONObject = withContext(Dispatchers.IO) {
        val base = BuildConfig.HOMIGO_API_BASE_URL.trim().trimEnd('/')
        if (base.isBlank()) throw IOException("The secure HomiGo API URL is not configured in this Android build.")
        val connection = (URL("$base/api/${path.trimStart('/')}").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 12_000
            readTimeout = 15_000
            doOutput = true
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Content-Type", "application/json; charset=utf-8")
            setRequestProperty("Cache-Control", "no-store")
            if (!idToken.isNullOrBlank()) setRequestProperty("Authorization", "Bearer $idToken")
        }
        try {
            connection.outputStream.use { stream -> stream.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val rawBody = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            val body = runCatching { JSONObject(rawBody) }.getOrElse { JSONObject() }
            if (status !in 200..299) {
                val safeMessage = body.optString("error").takeIf { it.isNotBlank() }
                    ?: "The secure HomiGo service could not complete this request (HTTP $status)."
                throw IOException(safeMessage)
            }
            body
        } finally {
            connection.disconnect()
        }
    }
}
