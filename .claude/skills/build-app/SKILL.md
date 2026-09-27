---
name: build-app
description: Build the Android APK for this trip, locally or through GitHub Actions, and explain how to install it on the phone.
disable-model-invocation: true
---

# Build the app

1. Run `npm run validate`; stop on errors.
2. Run `npm run android:sync` (build, copy into android/, apply the app id, name and icon).
3. **If a local Android SDK is available** (`ANDROID_HOME` set or `sdkmanager` on PATH):
   `cd android && ./gradlew assembleDebug` produces
   `android/app/build/outputs/apk/debug/app-debug.apk`.
4. **Otherwise use CI:** commit and push. The "Android app" workflow builds on every push to `main` or `master`
   and attaches the APK to the run. Pushing a tag like `v3` also creates a GitHub Release with the
   APK, which is the easiest download on a phone.
5. Explain installing: open the APK on the phone and allow "install unknown apps" for the browser or
   Files app once. Without signing secrets (docs/android-build.md), each CI build uses a different
   debug key, so Android refuses to update over the previous install: uninstall first, or set up
   the secrets once.
6. Report the app id (`io.github.rrgmc.travel.<trip.id>`), the version code, and where the APK is.
