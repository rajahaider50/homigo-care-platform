package pk.homigocare.android.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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

@Composable
fun HomeScreen(profile: PatientProfile, onSignOut: () -> Unit, onEmergencyCall: () -> Unit) {
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
                Text("Verified account · profile saved securely", style = MaterialTheme.typography.bodyMedium, color = HgColor.Green700)
            }
            Text("Your care dashboard", style = MaterialTheme.typography.headlineMedium, color = HgColor.TextPrimary)
            DashboardCard(HgIcon.STETHOSCOPE, "Doctor", "Professional discovery will open in the next milestone.")
            DashboardCard(HgIcon.HAND_HEART, "Nurse", "Home-nursing discovery will open in the next milestone.")
            DashboardCard(HgIcon.PASSPORT, "Health Passport", "Secure patient-controlled records are planned for a later milestone.")
            DashboardCard(HgIcon.SIREN, "SOS", "The in-app alert workflow is not active yet.", emergency = true)
            Text(
                "This is a non-commercial demo. No providers, bookings, health records, or alerts are present until real connected workflows are added. For immediate help, use your local emergency service.",
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

@Composable
private fun DashboardCard(icon: HgIcon, title: String, subtitle: String, emergency: Boolean = false) {
    val container = if (emergency) HgColor.Red50 else HgColor.White
    val iconSurface = if (emergency) HgColor.Red100 else HgColor.Teal50
    val iconTint = if (emergency) HgColor.Error else HgColor.Primary
    Card(
        modifier = Modifier.fillMaxWidth().border(1.dp, if (emergency) HgColor.Red100 else HgColor.Border, MaterialTheme.shapes.medium),
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
