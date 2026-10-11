package pk.homigocare.android.care

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import pk.homigocare.android.designsystem.theme.HgColor
import pk.homigocare.android.profile.PatientProfile
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

private enum class CareLoad { LOADING, READY, ERROR }

@Composable
fun PatientCareScreen(profile: PatientProfile, repository: PatientCareRepository, onBack: () -> Unit) {
    val context = LocalContext.current
    val initialCalendar = remember {
        Calendar.getInstance().apply {
            add(Calendar.HOUR_OF_DAY, 3)
            set(Calendar.MINUTE, if (get(Calendar.MINUTE) < 30) 30 else 0)
            if (get(Calendar.MINUTE) == 0) add(Calendar.HOUR_OF_DAY, 1)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
    }
    var selectedDateMillis by remember { mutableStateOf(initialCalendar.timeInMillis) }
    var selectedHour by remember { mutableStateOf(initialCalendar.get(Calendar.HOUR_OF_DAY)) }
    var selectedMinute by remember { mutableStateOf(initialCalendar.get(Calendar.MINUTE)) }
    var address by remember { mutableStateOf("") }
    var selectedProfessionalUid by remember { mutableStateOf("") }
    var professionals by remember { mutableStateOf<List<CareProfessional>>(emptyList()) }
    var bookings by remember { mutableStateOf<List<CareBooking>>(emptyList()) }
    var loadState by remember { mutableStateOf(CareLoad.LOADING) }
    var busy by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf<String?>(null) }
    var refreshKey by remember { mutableStateOf(0) }

    LaunchedEffect(profile.uid, refreshKey) {
        loadState = CareLoad.LOADING
        repository.loadPatientCare(profile.uid) { result ->
            result.fold(
                onSuccess = { data ->
                    professionals = data.professionals
                    bookings = data.bookings
                    if (selectedProfessionalUid.isBlank() || data.professionals.none { it.uid == selectedProfessionalUid }) {
                        selectedProfessionalUid = data.professionals.firstOrNull()?.uid.orEmpty()
                    }
                    loadState = CareLoad.READY
                },
                onFailure = { loadState = CareLoad.ERROR; notice = it.message ?: "Care data could not be loaded." },
            )
        }
    }

    val selectedProfessional = professionals.firstOrNull { it.uid == selectedProfessionalUid }
    val scheduledDate = remember(selectedDateMillis, selectedHour, selectedMinute) {
        Calendar.getInstance().apply {
            timeInMillis = selectedDateMillis
            set(Calendar.HOUR_OF_DAY, selectedHour)
            set(Calendar.MINUTE, selectedMinute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
    }
    val dateText = remember(selectedDateMillis) { SimpleDateFormat("EEE, d MMM yyyy", Locale.getDefault()).format(Date(selectedDateMillis)) }
    val timeText = remember(selectedHour, selectedMinute) { SimpleDateFormat("h:mm a", Locale.getDefault()).format(Calendar.getInstance().apply { set(Calendar.HOUR_OF_DAY, selectedHour); set(Calendar.MINUTE, selectedMinute) }.time) }

    fun refresh() { refreshKey += 1 }

    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 18.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OutlinedButton(onClick = onBack, shape = MaterialTheme.shapes.large) { Text("Back to dashboard") }
                OutlinedButton(onClick = ::refresh, enabled = !busy, shape = MaterialTheme.shapes.large) { Text("Refresh") }
            }
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Care at home", style = MaterialTheme.typography.headlineMedium, color = HgColor.PrimaryDark)
                Text("Development workflow · ${profile.displayName}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (notice != null) Text(notice!!, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.error)
            when (loadState) {
                CareLoad.LOADING -> Text("Loading approved professionals and your bookings…", style = MaterialTheme.typography.bodyMedium)
                CareLoad.ERROR -> Card(colors = CardDefaults.cardColors(containerColor = HgColor.Red50)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Development care data is unavailable", style = MaterialTheme.typography.titleMedium, color = HgColor.Red700)
                        Text("Remote Firestore rules or connectivity did not allow this query. No sample providers are shown.", style = MaterialTheme.typography.bodySmall)
                        Button(onClick = ::refresh) { Text("Try again") }
                    }
                }
                CareLoad.READY -> {
                    Card(colors = CardDefaults.cardColors(containerColor = HgColor.White)) {
                        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("Approved professionals", style = MaterialTheme.typography.titleLarge, color = HgColor.PrimaryDark)
                            Text("Showing up to 20 approved profiles.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (professionals.isEmpty()) {
                                Text("No professional has been approved yet. Ask an Admin to review a real application.", style = MaterialTheme.typography.bodyMedium)
                            } else {
                                professionals.forEach { professional ->
                                    ProfessionalOption(professional, selected = professional.uid == selectedProfessionalUid) {
                                        selectedProfessionalUid = professional.uid
                                    }
                                }
                            }
                        }
                    }
                    Card(colors = CardDefaults.cardColors(containerColor = HgColor.White)) {
                        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(11.dp)) {
                            Text("Request a home visit", style = MaterialTheme.typography.titleLarge, color = HgColor.PrimaryDark)
                            if (selectedProfessional == null) {
                                Text("A real approved professional is required before a booking can be created.", style = MaterialTheme.typography.bodyMedium)
                            } else {
                                Text("${selectedProfessional.displayName} · ${selectedProfessional.professionalType.replaceFirstChar { it.uppercase() }} · ${selectedProfessional.specialty}", style = MaterialTheme.typography.bodyMedium)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    OutlinedButton(onClick = {
                                        val current = Calendar.getInstance().apply { timeInMillis = selectedDateMillis }
                                        DatePickerDialog(context, { _, year, month, day ->
                                            selectedDateMillis = Calendar.getInstance().apply { timeInMillis = selectedDateMillis; set(year, month, day) }.timeInMillis
                                        }, current.get(Calendar.YEAR), current.get(Calendar.MONTH), current.get(Calendar.DAY_OF_MONTH)).apply {
                                            datePicker.minDate = System.currentTimeMillis()
                                        }.show()
                                    }, modifier = Modifier.weight(1f)) { Text(dateText) }
                                    OutlinedButton(onClick = {
                                        TimePickerDialog(context, { _, hour, minute -> selectedHour = hour; selectedMinute = minute }, selectedHour, selectedMinute, false).show()
                                    }, modifier = Modifier.weight(1f)) { Text(timeText) }
                                }
                                OutlinedTextField(value = address, onValueChange = { address = it.take(250) }, label = { Text("Service address") }, placeholder = { Text("House, street, area, city") }, minLines = 2, maxLines = 3, modifier = Modifier.fillMaxWidth())
                                Text("Address only; do not enter diagnosis, medical history, CNIC, or payment details.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Button(
                                    onClick = {
                                        busy = true
                                        notice = null
                                        repository.requestBooking(profile.uid, selectedProfessional, scheduledDate, address) { result ->
                                            busy = false
                                            result.fold(
                                                onSuccess = { notice = "Request saved. A professional has not accepted the visit yet."; address = ""; refresh() },
                                                onFailure = { notice = it.message ?: "The booking request could not be saved." },
                                            )
                                        }
                                    },
                                    enabled = !busy && address.trim().length in 10..250 && scheduledDate.time > System.currentTimeMillis(),
                                    modifier = Modifier.fillMaxWidth().height(52.dp),
                                    shape = MaterialTheme.shapes.large,
                                ) { Text(if (busy) "Saving request…" else "Request visit") }
                            }
                        }
                    }
                    Card(colors = CardDefaults.cardColors(containerColor = HgColor.White)) {
                        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("My bookings", style = MaterialTheme.typography.titleLarge, color = HgColor.PrimaryDark)
                            Text("Showing only your records (maximum 50).", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (bookings.isEmpty()) Text("No booking requests yet.", style = MaterialTheme.typography.bodyMedium)
                            bookings.forEach { booking ->
                                BookingRow(booking, busy) {
                                    busy = true
                                    notice = null
                                    repository.cancelBooking(booking.id) { result ->
                                        busy = false
                                        result.fold(onSuccess = { notice = "Booking request cancelled."; refresh() }, onFailure = { notice = it.message ?: "The booking could not be cancelled." })
                                    }
                                }
                            }
                        }
                    }
                }
            }
            Text("Development only. No clinical advice or emergency dispatch. For emergencies, contact local emergency services.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun ProfessionalOption(professional: CareProfessional, selected: Boolean, onSelect: () -> Unit) {
    OutlinedButton(onClick = onSelect, modifier = Modifier.fillMaxWidth(), shape = MaterialTheme.shapes.large) {
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text("${professional.displayName} · ${professional.professionalType.replaceFirstChar { it.uppercase() }}", style = MaterialTheme.typography.titleSmall, color = if (selected) HgColor.PrimaryDark else HgColor.TextPrimary)
            Text("${professional.specialty} · ${professional.qualification} · ${professional.experienceYears} years", style = MaterialTheme.typography.bodySmall)
            Text("${professional.city} · ${professional.availability}", style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun BookingRow(booking: CareBooking, busy: Boolean, onCancel: () -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = HgColor.Teal50)) {
        Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(if (booking.serviceType == "nurse_visit") "Nurse visit" else "Doctor visit", style = MaterialTheme.typography.titleSmall, color = HgColor.PrimaryDark)
            Text(booking.scheduledAt?.let { SimpleDateFormat("EEE, d MMM yyyy · h:mm a", Locale.getDefault()).format(it) } ?: "Schedule unavailable", style = MaterialTheme.typography.bodySmall)
            Text("Status: ${booking.status}", style = MaterialTheme.typography.bodySmall)
            if (booking.status in setOf("requested", "accepted")) {
                Spacer(Modifier.height(2.dp))
                OutlinedButton(onClick = onCancel, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Cancel request") }
            }
        }
    }
}
