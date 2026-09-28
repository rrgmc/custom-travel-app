---
name: day-plans
description: Create or rework a destination's day plans in trip/trip.yaml — undated combinations of attractions that go well together for a day or half day, with why. Use when the user asks for an itinerary, day ideas, what to combine, or after research adds attractions.
---

# Day plans

Scope: $ARGUMENTS (destination names or ids; default: every destination). Follow
docs/business-rules.md rules 21–23. There are no dates or times: the travelers pick a plan on the day.

1. **Read first:** the destination's attractions (priority, `town`, `travelTime`, `length`, `rain`,
   `closed`, food places with `kidFriendly`), `trip.travelers`, its reservations (timed tickets are
   fixed points) and any existing plans (keep what still works).
2. **Group by outing:** attractions on the same road or in the same area, reachable in one drive
   (e.g. the Caracol road in Canela; the downtown walk; a nearby town). Each plan: 2–3 main
   attractions plus a place to eat nearby, in a sensible order. Lighter with young children.
3. **Cover:** every `must` in at least one plan, each nearby town, and at least one rainy-day plan
   made of `indoor`/`partly` attractions. Usually 5–10 plans per destination; plans may share
   attractions and don't need to cover the whole list.
4. **Write** each plan with `id`, `destination`, a short `title` ("Caminho do Caracol"), `length`
   (`half-day` or `full-day`), `attractions` in order, and `notes`: one or two lines on why they go
   together and what to check (closed days, webcam/fog, booking, child limits).
5. Run `npm run validate`, fix errors, and list the plans for the user in a compact form (title,
   length, attractions) so they can adjust them in one reply.
