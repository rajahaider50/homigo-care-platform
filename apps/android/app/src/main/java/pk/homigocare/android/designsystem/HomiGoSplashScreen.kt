package pk.homigocare.android.designsystem

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import pk.homigocare.android.R
import pk.homigocare.android.designsystem.theme.HgColor

@Composable
fun HomiGoSplashScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(HgColor.Primary, HgColor.PrimaryDark))),
        contentAlignment = Alignment.Center,
    ) {
        Image(
            painter = painterResource(R.drawable.homigo_lockup_horizontal_white),
            contentDescription = "HomiGo Care — Because Care Begins at Home",
            modifier = Modifier.fillMaxWidth(0.84f).height(104.dp),
            contentScale = ContentScale.Fit,
        )
    }
}
