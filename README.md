# Custom travel app

A template for building a small, offline Android app for **one specific vacation**: its
destinations, what's worth doing at each, and the reservations, and nothing else. Claude Code does
most of the work, following the rules in [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs).

The app is generic; the trip is data. Everything about a vacation lives in
[`trip/trip.yaml`](trip/trip.yaml) plus the vouchers in `trip/files/`.

What the app shows:

- **Destinations** (home): the places you stay, in travel order, with optional dates. During the
  trip, the one you're in is highlighted at the top. With a single place to stay, the app opens
  straight on its page.
- **Destination**: one tab per category (Things to do, Restaurants, Cafés…) listing its
  attractions, including nearby towns visited from there, marked **Must-see**, **If there's time**
  or **Maybe**, with the town and travel time when they're elsewhere; then a **Booked here** tab
  and an **About** tab (intro, map, tips).
- **Attraction**: description, tips, hours, closed days, price, time needed, travel time from where
  you stay, whether to book ahead, one-tap map, directions, call and website, and its ticket if
  booked.
- **Reservations**: stays, tickets, transport and other bookings as ticket stubs with a big,
  tap-to-copy confirmation code, details, payment status, cancellation deadline and the voucher
  (QR codes readable offline).
- **Schedule** (only if you ask for one): day by day, the destination and a few attractions, no times.

It's a React web app packaged into an Android APK with [Capacitor](https://capacitorjs.com), so it
runs fully offline. English and Brazilian Portuguese UI; light and dark mode.

## A new trip

1. On GitHub: **Use this template → Create a new repository**. Make it **private**.
2. Clone it and open [Claude Code](https://claude.com/claude-code) in the folder.
3. Run `/new-trip` and say where you'll stay and which nearby towns you'll visit.
4. `/research` each destination: Claude adds the attractions it recommends per category, nearby
   towns included, and you trim the list.
5. Drop booking confirmations (PDFs, emails, screenshots) into `inbox/` and run `/import-booking`.
   If you want a day-by-day plan, ask for it with `/suggest-schedule`.
6. Push, then tag `v1` (or run `/build-app`). GitHub Actions builds the APK and publishes a Release
   you can download on the phone. Plain pushes don't build, to save Actions minutes (see
   [docs/android-build.md](docs/android-build.md), including one-time signing setup).

Improvements to this template can later be pulled into a trip repo with `/update-base`.

## Working on the template itself

```sh
npm install
npm run dev                     # http://localhost:5173/?now=2026-10-13T10:00 simulates a moment in the trip
npm run validate                # check trip/trip.yaml
npm run build                   # validate + icons + typecheck + build
npm run android:sync            # build and copy into android/, apply the trip's app id/name/icon
npm run android:apk             # debug APK (needs the Android SDK and JDK 21)
```

Mark this repository as a template in **Settings → General → Template repository**.

## Layout

```
CLAUDE.md                 instructions Claude Code loads automatically
.claude/skills/           /new-trip, /research, /import-booking, /suggest-schedule, /build-app, /update-base
.claude/settings.json     allowed commands + a hook that re-validates trip.yaml after each edit
docs/business-rules.md    what goes in a trip: destinations, attractions, reservations, schedule
docs/data-model.md        trip.yaml reference
docs/android-build.md     building, installing, signing
trip/                     the vacation (the only per-trip folder)
src/                      the app
android/                  Capacitor Android project
scripts/                  validator, icon generator, Android identity, Claude hook
inbox/                    raw confirmations to import (never committed)
```
