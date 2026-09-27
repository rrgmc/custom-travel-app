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

- **GitHub Actions** (`.github/workflows/android.yml`): every push to `main` or `master` builds an APK and
  attaches it to the run (Actions → run → Artifacts). A tag like `v1` also publishes a Release with
  the APK — the easiest thing to download on a phone.
- **Locally**: install Android Studio (or the command-line SDK) and JDK 21, then
  `npm run android:apk`. Or `npm run android:sync` and open `android/` in Android Studio.

## Installing

Download the APK on the phone and open it. Android asks once to allow installs from that app
(browser or Files). Each trip installs as a separate app, so old trips can stay or be uninstalled.

## Stable signing (recommended)

Without a signing key, CI builds a debug APK signed with a random key each run, and Android won't
install an update over an app signed with a different key (you must uninstall first).
Create one key and reuse it for all trips:

```sh
keytool -genkeypair -v -keystore travel.jks -alias travel -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 travel.jks   # macOS: base64 -i travel.jks
```

Then in the repo (or once at the account level, as organization/user secrets):
Settings → Secrets and variables → Actions → add `ANDROID_KEYSTORE_BASE64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`travel`), `ANDROID_KEY_PASSWORD`.
CI then builds a signed release APK. Keep `travel.jks` somewhere safe outside git.

## Web version

`dist/` is also an installable offline PWA (service worker, manifest). It's only useful if you host it
somewhere private; the Android app is the main target.
