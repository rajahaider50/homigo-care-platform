package pk.homigocare.android.care

import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Date

data class CareProfessional(
    val uid: String,
    val displayName: String,
    val professionalType: String,
    val specialty: String,
    val qualification: String,
    val experienceYears: Int,
    val city: String,
    val availability: String,
)

data class CareBooking(
    val id: String,
    val professionalUid: String,
    val serviceType: String,
    val scheduledAt: Date?,
    val status: String,
)

data class PatientCareData(val professionals: List<CareProfessional>, val bookings: List<CareBooking>)

/** Every client query is bounded; Firestore Security Rules remain the authority for ownership and role. */
class PatientCareRepository(private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()) {
    fun loadPatientCare(patientUid: String, onResult: (Result<PatientCareData>) -> Unit) {
        val professionalQuery = firestore.collection("professional_profiles")
            .whereEqualTo("status", "approved")
            .limit(20)
        val bookingQuery = firestore.collection("bookings")
            .whereEqualTo("patientUid", patientUid)
            .limit(50)

        professionalQuery.get().addOnSuccessListener { providers ->
            bookingQuery.get().addOnSuccessListener { bookingSnapshot ->
                val professionals = providers.documents.mapNotNull { document ->
                    val type = document.getString("professionalType") ?: return@mapNotNull null
                    if (type !in setOf("doctor", "nurse")) return@mapNotNull null
                    CareProfessional(
                        uid = document.id,
                        displayName = document.getString("displayName") ?: "HomiGo professional",
                        professionalType = type,
                        specialty = document.getString("specialty") ?: "Home care",
                        qualification = document.getString("qualification") ?: "Verified profile",
                        experienceYears = (document.getLong("experienceYears") ?: 0L).toInt(),
                        city = document.getString("city") ?: "Service area not listed",
                        availability = document.getString("availability") ?: "Contact after request",
                    )
                }
                val bookings = bookingSnapshot.documents.map { document ->
                    CareBooking(
                        id = document.id,
                        professionalUid = document.getString("professionalUid") ?: "",
                        serviceType = document.getString("serviceType") ?: "doctor_visit",
                        scheduledAt = document.getTimestamp("scheduledAt")?.toDate(),
                        status = document.getString("status") ?: "unknown",
                    )
                }.sortedBy { it.scheduledAt?.time ?: Long.MAX_VALUE }
                onResult(Result.success(PatientCareData(professionals, bookings)))
            }.addOnFailureListener {
                onResult(Result.failure(IllegalStateException("Your booking requests could not be loaded. Check the development Firestore rules.")))
            }
        }.addOnFailureListener {
            onResult(Result.failure(IllegalStateException("Approved professionals could not be loaded. Check the development Firestore rules.")))
        }
    }

    fun requestBooking(
        patientUid: String,
        professional: CareProfessional,
        scheduledAt: Date,
        address: String,
        onResult: (Result<Unit>) -> Unit,
    ) {
        if (scheduledAt.time <= System.currentTimeMillis()) {
            onResult(Result.failure(IllegalArgumentException("Choose a future date and time.")))
            return
        }
        val cleanAddress = address.trim()
        if (cleanAddress.length !in 10..250) {
            onResult(Result.failure(IllegalArgumentException("Enter a service address between 10 and 250 characters.")))
            return
        }
        val serviceType = when (professional.professionalType) {
            "doctor" -> "doctor_visit"
            "nurse" -> "nurse_visit"
            else -> {
                onResult(Result.failure(IllegalArgumentException("This professional does not have a supported visit type.")))
                return
            }
        }
        val payload = mapOf(
            "patientUid" to patientUid,
            "professionalUid" to professional.uid,
            "serviceType" to serviceType,
            "scheduledAt" to scheduledAt,
            "address" to cleanAddress,
            "status" to "requested",
            "createdAt" to FieldValue.serverTimestamp(),
            "updatedAt" to FieldValue.serverTimestamp(),
        )
        firestore.collection("bookings").add(payload)
            .addOnSuccessListener { onResult(Result.success(Unit)) }
            .addOnFailureListener { onResult(Result.failure(IllegalStateException("The booking request could not be saved under the current Firestore rules."))) }
    }

    fun cancelBooking(bookingId: String, onResult: (Result<Unit>) -> Unit) {
        firestore.collection("bookings").document(bookingId)
            .update(mapOf("status" to "cancelled", "updatedAt" to FieldValue.serverTimestamp()))
            .addOnSuccessListener { onResult(Result.success(Unit)) }
            .addOnFailureListener { onResult(Result.failure(IllegalStateException("Only your own requested or accepted booking can be cancelled."))) }
    }
}
