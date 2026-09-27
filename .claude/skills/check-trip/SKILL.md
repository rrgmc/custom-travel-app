---
name: check-trip
description: Full pre-trip review of trip/trip.yaml — validator results, uncovered nights, pending or unpaid bookings, cancellation deadlines, missing vouchers and tight schedules. Use when the user asks whether everything is ready, or before building a release.
---

# Check the trip

1. Run `npm run validate`. Fix mechanical errors; ask about the rest.
2. Review beyond the validator, relative to today's date:
   - pending or unpaid bookings, and payments due at the location (how much, which currency)
   - free-cancellation deadlines in the next 14 days
   - nights without lodging, days without a plan, outdoor days without a rain plan
   - tight connections: less than the airport margins in rule 14, or under 30 minutes between
     fixed-time items
   - cross-timezone transport missing `startTimezone`/`endTimezone`; places without `location`
   - vouchers with QR codes or barcodes that have no `preview` image
   - privacy: anything that looks like a document number, card number or password (rule 5)
3. Report a short checklist in three groups — **Fix now**, **Before you leave**, **FYI** — each
   item naming the date and the reservation or day it concerns. Offer to fix what you can.
