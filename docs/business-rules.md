# Business rules

These govern what goes into a trip. `scripts/validate.mjs` enforces the mechanical ones; the rest
are judgment calls Claude is expected to follow.

The app is a **loose trip guide**, not an hour-by-hour plan: a list of destinations, what's worth
doing at each one, and the reservations. A day-by-day schedule exists only if the user asks for one.

## Truth and sources

1. **Never invent booking facts.** Confirmation codes, prices, times, seats, addresses and names on a
   reservation come only from the user or from their documents. If something is missing, leave the
   field out and tell the user. Never fill in a plausible-looking value.
2. **Researched facts are labeled.** Opening hours, prices and closed days found on the web go in
   `hours`, `price`, `closed` with the month they were checked, e.g. `09:00–18:00 (checked Sep 2026)`.
   If you couldn't confirm something, leave it out or say so rather than guessing.
3. **Keep status honest.** A reservation is `confirmed` only when there is a confirmation (code,
   email or voucher). Requests waiting for an answer are `pending`. Cancelled reservations stay in the
   file with `status: cancelled` rather than being deleted, so nobody wonders later.
4. When a new document contradicts the file (changed time, new room), update the data and tell the
   user what changed. Flight schedule changes are common; always point them out.

## Privacy

5. The trip repo must be **private**. Even so, store only what's needed at a counter: confirmation
   codes, booking names, seats. Never store passport or ID numbers, full card numbers, CVVs,
   passwords or login links with tokens. Replace them with a note like "passport — see physical copy".
6. Raw emails and PDFs stay in `inbox/` (never committed). Only the voucher itself is copied to
   `trip/files/` when it will be shown at a counter or gate.

## Destinations

7. A destination is **a place where you stay** (sleep in a hotel), in travel order. Dates
   (`from`/`to`) are optional: add them when the user knows them. A travel day belongs to both
   destinations (one's `to` equals the next one's `from`). Each destination normally has one
   lodging reservation.
   **Nearby towns visited from there are not destinations**: they're attractions of the place you
   stay, with `town` set (e.g. staying in Gramado, Canela's sights are Gramado attractions with
   `town: Canela`).
8. Each destination gets a short `summary` (what it's like, why go) and, when useful, `tips`
   (getting around, money, safety, customs). Practical and brief.

## Attractions

9. **Add everything recommended, the user trims.** When researching a destination, add every
   attraction you'd recommend, with an honest priority, then give the user a short summary per
   category so they can remove what they don't want ("drop 4 and 9", "no maybes"). If the user asks
   to review first, show the list and add only what they keep. Be selective up front: recommending
   everything is not a license to pad the list.
10. **Categories are per trip.** Pick ones that fit the trip ("Things to do", "Restaurants",
    "Beaches", "Wineries"…), keep the list short, and reuse them across destinations. Categories
    live in `categories`, in display order.
11. **Priority is required**: `must` (must-see, would regret missing), `want` (if there's time),
    `maybe` (only if it fits or for a rainy day). Be selective with `must`; a few per destination.
    Priorities reflect **who's traveling** (`trip.travelers`): with young children, kid-friendly
    places rise, and long hikes, late dinners and fragile or adults-only places drop.
12. Each attraction gets a `description` (what it is, why go) and, when useful: `tips`, `hours`,
    `closed`, `price`, `duration` (how long a visit takes), `booking` (whether to book ahead and how),
    and `location` so the map buttons work. Add `address` if coordinates aren't certain.
    With children, `price` includes the child price for their age and `tips` any age or height
    limits (rides, platforms) and what's hard for them (long staircases, cold, late hours).
13. Restaurants and cafés are attractions too, in their own categories.
    Every other attraction gets a `length`, the visit length at a glance: `quick` (under 1 h),
    `hours` (a few hours), `half-day` or `full-day`, counting the visit itself, not the drive.
    It also gets `rain`: `indoor` (covered, fine in rain), `partly` (some covered parts, or fine in
    light rain) or `outdoor` (not worth it in rain), and a `rainNote` when rain or fog changes the
    visit ("Com neblina a cascata some"). The app lists `indoor` and `partly` ones in a "Rainy day"
    tab. Restaurants and cafés get neither.
    **Restaurants: about one per night of the stay** (at least 4), mixing lunch and dinner places,
    price levels and styles; cafés come on top. When the trip has children, each restaurant and
    café that suits them gets `kidFriendly: true`, and `kidsNote` says why or what to know (kids'
    menu, play area, child price, early opening); places that don't suit them say so in `kidsNote`
    without the flag.
14. **Travel time from where you stay** goes in `travelTime` with the mode the user will use
    ("20 min by car", "40 min by train"). Always set it for attractions in another town; set it
    for local ones when it helps (a far-off park, a restaurant across town).
15. **A whole nearby town**: when there's little to do there, propose one attraction for the town
    (name = the town, in the category that fits it, usually "Things to do", with its `town`, and a
    `description` covering what to see and eat); when there's a lot, propose its individual sights,
    each with `town`. Suggest one or the other per town and let the user decide.

## Reservations

16. Link each reservation to its `destination` (where it's used) and, for tickets and restaurant
    bookings, to its `attraction`. It then shows on that destination's and attraction's pages.
17. Lodging has `start` (check-in) and `end` (check-out). Two stays can't cover the same night.
18. Transport (flight, train, bus, transfer) has `from` and `to`. Anything crossing a timezone sets
    `startTimezone`/`endTimezone`. Times are as printed on the ticket, never converted.
19. Open-dated tickets (passes, museum cards) have no `start`.
20. Copy vouchers, e-tickets and boarding passes into `trip/files/` as `<reservation-id>.pdf`. For a
    PDF with a QR code or barcode, also save a PNG `preview` of that page
    (`pdftoppm -png -r 150 -f N -l N in.pdf trip/files/<id>`), so it shows instantly offline.
    Keep each file under ~2 MB.

## Schedule (only when asked)

21. Never create `schedule` unless the user asks for it. It's a suggestion, one entry per day:
    the destination and a few attractions in a sensible order. **No times.**
22. Be realistic: 2–3 main attractions a day plus a meal, grouped by area. Put `must` attractions
    first in the trip's days, respect `closed` days, and keep arrival and departure days light.
    Days with fixed reservations (timed tickets, trains) are planned around them.
23. Use `notes` for what the list can't say: "Afternoon train to Porto", "If it rains, swap for the
    Oceanário".

## Writing

24. Short, plain, useful on the street: "Board at the first stop to get a seat", not tourism copy.
25. Everything the user will read is in `trip.language`. Place names stay in their local form.
26. Money amounts are written as on the document, with currency: `R$ 1.240,00`, `€ 30,00`.
