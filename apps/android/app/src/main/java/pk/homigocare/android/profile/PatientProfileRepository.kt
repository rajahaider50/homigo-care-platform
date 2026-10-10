package pk.homigocare.android.profile

import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore

data class PatientProfile(
    val uid: String,
    val email: String,
    val displayName: String,
)

/** Minimal patient profile persistence; Firestore Security Rules remain authoritative. */
class PatientProfileRepository(private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()) {
    fun ensurePatientProfile(user: FirebaseUser, onResult: (Result<PatientProfile>) -> Unit) {
        val email = user.email?.trim().orEmpty()
        val name = user.displayName?.trim().orEmpty()
        if (!user.isEmailVerified || email.isBlank() || name.length !in 2..80) {
            onResult(Result.failure(IllegalStateException("A verified account with a valid name and email is required.")))
            return
        }

        user.getIdToken(true).addOnCompleteListener { tokenTask ->
            if (!tokenTask.isSuccessful) {
                onResult(Result.failure(IllegalStateException("Your account status could not be refreshed. Please retry.")))
                return@addOnCompleteListener
            }

            val profileRef = firestore.collection("profiles").document(user.uid)
            profileRef.get().addOnSuccessListener { snapshot ->
                if (snapshot.exists()) {
                    val storedUid = snapshot.getString("uid")
                    val storedEmail = snapshot.getString("email")
                    val role = snapshot.getString("role")
                    val storedName = snapshot.getString("displayName").orEmpty()
                    if (storedUid != user.uid || storedEmail != email || role != "patient") {
                        onResult(Result.failure(SecurityException("This account profile is not available to this user.")))
                    } else {
                        onResult(Result.success(PatientProfile(user.uid, email, storedName.ifBlank { name })))
                    }
                } else {
                    val data = mapOf(
                        "uid" to user.uid,
                        "email" to email,
                        "displayName" to name,
                        "role" to "patient",
                        "createdAt" to FieldValue.serverTimestamp(),
                        "updatedAt" to FieldValue.serverTimestamp(),
                    )
                    profileRef.set(data).addOnSuccessListener {
                        onResult(Result.success(PatientProfile(user.uid, email, name)))
                    }.addOnFailureListener {
                        onResult(Result.failure(IllegalStateException("Your profile could not be saved. Please retry.")))
                    }
                }
            }.addOnFailureListener {
                onResult(Result.failure(IllegalStateException("Your profile could not be loaded. Check your connection and retry.")))
            }
        }
    }
}
