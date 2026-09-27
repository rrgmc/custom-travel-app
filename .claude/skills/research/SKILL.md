---
name: research
description: Research attractions, restaurants and other things worth doing at one or more destinations of the trip, propose them for the user to pick, then add the chosen ones to trip/trip.yaml with details. Use when the user asks what to do, see or eat somewhere, or wants a destination filled in.
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
4. **Propose, don't add.** Show a compact numbered list grouped by category: name, one line on why,
   suggested priority (must / if there's time / maybe), and for other towns the town and travel
   time. For each nearby town, say whether you suggest one day-trip entry or its individual
   sights (rule 15). Suggest new categories if the destination calls for them (e.g. Beaches,
   Day trips). Ask which to keep; accept answers like "all but 4 and 7" or
   "only the musts".
5. **Add the chosen ones** to `attractions` with `destination`, `category`, `priority`, a short
   `description`, and what's known and useful: `tips`, `hours`, `closed`, `price`, `duration`,
   `booking`, `town` and `travelTime` (rule 14), `location` (coordinates you're sure of; otherwise
   `address`), `url`. Researched facts carry "(checked <Month Year>)". Add new categories to `categories` if the user agreed.
6. Keep attractions of the same destination together in the file, grouped by category.
7. Run `npm run validate`, fix errors, and tell the user what you weren't sure of (hours you couldn't
   confirm, places that need booking ahead, seasonal closures around the trip dates).
