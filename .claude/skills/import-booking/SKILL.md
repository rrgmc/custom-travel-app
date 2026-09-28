---
name: import-booking
description: Import booking confirmations (PDFs, emails, screenshots in inbox/ or pasted text) into trip/trip.yaml as reservations and attachments. Use whenever the user shares a booking, reservation, ticket, voucher or itinerary change.
---

# Import a booking

Sources: files in `inbox/` (or the ones named in $ARGUMENTS), or text the user pasted.
Read PDFs with `pdftotext -layout` first; look at pages as images when layout matters (QR codes,
tables). Follow docs/business-rules.md strictly, especially rules 1 (never invent),
3 (status), 5 (privacy) and 16–20 (reservations).

For each booking:

1. **Identify** type, provider, status (confirmed only with a confirmation code or voucher), and all
   times as printed. Note the timezone at each end of anything that crosses zones.
2. **Is it already there?** Match on confirmation code, provider or date. If it exists, update it
   and list exactly what changed (times especially). Don't create duplicates.
3. **Link it.** Set `destination` to where it's used (a flight or train: the arrival destination).
   For tickets and restaurant bookings, set `attraction` when it matches one; if the attraction
   isn't in the file yet, add it (same destination, a fitting category, priority `must` since it's
   booked) with what the document says. If the destination isn't in the trip, ask before adding it.
4. **Reservation.** Fill in what the document states: confirmation, details (seat, room, baggage,
   pickup point), payment (paid or pay at location, amount as written), cancellation deadline,
   contact phone, and for lodging the `address` (plus `location` when you're sure of it). Transport
   gets `from`/`to`. Anything the traveler must remember at the counter goes briefly in `notes`.
5. **Attachments.** If the document is what gets shown at a counter or gate (voucher, e-ticket,
   boarding pass), copy it to `trip/files/<reservation-id>.pdf` and generate a PNG `preview` of the
   page with the code (`pdftoppm -png -r 150 -f N -l N ...`). Otherwise don't attach it.
6. **Dates.** If the booking contradicts a destination's dates (a hotel in Porto from the 13th but
   Porto starts on the 14th), point it out and offer to adjust the destination dates. If a timed
   booking changes what goes together, update the affected day plans (rule 23).
7. Leave the source file in `inbox/` (it's never committed). Run `npm run validate`.

Finish with a short summary per booking: what was added or changed, anything the document didn't
say, and any deadline coming up (free cancellation, payment due).
