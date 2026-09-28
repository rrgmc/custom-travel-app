import raw from "../trip/trip.yaml";
import type { Trip, Attraction, Category, Destination, Priority, Reservation, ReservationType, ScheduleDay } from "./types";

export const data = raw as unknown as Trip;
export const trip = data.trip;
export const schedule: ScheduleDay[] = data.schedule ?? [];

export const categoryById = new Map<string, Category>(data.categories.map((c) => [c.id, c]));
export const destinationById = new Map<string, Destination>(data.destinations.map((d) => [d.id, d]));
export const attractionById = new Map<string, Attraction>(data.attractions.map((a) => [a.id, a]));
export const reservationById = new Map<string, Reservation>(data.reservations.map((r) => [r.id, r]));

/** The only destination, when the trip has just one place to stay: the app then opens on its page. */
export const singleDestination: Destination | undefined = data.destinations.length === 1 ? data.destinations[0] : undefined;

const PRIORITY_ORDER: Priority[] = ["must", "want", "maybe"];

/** A destination's attractions grouped by category (trip order), must-see first within each group. */
export function attractionsByCategory(destinationId: string): { category: Category; items: Attraction[] }[] {
  const mine = data.attractions.filter((a) => a.destination === destinationId);
  return data.categories
    .map((category) => ({
      category,
      items: mine
        .filter((a) => a.category === category.id)
        .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)),
    }))
    .filter((g) => g.items.length > 0);
}

/** What still works in rain at a destination: covered first, then partly covered; by priority within each. */
export const rainyDayAttractions = (destinationId: string): Attraction[] =>
  data.attractions
    .filter((a) => a.destination === destinationId && (a.rain === "indoor" || a.rain === "partly"))
    .sort((a, b) =>
      (a.rain === b.rain ? 0 : a.rain === "indoor" ? -1 : 1) ||
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));

export const attractionCount = (destinationId: string) =>
  data.attractions.filter((a) => a.destination === destinationId).length;

/** Dated reservations first, in time order; open-dated ones after, in file order. */
const byStart = (a: Reservation, b: Reservation) =>
  a.start && b.start ? a.start.localeCompare(b.start) : a.start ? -1 : b.start ? 1 : 0;

/** The destination a reservation belongs to: its own, or its attraction's. */
export const destinationOf = (r: Reservation) =>
  r.destination ?? (r.attraction ? attractionById.get(r.attraction)?.destination : undefined);

export const reservationsFor = (destinationId: string) =>
  data.reservations.filter((r) => r.status !== "cancelled" && destinationOf(r) === destinationId).sort(byStart);

export const reservationsForAttraction = (attractionId: string) =>
  data.reservations.filter((r) => r.attraction === attractionId).sort(byStart);

/** Reservations starting or ending on a date. */
export const reservationsOn = (date: string) =>
  data.reservations
    .filter((r) => r.status !== "cancelled" && (r.start?.slice(0, 10) === date || r.end?.slice(0, 10) === date))
    .sort(byStart);

export type ReservationGroup = "stays" | "tickets" | "transport" | "other";
const GROUP: Record<ReservationType, ReservationGroup> = {
  lodging: "stays", ticket: "tickets",
  flight: "transport", train: "transport", bus: "transport", "car-rental": "transport", transfer: "transport",
  restaurant: "other", other: "other",
};
export const RESERVATION_GROUPS: ReservationGroup[] = ["stays", "tickets", "transport", "other"];
export const reservationsInGroup = (g: ReservationGroup) =>
  data.reservations.filter((r) => r.status !== "cancelled" && GROUP[r.type] === g).sort(byStart);

/** Schedule days that include an attraction. */
export const scheduleDaysFor = (attractionId: string) =>
  schedule.filter((d) => d.attractions?.includes(attractionId));
