package pk.homigocare.android.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import pk.homigocare.android.R
import pk.homigocare.android.designsystem.icons.HgIcon
import pk.homigocare.android.designsystem.icons.HgIconImage
import pk.homigocare.android.designsystem.theme.HgRadius

@Composable
fun AuthScreen(
    isSignUp: Boolean,
    name: String,
    email: String,
    password: String,
    loading: Boolean,
    message: String?,
    messageIsError: Boolean,
    onNameChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onGoogleSignIn: () -> Unit,
    onForgotPassword: () -> Unit,
    onModeChange: (Boolean) -> Unit,
) {
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
            OutlinedTextField(
                value = email,
                onValueChange = onEmailChange,
                label = { Text("Email address") },
                leadingIcon = { HgIconImage(HgIcon.MESSAGE, contentDescription = null) },
                singleLine = true,
                enabled = !loading,
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(68.dp),
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = password,
                onValueChange = onPasswordChange,
                label = { Text(if (isSignUp) "Password (at least 8 characters)" else "Password") },
                leadingIcon = { HgIconImage(HgIcon.LOCK, contentDescription = null) },
                singleLine = true,
                enabled = !loading,
                visualTransformation = PasswordVisualTransformation(),
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(68.dp),
            )
            if (message != null) {
                Spacer(Modifier.height(12.dp))
                Text(
                    message,
                    color = if (messageIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
            Spacer(Modifier.height(20.dp))
            Button(
                onClick = onSubmit,
                enabled = !loading,
                shape = MaterialTheme.shapes.large,
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) {
                if (loading) CircularProgressIndicator(strokeWidth = 2.dp, modifier = Modifier.height(22.dp), color = MaterialTheme.colorScheme.onPrimary)
                else Text(if (isSignUp) "Create account" else "Sign in", style = MaterialTheme.typography.labelLarge)
            }
            if (!isSignUp) {
                TextButton(onClick = onForgotPassword, enabled = !loading, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                    Text("Forgot password?")
                }
            }
            Spacer(Modifier.height(4.dp))
            OutlinedButton(
                onClick = onGoogleSignIn,
                enabled = !loading,
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
