---
name: suggest-schedule
description: Create or rework the optional day-by-day schedule in trip/trip.yaml — each day's destination and a few attractions, no times. Only when the user asks for a schedule, itinerary or day plan.
---

# Suggest a schedule

Scope: $ARGUMENTS (specific dates, a destination, or "all"; default: the whole trip).
Only run when the user asked for a schedule (docs/business-rules.md rule 21). Follow rules 21–23.

1. **Read before planning:** destinations and their dates (the days of the trip come from them; if
   destinations have no dates, ask for the trip dates and how many days per destination), every
   attraction with its priority and `closed` days, and all reservations — timed tickets, trains and
   check-in/out are fixed points.
2. **Ask once, briefly, only if unknown:** pace (relaxed or full days), whether there's a car.
   With young children (`trip.travelers`), plan fewer and shorter stops, a rest or playground
   break, and early dinners.
3. The attraction list is meant to hold more than fits (rule 9): the schedule uses a subset. Leave the
   rest out rather than cramming days.
4. **Plan each day:** its `destination`, a short `title`, and 2–3 main `attractions` plus a place
   to eat, in a sensible order and grouped by area. Put `must` attractions early in the stay (so bad
   weather doesn't cost them), respect closed days, keep arrival and departure days light, and
   build days with timed tickets around them. A day out to a nearby town keeps the place you stay
   as `destination` and groups that town's attractions (`town`), with the drive in `notes`. Use
   `notes` for travel between destinations and weather swaps. **No times.**
5. For a whole-trip schedule or a big change, show a compact day-by-day summary in chat **before**
   writing it. Small edits can be made directly.
6. Write `schedule` in date order (one entry per day), run `npm run validate`, fix errors, and point
   out anything left out (must-sees that didn't fit, closed days you worked around).
