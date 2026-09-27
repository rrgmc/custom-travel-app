# Business rules

These govern what goes into a trip and how days are planned. `scripts/validate.mjs` enforces the
mechanical ones; the rest are judgment calls Claude is expected to follow.

## Truth and sources

1. **Never invent booking facts.** Confirmation codes, prices, times, seats, addresses and names on a
   reservation come only from the user or from their documents. If something is missing, leave the
   field out and tell the user. Never fill in a plausible-looking value.
2. **Researched facts are labeled.** Opening hours, prices and tips found on the web go in `hours`,
   `price` or `notes` with the month they were checked, for example `09:00–18:00 (checked Sep 2026)`.
   Ask before adding researched places the user didn't request.
3. **Keep status honest.** A booking is `confirmed` only when there is a confirmation (code, email or
   voucher). Requests waiting for an answer are `pending`. Cancelled bookings stay in the file with
   `status: cancelled` rather than being deleted, so nobody wonders later whether it was cancelled.
4. When a new document contradicts the file (changed time, new room), update the data and tell the
   user what changed. Flight schedule changes are common; always point them out.

## Privacy

5. The trip repo must be **private**. Even so, store only what's needed at a counter: confirmation
   codes, booking names, seats. Never store passport or ID numbers, full card numbers, CVVs,
   passwords or login links with tokens. Replace them with a note like "passport — see physical copy".
6. Raw emails and PDFs stay in `inbox/` (never committed). Only the voucher itself is copied to
   `trip/files/` when it will be shown at a counter or gate.

## Attachments

7. Copy vouchers, e-tickets and boarding passes into `trip/files/` with clear names:
   `<reservation-id>.pdf`, `<reservation-id>-2.pdf`.
8. For every PDF with a QR code or barcode, also save a PNG preview of that page as `preview`
   (`pdftoppm -png -r 150 -f N -l N in.pdf trip/files/<id>`), so it shows instantly offline without
   opening another app. Keep each file under ~2 MB.

## Lodging and transport

9. Every night of the trip should be covered by exactly one lodging reservation. Overlaps are errors;
   gaps are warnings the user must acknowledge (e.g. staying with family, overnight train).
10. A day's `base` is where you sleep that night and must match the lodging reservation.
11. Transport reservations (flight, train, bus, transfer) have `place` (departure) and `to` (arrival).
    Flights and anything crossing a timezone set `startTimezone`/`endTimezone`.

## Planning days

12. **Be realistic.** At most 2–3 main activities per day, plus meals. Include travel time between
    places (look at the distances) and a buffer of at least 30 minutes around fixed-time bookings.
13. **Respect opening hours and closed days.** Don't schedule a museum on its closing day. If you're
    not sure of hours, say so in `notes` rather than guessing.
14. **Arrival and departure days are light.** After a long flight, nothing demanding. On departure
    days plan backwards from the flight: international flights, be at the airport 3 hours before;
    domestic, 2 hours; check-out time from the lodging reservation.
15. **Outdoor days get a rain plan.** Beaches, hikes, viewpoints and open-air tours get an
    `alternatives` entry with `when: If it rains` (in the trip language).
16. Nice-to-have activities are `optional: true`. Places worth visiting but not yet scheduled are
    `wishlist: true` in `places`.
17. With children, older people or anyone with specific needs among `travelers`, adapt pace and
    distances accordingly and mention the constraint in the day's `notes` when it shaped the plan.
18. Link rather than repeat: a schedule item that corresponds to a booking uses `reservation:`;
    one at a known place uses `place:`. Don't duplicate addresses or codes in `notes`.

## Writing

19. Short, plain, useful on the street: "Board at the first stop to get a seat", not tourism copy.
20. Everything the user will read is in `trip.language`. Place names stay in their local form.
21. Money amounts are written as on the document, with currency: `R$ 1.240,00`, `€ 30,00`.
