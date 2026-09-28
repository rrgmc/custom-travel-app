---
name: new-trip
description: Start a new vacation in a repo created from the custom-travel-app template, replacing the sample trip with the real one.
disable-model-invocation: true
---

# Start a new trip

This repo was just created from the template and still contains the sample trip (Portugal).
Replace it with the user's real trip. $ARGUMENTS may already contain some of the answers.

1. **Interview briefly.** Ask only for what you don't have yet, in one message:
   - where they'll stay: each place with a hotel, in travel order, with dates if known
     (a destination is a place you stay, rule 7)
   - nearby towns they plan to visit from there, and how they'll get around (car, tours…)
   - who's traveling: children and their ages, anyone with mobility needs (goes in `trip.travelers`)
   - language for the app text (`en` or `pt-BR`)
   - reservations already made (they can drop the confirmations in `inbox/`)
   - optionally an accent color and a 1–2 letter icon
2. **Reset `trip/trip.yaml`.** Keep the schema comment on the first line. Remove every sample
   category, destination, attraction, reservation and the `schedule`. Fill in:
   - `trip:` — derive `trip.id` from the main destination and year (lowercase letters and digits
     only, e.g. `portugal2026`), `trip.timezone` from the first destination, a short `title`.
   - `destinations:` — one entry per place they stay, in order, with `country`, `location`, and
     `from`/`to` when known; `timezone` only if it differs from `trip.timezone`. Write a short
     `summary` and practical `tips` (rule 8 in docs/business-rules.md).
   - `categories:` — a short starting set that fits the trip (rule 10), e.g. Things to do,
     Restaurants. It can grow during research.
   - `attractions: []` and `reservations: []`. **No `schedule`** (rule 21).
3. Delete the sample files from `trip/files/` (keep `.gitkeep`).
4. If there is anything in `inbox/`, continue with the import-booking skill for each file.
5. Run `npm run build` and `npm run trip:apply`. Fix errors; summarize warnings (empty destinations
   are expected at this point).
6. Tell the user what was set up and suggest `/research` next, destination by destination
   (it covers the nearby towns too).
   Remind them the repo must stay private.
