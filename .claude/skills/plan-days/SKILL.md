---
name: plan-days
description: Build or rework the daily schedules (days[].items and alternatives) in trip/trip.yaml following the planning rules. Use when the user asks for an itinerary, a day plan, ideas for a day, or to move things around.
---

# Plan days

Scope: $ARGUMENTS (specific dates or "all"; default: every day that has no items yet).

1. **Read before planning:** all reservations (the fixed points), lodging per night (`base`),
   places already in the file (including `wishlist`), travelers (kids? mobility?), existing notes.
2. **Ask once, briefly, only if unknown:** interests and pace (packed or relaxed), budget level,
   whether they'll have a car. Skip anything already answered in the conversation or trip.yaml.
3. **Plan by rules 12–18** in docs/business-rules.md: a realistic amount per day, travel time,
   buffers around bookings, opening hours and closed days, light arrival and departure days, rain
   plans for outdoor days, optional items, and links to places/reservations instead of repeated
   details. Group nearby places on the same day.
4. **New places:** research them (hours, price, closed days) and add them to `places` with
   `location` and the "checked <month>" label. When suggesting more than a few new places, list
   them and let the user choose before adding.
5. For a large change, show a compact day-by-day summary in chat **before** writing it.
   Small edits can be made directly.
6. Write to trip.yaml, run `npm run validate`, fix errors, and mention what you weren't sure of
   (hours you couldn't confirm, long transfers, tight connections).
