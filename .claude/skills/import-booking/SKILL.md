---
name: import-booking
description: Import booking confirmations (PDFs, emails, screenshots in inbox/ or pasted text) into trip/trip.yaml as reservations, places and attachments. Use whenever the user shares a booking, reservation, ticket, voucher or itinerary change.
---

# Import a booking

Sources: files in `inbox/` (or the ones named in $ARGUMENTS), or text the user pasted.
Read PDFs with `pdftotext -layout` first; look at pages as images when layout matters (QR codes,
tables). Follow docs/business-rules.md strictly, especially rules 1 (never invent),
3 (status) and 5 (privacy).

For each booking:

1. **Identify** type, provider, status (confirmed only with a confirmation code or voucher), and all
   times as printed. Note the timezone at each end of anything that crosses zones.
2. **Is it already there?** Match on confirmation code, provider or date. If it exists, update it
   and list exactly what changed (times especially). Don't create duplicates.
3. **Places.** Reuse an existing place when it's the same one. Otherwise add it with `location`
   when the address is precise enough to be sure of it; if not, add `address` only and say so.
4. **Reservation.** Fill in what the document states: confirmation, details (seat, room, baggage,
   pickup point), payment (paid or pay at location, amount as written), cancellation deadline,
   contact phone. Anything the traveler must remember at the counter goes briefly in `notes`.
5. **Attachments.** If the document is what gets shown at a counter or gate (voucher, e-ticket,
   boarding pass), copy it to `trip/files/<reservation-id>.pdf` and generate a PNG `preview` of the
   page with the code (`pdftoppm -png -r 150 -f N -l N ...`). Otherwise don't attach it.
6. **Days.** Add a schedule item referencing the reservation on the right day(s): lodging gets
   check-in and check-out, transport gets departure. If this conflicts with an existing plan, keep
   the booking and tell the user what needs replanning.
7. Leave the source file in `inbox/` (it's never committed). Run `npm run validate`.

Finish with a short summary per booking: what was added or changed, anything the document didn't
say, and any deadline coming up (free cancellation, payment due).
