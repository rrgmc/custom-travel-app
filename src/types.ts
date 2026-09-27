// Mirrors trip/trip.schema.json. Update both together.

export type Id = string;
export type LocalDate = string; // YYYY-MM-DD
export type LocalDateTime = string; // YYYY-MM-DD or YYYY-MM-DDTHH:MM, wall-clock time at the place

export interface Trip {
  trip: TripInfo;
  categories: Category[];
  destinations: Destination[];
  attractions: Attraction[];
  reservations: Reservation[];
  schedule?: ScheduleDay[];
}

export interface TripInfo {
  id: string;
  title: string;
  subtitle?: string;
  timezone: string;
  language: "en" | "pt-BR";
  currency?: string;
  accent?: string;
  icon?: string;
}

export interface Category {
  id: Id;
  name: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Destination {
  id: Id;
  name: string;
  country?: string;
  from?: LocalDate;
  to?: LocalDate;
  timezone?: string;
  location?: Location;
  summary?: string;
  tips?: string;
}

export type Priority = "must" | "want" | "maybe";

export interface Attraction {
  id: Id;
  destination: Id;
  category: Id;
  name: string;
  priority: Priority;
  description?: string;
  tips?: string;
  hours?: string;
  closed?: string;
  price?: string;
  duration?: string;
  booking?: string;
  address?: string;
  location?: Location;
  phone?: string;
  url?: string;
}

export type ReservationType =
  | "lodging" | "ticket" | "flight" | "train" | "bus" | "car-rental" | "transfer" | "restaurant" | "other";

export interface Attachment {
  file: string;
  label: string;
  preview?: string;
}

export interface Reservation {
  id: Id;
  type: ReservationType;
  title: string;
  status: "confirmed" | "pending" | "cancelled";
  destination?: Id;
  attraction?: Id;
  start?: LocalDateTime;
  end?: LocalDateTime;
  startTimezone?: string;
  endTimezone?: string;
  from?: string;
  to?: string;
  provider?: string;
  confirmation?: string;
  details?: { label: string; value: string }[];
  payment?: { status: "paid" | "partial" | "at-location" | "unpaid"; amount?: string; notes?: string };
  cancellation?: string;
  contact?: string;
  url?: string;
  address?: string;
  location?: Location;
  attachments?: Attachment[];
  notes?: string;
}

export interface ScheduleDay {
  date: LocalDate;
  destination: Id;
  title?: string;
  attractions?: Id[];
  notes?: string;
}
