# Building and installing the Android app

## How it's put together

The web app in `src/` is built by Vite into `dist/`, then Capacitor copies `dist/` into the Android
project (`android/app/src/main/assets/public`). The APK contains every file: no hosting, no network.

Per-trip identity is applied by `scripts/apply-trip-identity.mjs` from `trip/trip.yaml`:

| What | Value |
|---|---|
| applicationId | `io.github.rrgmc.travel.<trip.id>` — one installable app per trip |
| App name | `trip.title` |
| Launcher icon, splash | `trip.icon` on `trip.accent` |
| versionCode / versionName | `VERSION_CODE` / `VERSION_NAME` env vars (CI sets the run number) |

The Java namespace stays `io.github.rrgmc.travel` for every trip, so no source files move.

## Building

- **GitHub Actions** (`.github/workflows/android.yml`): builds **only when asked**, because trip repos
  are private and every build (roughly 5 minutes) uses the account's Actions minutes. Ordinary
  pushes build nothing; validation already runs locally.
  - Push a tag like `v1` (`git tag v1 && git push origin v1`): builds and publishes a Release with the
    APK, the easiest thing to download on a phone. Use the next number for each new version.
  - Or Actions → "Android app" → **Run workflow**: builds and attaches the APK to the run
    (Artifacts, kept 7 days). Good for a test build without a Release.
- **Locally**: install Android Studio (or the command-line SDK) and JDK 21, then
  `npm run android:apk`. Or `npm run android:sync` and open `android/` in Android Studio.

## Installing

Download the APK on the phone and open it. Android asks once to allow installs from that app
(browser or Files). Each trip installs as a separate app, so old trips can stay or be uninstalled.

The trip repo is private, so downloading from its Release page needs a GitHub login in the phone's
browser (or the GitHub app). For travel companions without access, download the APK once and send
them the file directly.

## Stable signing (recommended)

Android installs an update only over an app signed with the same key. There are two ways to give
every build the same key.

### Option A: key committed to the trip repo (simplest, private repos only)

```sh
npm run signing:create
git add android/signing .gitignore && git commit -m "Signing key"
```

This creates `android/signing/release.jks` and `android/signing/signing.env` (random passwords)
and adds a `.gitignore` exception for the keystore. CI uses them when there are no signing
secrets. Anyone who can read the repo can sign an app as yours, so only do this in a private repo.
Never run it in the template. Keep the key for the life of the trip: a new key breaks updates.

### Option B: repository secrets

Without a signing key, CI builds a debug APK signed with a random key each run, and Android won't
install an update over an app signed with a different key (you must uninstall first).
Create one key on your computer and reuse it for all trips:

```sh
keytool -genkeypair -v -keystore travel.jks -alias travel -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 travel.jks   # macOS: base64 -i travel.jks
```

Then add these secrets to **each trip repo** (Settings → Secrets and variables → Actions):
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`travel`),
`ANDROID_KEY_PASSWORD`.
CI then builds a signed release APK. Keep `travel.jks` somewhere safe outside git.

Personal GitHub accounts have no account-wide Actions secrets, so the four secrets are set per repo.
If the trip repos live in a GitHub organization, they can be set once as organization secrets
instead.

## Web version

`dist/` is also an installable offline PWA (service worker, manifest). It's only useful if you host it
somewhere private; the Android app is the main target.
