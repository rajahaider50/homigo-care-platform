# Firebase Android fingerprints

## Debug keystore received from Termux

These are non-secret certificate fingerprints for the Termux debug keystore:

- SHA-1: `DD:1C:60:CF:51:4B:61:D3:26:4A:31:07:19:82:96:61:BF:C3:E4:A2`
- SHA-256: `0A:1C:A8:AB:5C:56:28:7F:B6:3A:40:11:E4:03:91:1B:43:2B:F0:ED:6C:22:9B:1E:79:8C:C2:63:87:91:84:3A`

The production Firebase Android app has both fingerprints registered. The development app has SHA-256 registered; the Firebase MCP returned an error while adding the SHA-1, so add that one manually in Firebase Console if Google Sign-In testing requires it.

## Release keystore

The release fingerprints received from Termux are:

- SHA-1: `1A:75:E4:5C:6E:D8:97:20:63:2F:5B:AD:7D:27:E0:49:F2:49:9F:FF`
- SHA-256: `C4:22:65:AF:A1:61:65:8C:47:A1:00:A8:25:55:99:E6:A3:A9:8C:DB:03:BC:B1:39:7C:2A:CC:4B:C3:DE:81:23`

Production Firebase has both release fingerprints registered. Development Firebase has the release SHA-256 registered. The MCP/API returned an error twice for the development release SHA-1, so add that one manually in Firebase Console if development Google Sign-In requires it.

Do not commit the `.jks` file or passwords.
