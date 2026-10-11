package pk.homigocare.android

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.lifecycleScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import pk.homigocare.android.api.HomigoApiClient
import pk.homigocare.android.auth.AuthFormValidator
import pk.homigocare.android.auth.AuthFlowPolicy
import pk.homigocare.android.auth.AuthRepository
import pk.homigocare.android.auth.AuthScreen
import pk.homigocare.android.auth.EmailNotVerifiedException
import pk.homigocare.android.auth.WhatsAppLinkScreen
import pk.homigocare.android.care.PatientCareRepository
import pk.homigocare.android.care.PatientCareScreen
import pk.homigocare.android.designsystem.HomiGoSplashScreen
import pk.homigocare.android.designsystem.icons.HgIcon
import pk.homigocare.android.designsystem.icons.HgIconImage
import pk.homigocare.android.designsystem.theme.HgColor
import pk.homigocare.android.designsystem.theme.HomiGoTheme
import pk.homigocare.android.home.HomeScreen
import pk.homigocare.android.profile.PatientProfile
import pk.homigocare.android.profile.PatientProfileRepository

class MainActivity : ComponentActivity() {
    @SuppressLint("CredentialManagerSignInWithGoogle") // The credential type is checked and its ID token is parsed below.
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val auth = AuthRepository(FirebaseAuth.getInstance())
        val profiles = PatientProfileRepository()
        val careRepository = PatientCareRepository()
        setContent {
            HomiGoTheme {
                var showSplash by remember { mutableStateOf(true) }
                LaunchedEffect(Unit) {
                    delay(900)
                    showSplash = false
                }
                val initialUser = auth.currentUser()
                var currentUser by remember { mutableStateOf(initialUser?.takeIf { it.isEmailVerified }) }
                var pendingVerification by remember { mutableStateOf(initialUser?.takeIf { !it.isEmailVerified }) }
                var patientProfile by remember { mutableStateOf<PatientProfile?>(null) }
                var profileLoading by remember { mutableStateOf(initialUser?.isEmailVerified == true) }
                var profileError by remember { mutableStateOf<String?>(null) }
                var isSignUp by remember { mutableStateOf(false) }
                var phoneLogin by remember { mutableStateOf(false) }
                var name by remember { mutableStateOf("") }
                var email by remember { mutableStateOf("") }
                var password by remember { mutableStateOf("") }
                var loading by remember { mutableStateOf(false) }
                var message by remember { mutableStateOf<String?>(null) }
                var messageIsError by remember { mutableStateOf(true) }
                var phoneDigits by remember { mutableStateOf("") }
                var otpCode by remember { mutableStateOf("") }
                var otpSent by remember { mutableStateOf(false) }
                var otpProof by remember { mutableStateOf<HomigoApiClient.OtpProof?>(null) }
                var otpMessage by remember { mutableStateOf<String?>(null) }
                var otpMessageIsError by remember { mutableStateOf(false) }
                var needsWhatsAppVerification by remember { mutableStateOf(false) }
                var showCareScreen by remember { mutableStateOf(false) }

                LaunchedEffect(currentUser?.uid) {
                    val user = currentUser
                    if (user == null) {
                        patientProfile = null
                        profileLoading = false
                        profileError = null
                    } else {
                        profileLoading = true
                        profileError = null
                        try {
                            user.reload().await()
                            val token = user.getIdToken(true).await()
                            val verifiedPhone = token.claims["whatsapp_verified"] == true
                                && (token.claims["whatsapp_number"] as? String)?.matches(Regex("^\\+923[0-9]{9}$")) == true
                            if (!user.isEmailVerified) {
                                currentUser = null
                                pendingVerification = user
                                needsWhatsAppVerification = false
                                profileLoading = false
                            } else if (!verifiedPhone) {
                                patientProfile = null
                                needsWhatsAppVerification = true
                                profileLoading = false
                            } else {
                                needsWhatsAppVerification = false
                                profiles.ensurePatientProfile(user) { result ->
                                    result.fold(
                                        onSuccess = { patientProfile = it; profileError = null; profileLoading = false },
                                        onFailure = { patientProfile = null; profileError = it.message ?: "Your profile could not be loaded."; profileLoading = false },
                                    )
                                }
                            }
                        } catch (_: Exception) {
                            patientProfile = null
                            profileError = "Your account status could not be refreshed. Check your connection and retry."
                            profileLoading = false
                        }
                    }
                }

                fun clearPhoneProof() {
                    otpCode = ""
                    otpSent = false
                    otpProof = null
                    otpMessage = null
                    otpMessageIsError = false
                }

                fun requestWhatsAppCode() {
                    if (!HomigoApiClient.isPakistaniMobileDigits(phoneDigits)) {
                        otpMessage = "Enter exactly 10 Pakistani mobile digits beginning with 3."
                        otpMessageIsError = true
                        return
                    }
                    loading = true
                    otpMessage = null
                    lifecycleScope.launch {
                        try {
                            HomigoApiClient.sendWhatsAppOtp(phoneDigits)
                            otpSent = true
                            otpProof = null
                            otpCode = ""
                            otpMessage = "The HomiGo server confirmed the WhatsApp code request."
                            otpMessageIsError = false
                        } catch (error: Exception) {
                            otpMessage = error.message ?: "The WhatsApp code could not be requested."
                            otpMessageIsError = true
                        } finally {
                            loading = false
                        }
                    }
                }

                fun verifyWhatsAppCode() {
                    loading = true
                    otpMessage = null
                    lifecycleScope.launch {
                        try {
                            otpProof = HomigoApiClient.verifyWhatsAppOtp(phoneDigits, otpCode)
                            otpMessage = "The HomiGo server verified this code. Continue before the one-use proof expires."
                            otpMessageIsError = false
                        } catch (error: Exception) {
                            otpProof = null
                            otpMessage = error.message ?: "The WhatsApp code could not be verified."
                            otpMessageIsError = true
                        } finally {
                            loading = false
                        }
                    }
                }

                fun linkWhatsAppToCurrentAccount() {
                    val account = currentUser
                    val proof = otpProof
                    if (account == null || proof == null) {
                        otpMessage = "Sign in and verify a WhatsApp code before linking."
                        otpMessageIsError = true
                        return
                    }
                    loading = true
                    otpMessage = null
                    lifecycleScope.launch {
                        try {
                            val idToken = account.getIdToken(true).await().token
                                ?: throw IllegalStateException("The Firebase account token could not be refreshed.")
                            HomigoApiClient.linkWhatsApp(proof.proof, idToken)
                            val refreshed = account.getIdToken(true).await()
                            val isVerified = refreshed.claims["whatsapp_verified"] == true
                                && (refreshed.claims["whatsapp_number"] as? String)?.matches(Regex("^\\+923[0-9]{9}$")) == true
                            if (!isVerified) throw IllegalStateException("The new WhatsApp claim could not be refreshed.")
                            clearPhoneProof()
                            needsWhatsAppVerification = false
                            profileLoading = true
                            profiles.ensurePatientProfile(account) { result ->
                                result.fold(
                                    onSuccess = { patientProfile = it; profileError = null; profileLoading = false },
                                    onFailure = { patientProfile = null; profileError = it.message ?: "Your profile could not be loaded."; profileLoading = false },
                                )
                            }
                        } catch (error: Exception) {
                            otpMessage = error.message ?: "WhatsApp could not be linked securely."
                            otpMessageIsError = true
                        } finally {
                            loading = false
                        }
                    }
                }

                fun acceptAuthResult(result: Result<FirebaseUser>, signUp: Boolean) {
                    loading = false
                    result.fold(
                        onSuccess = { user ->
                            password = ""
                            if (AuthFlowPolicy.shouldRouteToVerificationAfterRegistration(signUp, user.isEmailVerified)) {
                                currentUser = null
                                pendingVerification = user
                                patientProfile = null
                                profileLoading = false
                                profileError = null
                                message = "Account created. Verify your email to continue. You can resend the link below."
                                messageIsError = false
                            } else {
                                message = null
                                messageIsError = false
                                pendingVerification = null
                                patientProfile = null
                                profileLoading = true
                                currentUser = user
                            }
                        },
                        onFailure = { error ->
                            val session = auth.currentUser()
                            if (error is EmailNotVerifiedException) {
                                pendingVerification = error.account
                                message = null
                            } else if (signUp && session?.isEmailVerified == false) {
                                pendingVerification = session
                                message = "Your account was created. Resend the verification email to continue."
                            } else {
                                message = auth.safeMessage(error, signUp)
                            }
                            messageIsError = true
                        },
                    )
                }

                fun clearSession() {
                    auth.signOut()
                    currentUser = null
                    pendingVerification = null
                    patientProfile = null
                    profileError = null
                    profileLoading = false
                    needsWhatsAppVerification = false
                    showCareScreen = false
                    phoneDigits = ""
                    clearPhoneProof()
                    message = null
                    password = ""
                    isSignUp = false
                    phoneLogin = false
                }

                when {
                    showSplash -> HomiGoSplashScreen()
                    currentUser != null && profileLoading -> LoadingScreen("Loading your secure profile…")
                    currentUser != null && needsWhatsAppVerification -> WhatsAppLinkScreen(
                        email = currentUser?.email.orEmpty(),
                        phoneDigits = phoneDigits,
                        otpCode = otpCode,
                        sent = otpSent,
                        proofReady = otpProof != null,
                        busy = loading,
                        message = otpMessage,
                        messageIsError = otpMessageIsError,
                        onPhoneChange = { value -> if (value != phoneDigits) { phoneDigits = value; clearPhoneProof() } },
                        onCodeChange = { value -> otpCode = value; otpProof = null; otpMessage = null },
                        onSend = ::requestWhatsAppCode,
                        onVerify = ::verifyWhatsAppCode,
                        onLink = ::linkWhatsAppToCurrentAccount,
                        onSignOut = ::clearSession,
                    )
                    currentUser != null && showCareScreen && patientProfile != null -> PatientCareScreen(
                        profile = patientProfile!!,
                        repository = careRepository,
                        onBack = { showCareScreen = false },
                    )
                    currentUser != null && patientProfile != null -> HomeScreen(
                        profile = patientProfile!!,
                        onSignOut = ::clearSession,
                        onOpenCare = { showCareScreen = true },
                        onEmergencyCall = { runCatching { startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:1122"))) } },
                    )
                    currentUser != null -> ProfileErrorScreen(
                        message = profileError ?: "Your profile is not available yet.",
                        onRetry = { currentUser?.let { user -> profileLoading = true; profileError = null; profiles.ensurePatientProfile(user) { result -> result.fold({ patientProfile = it; profileLoading = false }, { profileError = "Your profile could not be loaded. Check your connection and retry."; profileLoading = false }) } } },
                        onSignOut = ::clearSession,
                    )
                    pendingVerification != null -> VerificationScreen(
                        account = pendingVerification!!,
                        loading = loading,
                        message = message,
                        messageIsError = messageIsError,
                        onResend = {
                            loading = true
                            message = null
                            auth.resendVerification { result ->
                                loading = false
                                result.fold(
                                    onSuccess = { message = "A new verification email was sent. Open the newest link once; older links may no longer work."; messageIsError = false },
                                    onFailure = { message = auth.safeMessage(it); messageIsError = true },
                                )
                            }
                        },
                        onRefresh = {
                            loading = true
                            message = null
                            auth.refreshVerification { result ->
                                loading = false
                                result.fold(
                                    onSuccess = { currentUser = it; pendingVerification = null; message = null; profileLoading = true },
                                    onFailure = { message = if (it is EmailNotVerifiedException) "Email is not verified yet. Open the newest link, then try again." else auth.safeMessage(it); messageIsError = true },
                                )
                            }
                        },
                        onSignOut = ::clearSession,
                    )
                    else -> AuthScreen(
                        isSignUp = isSignUp,
                        phoneLogin = phoneLogin,
                        name = name,
                        email = email,
                        password = password,
                        phoneDigits = phoneDigits,
                        otpCode = otpCode,
                        otpSent = otpSent,
                        otpProofReady = otpProof != null,
                        otpMessage = otpMessage,
                        otpMessageIsError = otpMessageIsError,
                        loading = loading,
                        message = message,
                        messageIsError = messageIsError,
                        onNameChange = { name = it; message = null; messageIsError = true },
                        onEmailChange = { email = it; message = null; messageIsError = true },
                        onPasswordChange = { password = it; message = null; messageIsError = true },
                        onPhoneDigitsChange = { value -> if (value != phoneDigits) { phoneDigits = value; clearPhoneProof() } },
                        onOtpCodeChange = { value -> otpCode = value; otpProof = null; otpMessage = null },
                        onSendOtp = ::requestWhatsAppCode,
                        onVerifyOtp = ::verifyWhatsAppCode,
                        onModeChange = { isSignUp = it; phoneLogin = false; message = null; messageIsError = true; clearPhoneProof() },
                        onPhoneLoginChange = { phoneLogin = it; message = null; messageIsError = true },
                        onSubmit = {
                            val validation = if (!isSignUp && phoneLogin) AuthFormValidator.validatePhoneLogin(phoneDigits, password)
                            else AuthFormValidator.validate(isSignUp, name, email, password)
                            if (validation != null) {
                                message = validation
                                messageIsError = true
                                return@AuthScreen
                            }
                            if (isSignUp) {
                                val proof = otpProof
                                if (proof == null) {
                                    message = "Verify your WhatsApp number before creating this account."
                                    messageIsError = true
                                    return@AuthScreen
                                }
                                loading = true
                                message = null
                                lifecycleScope.launch {
                                    try {
                                        HomigoApiClient.registerVerifiedPatient(proof.proof, name, email, password)
                                        clearPhoneProof()
                                        auth.signInAfterServerRegistration(email, password) { result -> acceptAuthResult(result, true) }
                                    } catch (error: Exception) {
                                        loading = false
                                        message = error.message ?: "The verified account could not be created."
                                        messageIsError = true
                                    }
                                }
                            } else {
                                loading = true
                                message = null
                                if (phoneLogin) {
                                    lifecycleScope.launch {
                                        try {
                                            val token = HomigoApiClient.signInWithPhonePassword(phoneDigits, password)
                                            auth.signInWithCustomToken(token) { result -> acceptAuthResult(result, false) }
                                        } catch (error: Exception) {
                                            loading = false
                                            message = error.message ?: "Phone sign-in could not be completed."
                                            messageIsError = true
                                        }
                                    }
                                } else {
                                    auth.signIn(email, password) { result -> acceptAuthResult(result, false) }
                                }
                            }
                        },
                        onGoogleSignIn = {
                            val signingUp = isSignUp
                            val proofForGoogle = otpProof
                            if (signingUp && proofForGoogle == null) {
                                message = "Verify your WhatsApp number before continuing with Google registration."
                                messageIsError = true
                                return@AuthScreen
                            }
                            loading = true
                            message = null
                            // A missing/incorrect Firebase Google OAuth resource must produce a
                            // recoverable UI error, not crash the Activity from the click handler.
                            val serverClientId = runCatching { getString(R.string.default_web_client_id) }
                                .getOrNull()
                                .orEmpty()
                                .trim()
                            if (serverClientId.isBlank()) {
                                loading = false
                                message = "Google sign-in is not configured in this build. Refresh the Firebase Android configuration and rebuild."
                                messageIsError = true
                            } else {
                                val option = GetGoogleIdOption.Builder()
                                    .setServerClientId(serverClientId)
                                    .setFilterByAuthorizedAccounts(false)
                                    .build()
                                val request = GetCredentialRequest.Builder().addCredentialOption(option).build()
                                lifecycleScope.launch {
                                    try {
                                        val response = CredentialManager.create(this@MainActivity).getCredential(this@MainActivity, request)
                                        val credential = response.credential
                                        if (credential !is CustomCredential || credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                                            loading = false
                                            message = "Google did not return a supported sign-in credential. Try again or use email and password."
                                            messageIsError = true
                                        } else {
                                            val token = GoogleIdTokenCredential.createFrom(credential.data).idToken
                                            auth.signInWithGoogle(token) { result ->
                                                if (!signingUp || proofForGoogle == null) {
                                                    acceptAuthResult(result, false)
                                                } else {
                                                    result.fold(
                                                        onSuccess = { googleUser ->
                                                            lifecycleScope.launch {
                                                                try {
                                                                    val idToken = googleUser.getIdToken(true).await().token
                                                                        ?: throw IllegalStateException("The Firebase account token could not be refreshed.")
                                                                    HomigoApiClient.linkWhatsApp(proofForGoogle.proof, idToken)
                                                                    googleUser.getIdToken(true).await()
                                                                    clearPhoneProof()
                                                                    acceptAuthResult(Result.success(googleUser), false)
                                                                } catch (error: Exception) {
                                                                    acceptAuthResult(Result.success(googleUser), false)
                                                                    message = error.message ?: "WhatsApp could not be linked securely."
                                                                    messageIsError = true
                                                                }
                                                            }
                                                        },
                                                        onFailure = { error -> acceptAuthResult(Result.failure(error), false) },
                                                    )
                                                }
                                            }
                                        }
                                    } catch (cancelled: GetCredentialCancellationException) {
                                        loading = false
                                        message = "Google sign-in was cancelled."
                                        messageIsError = true
                                    } catch (error: Exception) {
                                        loading = false
                                        val detail = error.message?.trim()?.takeIf { it.isNotEmpty() }
                                        message = if (detail == null) {
                                            "Google sign-in could not be completed. Check Google Play services, Firebase configuration, and your connection, then try again."
                                        } else {
                                            "Google sign-in could not be completed: $detail"
                                        }
                                        messageIsError = true
                                    }
                                }
                            }
                        },
                        onForgotPassword = {
                            if (!AuthFormValidator.validateEmail(email)) {
                                message = "Enter your account email address first."
                                messageIsError = true
                            } else {
                                loading = true
                                message = null
                                auth.sendPasswordReset(email) { result ->
                                    loading = false
                                    result.fold(
                                        onSuccess = { message = "If an account matches, a password reset email has been sent. Check your inbox and spam folder."; messageIsError = false },
                                        onFailure = { message = "We could not request a reset email. Check your connection and try again."; messageIsError = true },
                                    )
                                }
                            }
                        },
                    )
                }
            }
        }
    }
}

@androidx.compose.runtime.Composable
private fun LoadingScreen(label: String) {
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(16.dp))
            Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@androidx.compose.runtime.Composable
private fun ProfileErrorScreen(message: String, onRetry: () -> Unit, onSignOut: () -> Unit) {
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            HgIconImage(HgIcon.SHIELD_CHECK, modifier = Modifier.size(44.dp), contentDescription = null, tint = HgColor.Primary)
            Spacer(Modifier.height(16.dp))
            Text("Profile not available", style = MaterialTheme.typography.headlineMedium, color = HgColor.PrimaryDark)
            Spacer(Modifier.height(8.dp))
            Text(message, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            Button(onClick = onRetry, modifier = Modifier.fillMaxWidth().height(56.dp), shape = MaterialTheme.shapes.large) { Text("Retry") }
            TextButton(onClick = onSignOut, modifier = Modifier.fillMaxWidth().height(48.dp)) { Text("Sign out") }
        }
    }
}

