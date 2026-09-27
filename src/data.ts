import raw from "../trip/trip.yaml";
import type { Trip, Place, Reservation, Day } from "./types";

export const data = raw as unknown as Trip;
export const trip = data.trip;

export const placeById = new Map<string, Place>(data.places.map((p) => [p.id, p]));
export const reservationById = new Map<string, Reservation>(data.reservations.map((r) => [r.id, r]));
export const dayByDate = new Map<string, Day>(data.days.map((d) => [d.date, d]));

/** Reservations sorted by start (wall-clock order is good enough for display). */
export const reservationsSorted = [...data.reservations].sort((a, b) => a.start.localeCompare(b.start));

/** Days (dates) on which a place appears in any plan. */
export function daysForPlace(placeId: string): string[] {
  const out = new Set<string>();
  for (const d of data.days) {
    const all = [...d.items, ...(d.alternatives ?? []).flatMap((a) => a.items)];
    for (const it of all) {
      const r = it.reservation ? reservationById.get(it.reservation) : undefined;
      if (it.place === placeId || r?.place === placeId || r?.to === placeId) out.add(d.date);
    }
    if (d.base === placeId) out.add(d.date);
  }
  return [...out].sort();
}

/** Reservations touching a given date (starting, ending or spanning it). */
export function reservationsOn(date: string): Reservation[] {
  return reservationsSorted.filter((r) => {
    if (r.status === "cancelled") return false;
    const s = r.start.slice(0, 10);
    const e = r.end?.slice(0, 10) ?? s;
    return s === date || e === date;
  });
}

/** Lodging for the night of `date`. */
export function lodgingFor(date: string): Reservation | undefined {
  return data.reservations.find(
    (r) => r.type === "lodging" && r.status !== "cancelled" && r.end && r.start.slice(0, 10) <= date && r.end.slice(0, 10) > date,
  );
}
