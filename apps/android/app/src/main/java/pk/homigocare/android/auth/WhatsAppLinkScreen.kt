package pk.homigocare.android.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import pk.homigocare.android.designsystem.theme.HgColor

@Composable
fun WhatsAppLinkScreen(
    email: String,
    phoneDigits: String,
    otpCode: String,
    sent: Boolean,
    proofReady: Boolean,
    busy: Boolean,
    message: String?,
    messageIsError: Boolean,
    onPhoneChange: (String) -> Unit,
    onCodeChange: (String) -> Unit,
    onSend: () -> Unit,
    onVerify: () -> Unit,
    onLink: () -> Unit,
    onSignOut: () -> Unit,
) {
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Text("Verify WhatsApp", style = MaterialTheme.typography.headlineMedium, color = HgColor.PrimaryDark)
            Spacer(Modifier.height(8.dp))
            Text("Signed in as ${email.ifBlank { "verified email account" }}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(10.dp))
            Text("A server-verified Pakistani WhatsApp number is required before any patient profile or booking is opened.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(22.dp))
            OutlinedTextField(
                value = phoneDigits,
                onValueChange = { onPhoneChange(it.filter(Char::isDigit).take(10)) },
                label = { Text("Pakistani mobile number") },
                prefix = { Text("+92", color = MaterialTheme.colorScheme.primary) },
                singleLine = true,
                enabled = !busy && !proofReady,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Text("Country code +92 is locked. Enter 10 digits starting with 3.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(12.dp))
            OutlinedButton(onClick = onSend, enabled = !busy && !proofReady && phoneDigits.matches(Regex("^3[0-9]{9}$")), modifier = Modifier.fillMaxWidth().height(50.dp)) {
                Text(if (sent) "Resend WhatsApp code" else "Send WhatsApp code")
            }
            if (sent && !proofReady) {
                Spacer(Modifier.height(10.dp))
                OutlinedTextField(
                    value = otpCode,
                    onValueChange = { onCodeChange(it.filter(Char::isDigit).take(6)) },
                    label = { Text("6-digit code") },
                    singleLine = true,
                    enabled = !busy,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(8.dp))
                OutlinedButton(onClick = onVerify, enabled = !busy && otpCode.matches(Regex("^[0-9]{6}$")), modifier = Modifier.fillMaxWidth().height(50.dp)) { Text("Verify code") }
            }
            if (proofReady) {
                Spacer(Modifier.height(10.dp))
                Text("HomiGo server verified this number. Link it before the one-use proof expires.", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
                Spacer(Modifier.height(8.dp))
                Button(onClick = onLink, enabled = !busy, modifier = Modifier.fillMaxWidth().height(54.dp)) {
                    if (busy) CircularProgressIndicator(modifier = Modifier.height(22.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                    else Text("Link WhatsApp securely")
                }
            }
            if (message != null) {
                Spacer(Modifier.height(12.dp))
                Text(message, color = if (messageIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(Modifier.height(12.dp))
            TextButton(onClick = onSignOut, enabled = !busy, modifier = Modifier.fillMaxWidth().height(48.dp)) { Text("Use a different account") }
        }
    }
}
