---
name: research
description: Research attractions, restaurants and other things worth doing at one or more destinations of the trip, add the recommended ones to trip/trip.yaml with details, and let the user trim the list. Use when the user asks what to do, see or eat somewhere, or wants a destination filled in.
---

# Research a destination

Scope: $ARGUMENTS (destination names or ids; default: destinations with no attractions yet).
A destination is a place the user stays; nearby towns they visit from there are researched as part
of it (rule 7). Do one destination at a time. Follow docs/business-rules.md, especially rules 2 and 9–15.

1. **Read first:** `trip.travelers` (children's ages shape priorities, prices and tips, rules 11–12)
   and `trip.preferences` (what to avoid or favor, rule 11),
   the destination's entry, its existing attractions (don't propose duplicates),
   the trip's `categories`, and its reservations (booked tickets are already decided).
2. **Ask once, briefly, only if unknown:** interests (history, food, nature, nightlife…), pace,
   who's traveling if `trip.travelers` is missing (kids' ages? mobility?), budget level, how they get around (car, public transport,
   tours) and which nearby towns they plan to visit. Skip what the conversation already answered.
3. **Research** on the web. For each category, gather candidates worth the user's time, favoring
   variety: every good thing to do the place offers (at least two per day of the stay; rule 9), about one restaurant per night (at least 4; rule 13) and a few cafés.
   Include the well-known, popular attractions even when they seem off-profile (as `maybe`).
   Check that each place is **still operating** under that name: restaurants and parks close,
   move or get replaced (look for a recent review, post or official page from the last months).
4. **Choose** what to recommend (rule 9): an honest priority for each (must / if there's time /
   maybe); for each nearby town, one day-trip entry or its individual sights (rule 15); new
   categories if the destination calls for them (e.g. Beaches, Wineries; not a separate "Day trips" category: whole-town entries go in the
   category that fits them). If the user asked to
   review first ($ARGUMENTS or the conversation), show a compact numbered list and add only what
   they keep; accept answers like "all but 4 and 7" or "only the musts".
5. **Add them** to `attractions` with `destination`, `category`, `priority`, a short
   `description`, `length` and `rain` (rule 13; not for restaurants and cafés), and what's known
   and useful: `rainNote`, `kidFriendly` and `kidsNote` (restaurants and cafés, with children),
   `tips`, `hours`, `closed`, `price`, `duration`,
   `booking`, `town` and `travelTime` (rule 14), `location` (coordinates you're sure of; otherwise
   `address`), `url`. Researched facts carry "(checked <Month Year>)". Add any new categories to
   `categories`.
6. Keep attractions of the same destination together in the file, grouped by category.
   Then build the destination's **day plans** (rules 21–22; the day-plans skill has the details).
7. Run `npm run validate`, fix errors, and give the user a compact numbered summary per category
   (name, priority, town and travel time) and the day plans, so they can trim it in one reply. Also say what you
   weren't sure of (hours you couldn't confirm, places that need booking ahead, seasonal closures
   around the trip dates).
