package pk.homigocare.android.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException

/** Firebase is the identity provider; app data is persisted separately under Firestore rules. */
class AuthRepository(private val auth: FirebaseAuth = FirebaseAuth.getInstance()) {
    fun currentUser(): FirebaseUser? = auth.currentUser

    fun signIn(email: String, password: String, onResult: (Result<FirebaseUser>) -> Unit) {
        auth.signInWithEmailAndPassword(email.trim(), password)
            .addOnCompleteListener { task ->
                val user = task.result?.user
                if (!task.isSuccessful || user == null) {
                    onResult(Result.failure(task.exception ?: IllegalStateException("Sign-in failed.")))
                } else {
                    refreshUserAndRequireVerified(user, onResult)
                }
        }
    }

    fun signInWithCustomToken(customToken: String, onResult: (Result<FirebaseUser>) -> Unit) {
        if (customToken.isBlank()) {
            onResult(Result.failure(IllegalArgumentException("The secure sign-in token is missing.")))
            return
        }
        auth.signInWithCustomToken(customToken).addOnCompleteListener { task ->
            val user = task.result?.user
            if (!task.isSuccessful || user == null) {
                onResult(Result.failure(task.exception ?: IllegalStateException("Phone sign-in failed.")))
            } else {
                refreshUserAndRequireVerified(user, onResult)
            }
        }
    }

    fun signInWithGoogle(idToken: String, onResult: (Result<FirebaseUser>) -> Unit) {
        if (idToken.isBlank()) {
            onResult(Result.failure(IllegalArgumentException("Google did not return a valid sign-in token.")))
            return
        }
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential).addOnCompleteListener { task ->
            val user = task.result?.user
            if (!task.isSuccessful || user == null) {
                onResult(Result.failure(task.exception ?: IllegalStateException("Google sign-in failed.")))
            } else {
                refreshUserAndRequireVerified(user, onResult)
            }
        }
    }

    /** Sign in to an account already created by the proof-gated HomiGo API, then request Firebase email verification. */
    fun signInAfterServerRegistration(email: String, password: String, onResult: (Result<FirebaseUser>) -> Unit) {
        auth.signInWithEmailAndPassword(email.trim(), password).addOnCompleteListener { task ->
            val user = task.result?.user
            if (!task.isSuccessful || user == null) {
                onResult(Result.failure(task.exception ?: IllegalStateException("The verified account could not be opened.")))
                return@addOnCompleteListener
            }
            user.sendEmailVerification().addOnCompleteListener { verification ->
                if (verification.isSuccessful) onResult(Result.success(user))
                else onResult(Result.failure(verification.exception ?: IllegalStateException("The Firebase email verification could not be sent.")))
            }
        }
    }

    fun resendVerification(onResult: (Result<Unit>) -> Unit) {
        val user = auth.currentUser
        if (user == null) {
            onResult(Result.failure(IllegalStateException("Your session has expired. Please sign in again.")))
            return
        }
        user.sendEmailVerification().addOnCompleteListener { task ->
            if (task.isSuccessful) onResult(Result.success(Unit))
            else onResult(Result.failure(task.exception ?: IllegalStateException("Verification email could not be sent.")))
        }
    }

    fun refreshVerification(onResult: (Result<FirebaseUser>) -> Unit) {
        val user = auth.currentUser
        if (user == null) {
            onResult(Result.failure(IllegalStateException("Your session has expired. Please sign in again.")))
        } else {
            refreshUserAndRequireVerified(user, onResult)
        }
    }

    fun sendPasswordReset(email: String, onResult: (Result<Unit>) -> Unit) {
        auth.sendPasswordResetEmail(email.trim()).addOnCompleteListener { task ->
            if (task.isSuccessful) onResult(Result.success(Unit))
            else onResult(Result.failure(task.exception ?: IllegalStateException("Password reset could not be requested.")))
        }
    }

    fun signOut() = auth.signOut()

    fun safeMessage(error: Throwable, isSignUp: Boolean = false): String = when (error) {
        is EmailNotVerifiedException -> "Please verify your email address before continuing."
        is FirebaseAuthWeakPasswordException -> "Choose a stronger password with at least 8 characters."
        is FirebaseAuthUserCollisionException -> "This account could not be created. If you have already registered, sign in or reset your password."
        is FirebaseAuthInvalidCredentialsException -> "Check your email and password, then try again."
        else -> if (isSignUp) "We could not create your account. Check your details and try again."
        else "We could not complete sign-in. Check your details and try again."
    }

    private fun refreshUserAndRequireVerified(
        user: FirebaseUser,
        onResult: (Result<FirebaseUser>) -> Unit,
    ) {
        user.reload().addOnCompleteListener { reloadTask ->
            val refreshed = auth.currentUser ?: user
            if (!reloadTask.isSuccessful) {
                onResult(Result.failure(reloadTask.exception ?: IllegalStateException("Could not refresh account status.")))
                return@addOnCompleteListener
            }
            // Refresh the ID token too, so Firestore sees the latest email_verified claim.
            refreshed.getIdToken(true).addOnCompleteListener { tokenTask ->
                if (!tokenTask.isSuccessful) {
                    onResult(Result.failure(tokenTask.exception ?: IllegalStateException("Could not refresh account status.")))
                } else if (refreshed.isEmailVerified) {
                    onResult(Result.success(refreshed))
                } else {
                    onResult(Result.failure(EmailNotVerifiedException(refreshed)))
                }
            }
        }
    }
}

class EmailNotVerifiedException(val account: FirebaseUser) : Exception("Please verify your email address before continuing.")
