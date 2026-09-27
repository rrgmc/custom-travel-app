---
name: new-trip
description: Start a new vacation in a repo created from the custom-travel-app template, replacing the sample trip with the real one.
disable-model-invocation: true
---

# Start a new trip

This repo was just created from the template and still contains the sample trip (Lisbon).
Replace it with the user's real trip. $ARGUMENTS may already contain some of the answers.

1. **Interview briefly.** Ask only for what you don't have yet, in one message:
   - destination(s) and dates (first and last day of the trip)
   - who is traveling (names; mention kids or anyone with specific needs)
   - language for the app text (`en` or `pt-BR`)
   - bookings already made (they can drop the confirmations in `inbox/`)
   - optionally an accent color and a 1–2 letter icon
2. **Reset `trip/trip.yaml`.** Keep the schema comment on the first line. Remove every sample place,
   reservation, day, contact and info block. Fill `trip:` with the answers. Derive `trip.id` from
   the destination and year (lowercase letters and digits only, e.g. `gramado2026`) and
   `trip.timezone` from the destination. Create one `days` entry per date with `items: []`
   (the validator warns about empty days until they're planned).
3. Add `contacts` useful at the destination (emergency number) and an `info` section with a
   documents checklist suited to the trip (international or domestic). Researched facts follow
   rule 2 in docs/business-rules.md.
4. Delete the sample files from `trip/files/` (keep `.gitkeep`).
5. If there is anything in `inbox/`, continue with the import-booking skill for each file.
6. Run `npm run build` and `npm run trip:apply`. Fix errors; summarize warnings.
7. Tell the user what was set up, what is still missing (bookings, days to plan), and suggest
   `/plan-days` next. Remind them the repo must stay private.
