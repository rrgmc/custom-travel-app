# Data model (`trip/trip.yaml`)

The schema in `trip/trip.schema.json` is the source of truth; this is the readable summary.
The sample `trip/trip.yaml` in the template shows every field in use.

## Conventions

- **IDs** are kebab-case (`hotel-alfama`, `flight-out`), unique within their list, and stable:
  schedule items refer to them, so don't rename casually.
- **Dates** are `YYYY-MM-DD`. **Times** are `HH:MM` (24h).
- **Date-times** are `YYYY-MM-DDTHH:MM` with **no offset**: the wall-clock time at the place where
  it happens, exactly as printed on the ticket. The app displays them as-is.
  - Default zone is `trip.timezone`. When a reservation starts or ends elsewhere (e.g. a flight from
    home), set `startTimezone` / `endTimezone`. The app then shows a small offset like `GMT-3`.
- YAML gotcha: inside `{ ... }` a comma ends the value. Quote any value containing a comma:
  `{ label: Seats, value: "24A, 24B" }`.

## Sections

`trip` — id (lowercase slug, used in the Android app id), title (≤ 40 chars, it's the app name),
subtitle, start, end, timezone (IANA), language (`en` | `pt-BR`), currency, travelers, accent
(hex color for the app), icon (1–2 characters for the launcher icon).

`places[]` — anything you might navigate to. `kind` is one of lodging, attraction, restaurant,
transport, shopping, service, other. Give `location {lat, lng}` whenever possible (the map buttons
use it); otherwise `address`. `wishlist: true` = worth visiting but not scheduled.

`reservations[]` — everything booked or requested. `type` is one of lodging, flight, train, bus,
car-rental, transfer, restaurant, activity, ticket, other. `status` is confirmed | pending |
cancelled. `place` = where it starts; `to` = arrival for transport. `confirmation` is shown as a large
copyable code. `details[]` holds labeled facts (seat, room, gate). `payment.status` is paid | partial |
at-location | unpaid. `attachments[]` = `{ file, label, preview? }`, files under `trip/files/`.

`days[]` — one per trip date, in order. `base` = where you sleep that night. `items[]` are the plan:
`{ time?, end?, title, place?, reservation?, notes?, optional? }`, ordered by time.
`alternatives[]` are other plans for the same day: `{ title, when?, items[] }`.

`contacts[]` — emergency numbers, hosts, guides: `{ name, role?, phone?, email?, notes? }`.

`info[]` — free notes: `{ title, body }`. In `body`, a blank line starts a new paragraph and lines
starting with `- ` form a list.

## Changing the model

Add fields only when a real trip needs them, and make them generic. Update together:
schema → `src/types.ts` → `scripts/validate.mjs` (rules) → UI → this file → the sample trip.
