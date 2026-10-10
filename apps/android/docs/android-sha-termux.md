# Android SHA fingerprints from Termux

These commands obtain the SHA-1 and SHA-256 fingerprints needed by Firebase. They do not reveal private keys.

## 1. Install the required tools

```bash
pkg update -y && pkg upgrade -y
pkg install openjdk-17 openssl -y
java -version
keytool -help | head
```

If `openjdk-17` is unavailable, use:

```bash
pkg search openjdk
pkg install openjdk-21 -y
```

## 2. Create the standard debug keystore if it does not exist

```bash
mkdir -p "$HOME/.android"
if [ ! -f "$HOME/.android/debug.keystore" ]; then
  keytool -genkeypair -v \
    -keystore "$HOME/.android/debug.keystore" \
    -storepass android \
    -keypass android \
    -alias androiddebugkey \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US"
fi
```

## 3. Print debug SHA-1 and SHA-256

```bash
keytool -list -v \
  -keystore "$HOME/.android/debug.keystore" \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | grep -E 'Alias name:|SHA1:|SHA256:'
```

Copy both values exactly, including the colons, and send them in chat. I will add them to the Firebase Android app in both required environments.

## 4. Optional: create a release keystore on the phone

Only do this if you want the phone to own the release signing key. Keep the password safe; it cannot be recovered by us.

```bash
mkdir -p "$HOME/homigo-secrets"
keytool -genkeypair -v \
  -keystore "$HOME/homigo-secrets/homigo-care-release.jks" \
  -alias homigo-care-release \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=HomigoCare,O=HomigoCare,C=PK"
```

Print the release fingerprints:

```bash
keytool -list -v \
  -keystore "$HOME/homigo-secrets/homigo-care-release.jks" \
  -alias homigo-care-release | grep -E 'Alias name:|SHA1:|SHA256:'
```

Do not paste the keystore, store password, or key password into chat. Send only SHA-1 and SHA-256 values.

## 5. Important distinction

- Debug fingerprints are enough for local Firebase Google Sign-In testing.
- Release fingerprints are required for signed Play Store/release builds.
- If the release keystore is lost, future updates may not be installable over the published Android app.
