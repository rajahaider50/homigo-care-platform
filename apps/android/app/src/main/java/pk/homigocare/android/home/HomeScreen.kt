package pk.homigocare.android.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import pk.homigocare.android.R
import pk.homigocare.android.designsystem.icons.HgIcon
import pk.homigocare.android.designsystem.icons.HgIconImage
import pk.homigocare.android.designsystem.theme.HgColor
import pk.homigocare.android.profile.PatientProfile

@androidx.compose.runtime.Composable
fun HomeScreen(profile: PatientProfile, onSignOut: () -> Unit, onOpenCare: () -> Unit, onEmergencyCall: () -> Unit) {
    Surface(color = MaterialTheme.colorScheme.background, modifier = Modifier.fillMaxSize()) {
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Image(
                    painter = painterResource(R.drawable.homigo_lockup_horizontal),
                    contentDescription = "HomiGo Care — Because Care Begins at Home",
                    modifier = Modifier.weight(1f).height(54.dp),
                    contentScale = ContentScale.Fit,
                )
                OutlinedButton(onClick = onSignOut, shape = MaterialTheme.shapes.large) {
                    HgIconImage(HgIcon.LOGOUT, modifier = Modifier.size(18.dp), contentDescription = null)
                    Spacer(Modifier.size(6.dp))
                    Text("Sign out")
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Hello, ${profile.displayName}", style = MaterialTheme.typography.titleMedium, color = HgColor.PrimaryDark)
                Text("Because Care Begins at Home", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Row(
                modifier = Modifier.fillMaxWidth().background(HgColor.Green50, MaterialTheme.shapes.small).padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                HgIconImage(HgIcon.SHIELD_CHECK, modifier = Modifier.size(20.dp), contentDescription = null, tint = HgColor.Success)
                Text("Email and WhatsApp verified · patient profile secured", style = MaterialTheme.typography.bodyMedium, color = HgColor.Green700)
            }
            Text("Your care dashboard", style = MaterialTheme.typography.headlineMedium, color = HgColor.TextPrimary)
            DashboardCard(HgIcon.STETHOSCOPE, "Book a doctor or nurse", "Browse Admin-approved profiles and request a development home visit.", onClick = onOpenCare)
            DashboardCard(HgIcon.PASSPORT, "Health Passport", "Patient-controlled health-record access is planned for a later milestone.")
            DashboardCard(HgIcon.SIREN, "SOS", "No emergency-dispatch connection is active.", emergency = true)
            Text(
                "Development only. Booking requests are not clinical appointments until a professional accepts them. No production patient data or live responder alerts are supported.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            OutlinedButton(onClick = onEmergencyCall, modifier = Modifier.fillMaxWidth().height(48.dp), shape = MaterialTheme.shapes.large) {
                HgIconImage(HgIcon.PHONE, modifier = Modifier.size(18.dp), contentDescription = null, tint = HgColor.Primary)
                Spacer(Modifier.size(8.dp))
                Text("Open emergency dialer · 1122")
            }
        }
    }
}

@androidx.compose.runtime.Composable
private fun DashboardCard(icon: HgIcon, title: String, subtitle: String, emergency: Boolean = false, onClick: (() -> Unit)? = null) {
    val container = if (emergency) HgColor.Red50 else HgColor.White
    val iconSurface = if (emergency) HgColor.Red100 else HgColor.Teal50
    val iconTint = if (emergency) HgColor.Error else HgColor.Primary
    Card(
        modifier = Modifier.fillMaxWidth()
            .clickable(enabled = onClick != null) { onClick?.invoke() }
            .border(1.dp, if (emergency) HgColor.Red100 else HgColor.Border, MaterialTheme.shapes.medium),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = container),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Box(modifier = Modifier.size(48.dp).background(iconSurface, CircleShape), contentAlignment = Alignment.Center) {
                HgIconImage(icon, modifier = Modifier.size(24.dp), contentDescription = null, tint = iconTint)
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, style = MaterialTheme.typography.titleMedium, color = if (emergency) HgColor.Red700 else HgColor.TextPrimary)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
