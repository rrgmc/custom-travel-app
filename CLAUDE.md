# Custom travel app

This repo is a **template**. Each vacation gets its own repo created from it ("Use this template"),
and that repo builds one Android app containing everything for that trip: destinations, places,
reservations, daily plans, contacts and notes. The app works fully offline.

The core idea: **the app is generic, the trip is data.** Everything specific to a vacation lives in
`trip/`. Code in `src/` must never mention a specific trip, city, hotel or date.

## How the pieces fit

```
trip/trip.yaml          ← THE trip. The only file that normally changes per vacation.
trip/trip.schema.json   ← structure of trip.yaml (validated on every build and after every edit)
trip/files/             ← vouchers, tickets, PDFs and their PNG previews, bundled into the app
src/                    ← React + TypeScript web app (Vite), rendered inside Capacitor
android/                ← Capacitor Android project (identity patched by scripts/apply-trip-identity.mjs)
scripts/validate.mjs    ← schema + business-rule checks (errors fail the build)
inbox/                  ← raw booking emails/PDFs to import; never committed
docs/                   ← rules and references (imported below)
```

## Commands

- `npm run validate` — check trip.yaml. Run after every change to trip data and fix all errors.
  Report warnings to the user; don't silence them by deleting data.
- `npm run dev` — web preview. Add `?now=2026-10-10T10:00` to the URL to simulate a moment during the
  trip (interpreted in the trip timezone; it sticks for the browser session).
- `npm run build` — validate + icons + typecheck + production build into `dist/`.
- `npm run android:sync` — build, copy into `android/`, apply the trip's app id/name/icon.
- `npm run android:apk` — the above plus a debug APK (needs a local Android SDK). Otherwise CI builds it, only on a `v*` tag or a manual run.

## Skills in this repo

- `/new-trip` — start a new vacation from the template (replaces the sample trip).
- `/import-booking` — turn confirmations in `inbox/` (or pasted text) into reservations, places and attachments.
- `/plan-days` — build or rework the daily schedules and alternative plans.
- `/check-trip` — full pre-trip review: validator, gaps, deadlines, things to confirm.
- `/build-app` — produce the APK (locally or via GitHub Actions) and explain how to install it.
- `/update-base` — pull app improvements from the template into a trip repo without touching `trip/`.

## Rules

@docs/business-rules.md
@docs/data-model.md

## Technical rules

- **Offline only.** The app must never need the network: no fetch to remote APIs, no CDNs, no remote
  fonts, images or map tiles. Fonts come from `@fontsource/*` packages. Things that genuinely need
  another app (maps, phone calls, websites, PDFs) go through `src/lib/native.ts`.
- **Generic code, data-driven behavior.** If a trip needs something the app can't show, add a generic
  feature: update `trip/trip.schema.json`, `src/types.ts`, `scripts/validate.mjs`, `docs/data-model.md`
  and the sample in the template, in the same change. Never special-case a trip in `src/`.
- **Times are wall-clock at the place.** Never convert trip times between zones for display.
  Only `nowAtDestination()` in `src/lib/time.ts` touches real time; keep its offset logic in sync
  with `scripts/validate.mjs`.
- **All UI text goes through `src/lib/i18n.ts`**, in every supported language (`en`, `pt-BR`).
  User-visible text inside trip.yaml is written in `trip.language`.
- **Design.** Tokens live at the top of `src/styles.css`. The ticket stub is the one bold element;
  keep everything else quiet. Touch targets ≥ 44px, readable in sunlight, dark mode must work.
  A trip may set `trip.accent` and `trip.icon`; don't restyle per trip beyond that.
- **Android identity comes from trip.yaml.** `applicationId` is `io.github.rrgmc.travel.<trip.id>`,
  so each trip installs as a separate app. Don't hand-edit applicationId, app name or icons; run
  `npm run trip:apply`. Never change the Java `namespace` (`io.github.rrgmc.travel`).
- Before finishing any change: `npm run build` must pass. For UI changes, check the affected screens
  with `?now=` set before, during and after the trip, in light and dark mode.
- Never commit `inbox/`, `dist/`, keystores or anything in `.gitignore`.
