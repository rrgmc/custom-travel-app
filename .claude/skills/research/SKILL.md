---
name: research
description: Research attractions, restaurants and other things worth doing at one or more destinations of the trip, add the recommended ones to trip/trip.yaml with details, and let the user trim the list. Use when the user asks what to do, see or eat somewhere, or wants a destination filled in.
---

# Research a destination

Scope: $ARGUMENTS (destination names or ids; default: destinations with no attractions yet).
A destination is a place the user stays; nearby towns they visit from there are researched as part
of it (rule 7). Do one destination at a time. Follow docs/business-rules.md, especially rules 2 and 9–15.

1. **Read first:** the destination's entry, its existing attractions (don't propose duplicates),
   the trip's `categories`, and its reservations (booked tickets are already decided).
2. **Ask once, briefly, only if unknown:** interests (history, food, nature, nightlife…), pace,
   who's traveling (kids? mobility?), budget level, how they get around (car, public transport,
   tours) and which nearby towns they plan to visit. Skip what the conversation already answered.
3. **Research** on the web. For each category, gather candidates worth the user's time, favoring
   variety over quantity: roughly 5–10 things to do and 3–6 places to eat per city, fewer for
   small places.
4. **Choose** what to recommend (rule 9): an honest priority for each (must / if there's time /
   maybe); for each nearby town, one day-trip entry or its individual sights (rule 15); new
   categories if the destination calls for them (e.g. Beaches, Day trips). If the user asked to
   review first ($ARGUMENTS or the conversation), show a compact numbered list and add only what
   they keep; accept answers like "all but 4 and 7" or "only the musts".
5. **Add them** to `attractions` with `destination`, `category`, `priority`, a short
   `description`, and what's known and useful: `tips`, `hours`, `closed`, `price`, `duration`,
   `booking`, `town` and `travelTime` (rule 14), `location` (coordinates you're sure of; otherwise
   `address`), `url`. Researched facts carry "(checked <Month Year>)". Add any new categories to
   `categories`.
6. Keep attractions of the same destination together in the file, grouped by category.
7. Run `npm run validate`, fix errors, and give the user a compact numbered summary per category
   (name, priority, town and travel time) so they can trim it in one reply. Also say what you
   weren't sure of (hours you couldn't confirm, places that need booking ahead, seasonal closures
   around the trip dates).