@androidx.compose.runtime.Composable
private fun VerificationScreen(
    account: FirebaseUser,
    loading: Boolean,
    message: String?,
    messageIsError: Boolean,
    onResend: () -> Unit,
    onRefresh: () -> Unit,
    onSignOut: () -> Unit,
) {
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Image(
                painter = painterResource(R.drawable.homigo_lockup_horizontal),
                contentDescription = "HomiGo Care — Because Care Begins at Home",
                modifier = Modifier.fillMaxWidth(0.9f).height(68.dp),
                contentScale = ContentScale.Fit,
            )
            Spacer(Modifier.height(30.dp))
            Text("Check your email", style = MaterialTheme.typography.headlineMedium, color = HgColor.PrimaryDark)
            Spacer(Modifier.height(12.dp))
            Text(
                "We sent a verification link to ${account.email.orEmpty()}. Verify your email before continuing. Open only the newest link once; old or already-used links can fail.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (message != null) {
                Spacer(Modifier.height(12.dp))
                Text(message, color = if (messageIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(Modifier.height(24.dp))
            Button(onClick = onRefresh, enabled = !loading, modifier = Modifier.fillMaxWidth().height(56.dp), shape = MaterialTheme.shapes.large) {
                if (loading) CircularProgressIndicator(modifier = Modifier.size(22.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                else Text("I've verified my email", style = MaterialTheme.typography.labelLarge)
            }
            TextButton(onClick = onResend, enabled = !loading, modifier = Modifier.fillMaxWidth().height(48.dp)) { Text("Resend verification email") }
            OutlinedButton(onClick = onSignOut, enabled = !loading, modifier = Modifier.fillMaxWidth().height(56.dp), shape = MaterialTheme.shapes.large) {
                Text("Use a different account")
            }
        }
    }
}
