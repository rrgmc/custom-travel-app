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
4. **Otherwise use CI**, which runs only on a `v*` tag or a manual run: the repo is private and each
   build costs Actions minutes, so **ask the user before tagging**, and build once per real
   version, not after every edit. Commit and push, then tag the next version (see existing tags
   with `git tag -l 'v*'`), e.g. `git tag v3 && git push origin v3`. That builds the APK and creates
   a GitHub Release with it, which is the easiest download on a phone.
5. Explain installing: open the APK on the phone and allow "install unknown apps" for the browser or
   Files app once. Without a stable signing key (docs/android-build.md), each CI build uses a
   different debug key, so Android refuses to update over the previous install: uninstall first.
   Offer the fix: in a private trip repo, `npm run signing:create` and commit `android/signing/`
   (option A), or repository secrets (option B).
6. Report the app id (`io.github.rrgmc.travel.<trip.id>`), the version code, and where the APK is.
