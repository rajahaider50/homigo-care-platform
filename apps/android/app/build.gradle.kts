plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.gms.google-services")
}

android {
    namespace = "pk.homigocare.android"
    compileSdk = 35
    // Keep the deployable development endpoint usable for a normal APK while allowing
    // CI/release builds to override it with HOMIGO_API_BASE_URL.
    val homigoApiBaseUrl = providers.environmentVariable("HOMIGO_API_BASE_URL")
        .orElse("https://homigo-care-api-rajahaider50.vercel.app")
        .get()
    defaultConfig {
        applicationId = "pk.homigocare.android"
        minSdk = 23
        targetSdk = 35
        versionCode = 3
        versionName = "0.3.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "HOMIGO_API_BASE_URL", "\"$homigoApiBaseUrl\"")
    }
    signingConfigs {
        getByName("debug") {
            val homigoDevKeystorePath = System.getenv("HOMIGO_DEV_DEBUG_KEYSTORE")
            if (!homigoDevKeystorePath.isNullOrBlank()) {
                storeFile = rootProject.file(homigoDevKeystorePath)
                storePassword = System.getenv("HOMIGO_DEV_DEBUG_STORE_PASSWORD") ?: "android"
                keyAlias = System.getenv("HOMIGO_DEV_DEBUG_KEY_ALIAS") ?: "androiddebugkey"
                keyPassword = System.getenv("HOMIGO_DEV_DEBUG_KEY_PASSWORD") ?: "android"
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true; buildConfig = true }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.activity:activity-compose:1.10.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.9.0")

    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")

    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")

    testImplementation("junit:junit:4.13.2")
}
