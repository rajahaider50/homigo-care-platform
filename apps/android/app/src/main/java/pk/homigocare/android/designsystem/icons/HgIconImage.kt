package pk.homigocare.android.designsystem.icons

import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource

@Composable
fun HgIconImage(
    icon: HgIcon,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    tint: Color = MaterialTheme.colorScheme.primary,
) {
    Icon(
        painter = painterResource(id = icon.res),
        contentDescription = contentDescription,
        modifier = modifier,
        tint = tint,
    )
}
