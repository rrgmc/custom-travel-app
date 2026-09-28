# Data model (`trip/trip.yaml`)

The schema in `trip/trip.schema.json` is the source of truth; this is the readable summary.
The sample `trip/trip.yaml` in the template shows every field in use.

## Conventions

- **IDs** are kebab-case (`sao-jorge`, `hotel-lisbon`), unique within their list, and stable:
  other entries refer to them, so don't rename casually.
- **Dates** are `YYYY-MM-DD`.
- **Date-times** are `YYYY-MM-DDTHH:MM` with **no offset**: the wall-clock time at the place where
  it happens, exactly as printed on the ticket. The app displays them as-is. Reservation `start`/`end`
  may also be a bare date when there's no time.
  - Default zone is the destination's `timezone`, else `trip.timezone`. When a reservation starts or
    ends elsewhere (e.g. a flight from home), set `startTimezone` / `endTimezone`. The app then shows
    a small offset like `GMT-3`.
- **Phone numbers** (`phone`, `contact`) are in international format, `+55 54 3286-4055`, so the
  Call button dials correctly from any phone, abroad or not.
- Text fields (`summary`, `tips`, `description`, `notes`): a blank line starts a new paragraph and
  lines starting with `- ` form a list.
- YAML gotcha: inside `{ ... }` a comma ends the value. Quote any value containing a comma:
  `{ label: Seats, value: "24A, 24B" }`.

## Sections

`trip` — id (lowercase letters and digits, used in the Android app id), title (≤ 40 chars, it's the
app name), subtitle, timezone (IANA, default for everything), language (`en` | `pt-BR`), currency,
accent (hex color for the app), icon (1–2 characters for the launcher icon), travelers (who's
traveling, with children's ages and mobility needs; it guides research and planning).

`categories[]` — attraction categories for this trip, in display order: `{ id, name }`.

`destinations[]` — the **places you stay** (each with its hotel), **in travel order**:
`{ id, name, country?, from?, to?, timezone?, location?, summary?, tips? }`. `from`/`to` are
optional but go together. Nearby towns visited from there are attractions, not destinations. The
home screen lists destinations and highlights the one whose dates include today; with a single
destination the app opens straight on its page. A destination page has one tab per category with
attractions, then "Booked here" and "About" (summary, map, tips). Category ids `booked` and `about`
are reserved.

`attractions[]` — what's worth doing or eating at each destination, including nearby towns visited
from it: `{ id, destination, category, name, priority, description?, tips?, hours?, closed?,
price?, duration?, length?, town?, travelTime?, booking?, address?, location?, phone?, url? }`. `priority` is
`must` (must-see), `want` (if there's time) or `maybe`. `length` is the visit length at a glance
(`quick` | `hours` | `half-day` | `full-day`, shown as a tag next to the priority); `duration` is
the detailed text ("1h–1h30"). `town` is set only when it's in another town
than the destination; `travelTime` is from where you stay ("20 min by car"). A whole town can be a
single attraction named after it.

`reservations[]` — everything booked or requested. `type` is one of lodging, ticket, flight, train,
bus, car-rental, transfer, restaurant, other; the app groups them as Stays, Tickets, Transport and
Other. `status` is confirmed | pending | cancelled. `destination` and `attraction` link it to where
it's used. `start`/`end` are check-in/out, departure/arrival or entry time (leave out for
open-dated tickets). `from`/`to` are the route for transport. `confirmation` is shown as a large
copyable code. `details[]` holds labeled facts (seat, room). `payment.status` is paid | partial |
at-location | unpaid. `address`/`location` feed the map buttons (hotels). `attachments[]` =
`{ file, label, preview? }`, files under `trip/files/`.

`schedule[]` — **optional**, only when the user asked for a suggested schedule. One entry per day:
`{ date, destination, title?, attractions?: [ids in suggested order], notes? }`. No times.
Reservations on that date are shown automatically. Without it, the app has no Schedule tab.

## Changing the model

Add fields only when a real trip needs them, and make them generic. Update together:
schema → `src/types.ts` → `scripts/validate.mjs` (rules) → UI → this file → the sample trip.
