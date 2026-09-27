# Custom travel app

A template for building a small, offline Android app for **one specific vacation**: its days,
places, bookings, vouchers and contacts, and nothing else. Claude Code does most of the work,
following the rules in [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs).

The app is generic; the trip is data. Everything about a vacation lives in
[`trip/trip.yaml`](trip/trip.yaml) plus the vouchers in `trip/files/`.

What the app shows:

- **Today**: the day's plan as a timeline with a "now" marker, today's bookings, and where you
  sleep tonight with one-tap map and directions. Before the trip it shows a countdown and what still
  needs attention.
- **Days**: every day with its plan and alternative plans (rain plan, slow day).
- **Bookings**: each reservation as a ticket stub with a big, tap-to-copy confirmation code,
  details, payment status, cancellation deadline and the voucher (QR codes readable offline).
- **Places**: everything you might go to, grouped by kind, with which day it's planned for.
- **Info**: emergency and local contacts, document checklist, notes.

It's a React web app packaged into an Android APK with [Capacitor](https://capacitorjs.com), so it
runs fully offline. English and Brazilian Portuguese UI; light and dark mode.

## A new trip

1. On GitHub: **Use this template → Create a new repository**. Make it **private**.
2. Clone it and open [Claude Code](https://claude.com/claude-code) in the folder.
3. Run `/new-trip` and answer a few questions.
4. Drop booking confirmations (PDFs, emails, screenshots) into `inbox/` and run `/import-booking`.
5. `/plan-days` to build the daily plans, `/check-trip` before leaving.
6. Push, then tag `v1` (or run `/build-app`). GitHub Actions builds the APK and publishes a Release
   you can download on the phone. Plain pushes don't build, to save Actions minutes (see
   [docs/android-build.md](docs/android-build.md), including one-time signing setup).

Improvements to this template can later be pulled into a trip repo with `/update-base`.

## Working on the template itself

```sh
npm install
npm run dev                     # http://localhost:5173/?now=2026-10-10T11:50 simulates a moment in the trip
npm run validate                # check trip/trip.yaml
npm run build                   # validate + icons + typecheck + build
npm run android:sync            # build and copy into android/, apply the trip's app id/name/icon
npm run android:apk             # debug APK (needs the Android SDK and JDK 21)
```

Mark this repository as a template in **Settings → General → Template repository**.

## Layout

```
CLAUDE.md                 instructions Claude Code loads automatically
.claude/skills/           /new-trip, /import-booking, /plan-days, /check-trip, /build-app, /update-base
.claude/settings.json     allowed commands + a hook that re-validates trip.yaml after each edit
docs/business-rules.md    what goes in a trip and how days are planned
docs/data-model.md        trip.yaml reference
docs/android-build.md     building, installing, signing
trip/                     the vacation (the only per-trip folder)
src/                      the app
android/                  Capacitor Android project
scripts/                  validator, icon generator, Android identity, Claude hook
inbox/                    raw confirmations to import (never committed)
```
