package pk.homigocare.android.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import pk.homigocare.android.R
import pk.homigocare.android.designsystem.icons.HgIcon
import pk.homigocare.android.designsystem.icons.HgIconImage
import pk.homigocare.android.designsystem.theme.HgRadius

@Composable
fun AuthScreen(
    isSignUp: Boolean,
    phoneLogin: Boolean,
    name: String,
    email: String,
    password: String,
    phoneDigits: String,
    otpCode: String,
    otpSent: Boolean,
    otpProofReady: Boolean,
    otpMessage: String?,
    otpMessageIsError: Boolean,
    loading: Boolean,
    message: String?,
    messageIsError: Boolean,
    onNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onPhoneDigitsChange: (String) -> Unit,
    onOtpCodeChange: (String) -> Unit,
    onSendOtp: () -> Unit,
    onVerifyOtp: () -> Unit,
    onSubmit: () -> Unit,
    onGoogleSignIn: () -> Unit,
    onForgotPassword: () -> Unit,
    onModeChange: (Boolean) -> Unit,
    onPhoneLoginChange: (Boolean) -> Unit,
) {
    var passwordVisible by remember { mutableStateOf(false) }
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Image(
                painter = painterResource(R.drawable.homigo_lockup_horizontal),
                contentDescription = "HomiGo Care — Because Care Begins at Home",
                modifier = Modifier.fillMaxWidth(0.92f).height(74.dp),
                contentScale = ContentScale.Fit,
            )
            Spacer(Modifier.height(30.dp))
            Text(
                if (isSignUp) "Create your patient account" else "Sign in to continue",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Spacer(Modifier.height(20.dp))
            if (!isSignUp) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    if (phoneLogin) {
                        OutlinedButton(onClick = { onPhoneLoginChange(false) }, enabled = !loading, modifier = Modifier.weight(1f).height(48.dp), shape = MaterialTheme.shapes.large) { Text("Email") }
                    } else {
                        Button(onClick = { onPhoneLoginChange(false) }, enabled = !loading, modifier = Modifier.weight(1f).height(48.dp), shape = MaterialTheme.shapes.large) { Text("Email") }
                    }
                    if (phoneLogin) {
                        Button(onClick = { onPhoneLoginChange(true) }, enabled = !loading, modifier = Modifier.weight(1f).height(48.dp), shape = MaterialTheme.shapes.large) { Text("WhatsApp mobile") }
                    } else {
                        OutlinedButton(onClick = { onPhoneLoginChange(true) }, enabled = !loading, modifier = Modifier.weight(1f).height(48.dp), shape = MaterialTheme.shapes.large) { Text("WhatsApp mobile") }
                    }
                }
                Spacer(Modifier.height(12.dp))
            }
            if (isSignUp) {
                OutlinedTextField(
                    value = name,
                    onValueChange = onNameChange,
                    label = { Text("Full name") },
                    leadingIcon = { HgIconImage(HgIcon.USER, contentDescription = null) },
                    singleLine = true,
                    enabled = !loading,
                    shape = MaterialTheme.shapes.large,
                    modifier = Modifier.fillMaxWidth().height(68.dp),
                )
                Spacer(Modifier.height(12.dp))
            }
            if (isSignUp || phoneLogin) {
                OutlinedTextField(
                    value = phoneDigits,
                    onValueChange = { onPhoneDigitsChange(it.filter(Char::isDigit).take(10)) },
                    label = { Text("Pakistani mobile number") },
                    prefix = { Text("+92", color = MaterialTheme.colorScheme.primary) },
                    leadingIcon = { HgIconImage(HgIcon.PHONE, contentDescription = null) },
                    singleLine = true,
                    enabled = !loading && (phoneLogin || !otpProofReady),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    shape = MaterialTheme.shapes.large,
                    modifier = Modifier.fillMaxWidth().height(68.dp),
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    if (isSignUp) "Country code +92 is locked. Enter 10 digits starting with 3."
                    else "Use the 10-digit number already verified and linked to this HomiGo account.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (isSignUp) {
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(onClick = onSendOtp, enabled = !loading && !otpProofReady && phoneDigits.matches(Regex("^3[0-9]{9}$")), modifier = Modifier.weight(1f).height(48.dp), shape = MaterialTheme.shapes.large) {
                            Text(if (otpSent) "Resend code" else "Send WhatsApp code")
                        }
                        if (otpSent && !otpProofReady) {
                            OutlinedButton(onClick = onVerifyOtp, enabled = !loading && otpCode.matches(Regex("^[0-9]{6}$")), modifier = Modifier.weight(1f).height(48.dp), shape = MaterialTheme.shapes.large) {
                                Text("Verify code")
                            }
                        }
                    }
                    if (otpSent && !otpProofReady) {
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = otpCode,
                            onValueChange = { onOtpCodeChange(it.filter(Char::isDigit).take(6)) },
                            label = { Text("6-digit WhatsApp code") },
                            singleLine = true,
                            enabled = !loading,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                            shape = MaterialTheme.shapes.large,
                            modifier = Modifier.fillMaxWidth().height(68.dp),
                        )
                    }
                    if (otpMessage != null) {
                        Spacer(Modifier.height(8.dp))
                        Text(otpMessage, color = if (otpMessageIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
                    }
                    if (otpProofReady) {
                        Spacer(Modifier.height(8.dp))
                        Text("WhatsApp verified by the HomiGo server. The proof is single-use and expires shortly.", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
                    }
                }
                Spacer(Modifier.height(12.dp))
            }
            if (isSignUp || !phoneLogin) OutlinedTextField(
                value = email,
                onValueChange = onEmailChange,
                label = { Text("Email address") },
                leadingIcon = { HgIconImage(HgIcon.MESSAGE, contentDescription = null) },
                singleLine = true,
                enabled = !loading,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(68.dp),
            )
            if (isSignUp || !phoneLogin) Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = password,
                onValueChange = onPasswordChange,
                label = { Text(if (isSignUp) "Password (at least 8 characters)" else "Password") },
                leadingIcon = { HgIconImage(HgIcon.LOCK, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }, enabled = !loading) {
                        Image(
                            painter = painterResource(if (passwordVisible) R.drawable.hg_ic_eye_off else R.drawable.hg_ic_eye),
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            modifier = Modifier.size(20.dp),
                        )
                    }
                },
                singleLine = true,
                enabled = !loading,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(68.dp),
            )
            if (message != null) {
                Spacer(Modifier.height(12.dp))
                Text(message, color = if (messageIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(Modifier.height(20.dp))
            Button(
                onClick = onSubmit,
                enabled = !loading && (!isSignUp || otpProofReady),
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) {
                if (loading) CircularProgressIndicator(strokeWidth = 2.dp, modifier = Modifier.height(22.dp), color = MaterialTheme.colorScheme.onPrimary)
                else Text(if (isSignUp) "Create verified account" else "Sign in", style = MaterialTheme.typography.labelLarge)
            }
            if (!isSignUp) {
                TextButton(
                    onClick = { if (phoneLogin) onPhoneLoginChange(false) else onForgotPassword() },
                    enabled = !loading,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                ) { Text(if (phoneLogin) "Reset by email" else "Forgot password?") }
            }
            Spacer(Modifier.height(4.dp))
            OutlinedButton(
                onClick = onGoogleSignIn,
                enabled = !loading && (!isSignUp || otpProofReady),
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) {
                HgIconImage(HgIcon.USER, contentDescription = null)
                Spacer(Modifier.size(8.dp))
                Text("Continue with Google", style = MaterialTheme.typography.labelLarge)
            }
            Spacer(Modifier.height(10.dp))
            TextButton(onClick = { onModeChange(!isSignUp) }, enabled = !loading, modifier = Modifier.fillMaxWidth().height(HgRadius.Button * 2.2f)) {
                Text(if (isSignUp) "Already registered? Sign in" else "New to HomiGo Care? Create an account")
            }
        }
    }
}
