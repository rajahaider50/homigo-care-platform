package pk.homigocare.android.designsystem.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalLayoutDirection

private val HgLightColors = lightColorScheme(
    primary = HgColor.Primary,
    onPrimary = HgColor.White,
    primaryContainer = HgColor.Teal50,
    onPrimaryContainer = HgColor.PrimaryDark,
    secondary = HgColor.Secondary,
    onSecondary = HgColor.PrimaryDark,
    secondaryContainer = HgColor.Orange50,
    onSecondaryContainer = HgColor.Orange700,
    background = HgColor.White,
    onBackground = HgColor.TextPrimary,
    surface = HgColor.White,
    onSurface = HgColor.TextPrimary,
    surfaceVariant = HgColor.SurfaceMuted,
    onSurfaceVariant = HgColor.TextSecondaryAA,
    error = HgColor.Error,
    onError = HgColor.White,
    errorContainer = HgColor.Red50,
    onErrorContainer = HgColor.Red700,
    outline = HgColor.Border,
    outlineVariant = HgColor.Divider,
)

/** The source kit does not contain the referenced font files, so Android's native sans family is used as the specified fallback. */
private val HgTypography = Typography(
    displayMedium = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.Bold, fontSize = 28.sp, lineHeight = 34.sp),
    headlineMedium = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 28.sp),
    titleMedium = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.SemiBold, fontSize = 18.sp, lineHeight = 24.sp),
    bodyLarge = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp),
    bodyMedium = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.Bold, fontSize = 16.sp, lineHeight = 20.sp),
)

private val HgShapes = Shapes(
    extraSmall = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
    small = androidx.compose.foundation.shape.RoundedCornerShape(20.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(15.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(25.dp),
    extraLarge = androidx.compose.foundation.shape.RoundedCornerShape(24.dp),
)

@Composable
fun HomiGoTheme(rtl: Boolean = false, content: @Composable () -> Unit) {
    CompositionLocalProvider(
        LocalLayoutDirection provides if (rtl) LayoutDirection.Rtl else LayoutDirection.Ltr,
    ) {
        MaterialTheme(
            colorScheme = HgLightColors,
            typography = HgTypography,
            shapes = HgShapes,
            content = content,
        )
    }
}

object HgRadius {
    val Button = 25.dp
    val Input = 25.dp
    val Card = 15.dp
    val Chip = 20.dp
    val Sheet = 24.dp
    val Small = 8.dp
}

object HgSpace {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 20.dp
    val xxl = 24.dp
    val x3 = 32.dp
    val x4 = 40.dp
    val x5 = 48.dp
}

const val HgMinTouchTarget = 48
