// Mirrors trip/trip.schema.json. Update both together.

export type Id = string;
export type LocalDate = string; // YYYY-MM-DD
export type LocalTime = string; // HH:MM
export type LocalDateTime = string; // YYYY-MM-DDTHH:MM, wall-clock time at the place

export interface Trip {
  trip: TripInfo;
  places: Place[];
  reservations: Reservation[];
  days: Day[];
  contacts?: Contact[];
  info?: InfoSection[];
}

export interface TripInfo {
  id: string;
  title: string;
  subtitle?: string;
  start: LocalDate;
  end: LocalDate;
  timezone: string;
  language: "en" | "pt-BR";
  currency?: string;
  travelers?: { name: string; notes?: string }[];
  accent?: string;
  icon?: string;
}

export type PlaceKind = "lodging" | "attraction" | "restaurant" | "transport" | "shopping" | "service" | "other";

export interface Place {
  id: Id;
  name: string;
  kind: PlaceKind;
  city?: string;
  address?: string;
  location?: { lat: number; lng: number };
  hours?: string;
  phone?: string;
  url?: string;
  price?: string;
  notes?: string;
  tags?: string[];
  wishlist?: boolean;
}

export type ReservationType =
  | "lodging" | "flight" | "train" | "bus" | "car-rental" | "transfer"
  | "restaurant" | "activity" | "ticket" | "other";

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
  place?: Id;
  to?: Id;
  start: LocalDateTime;
  end?: LocalDateTime;
  startTimezone?: string;
  endTimezone?: string;
  provider?: string;
  confirmation?: string;
  details?: { label: string; value: string }[];
  payment?: { status: "paid" | "partial" | "at-location" | "unpaid"; amount?: string; notes?: string };
  cancellation?: string;
  contact?: string;
  url?: string;
  attachments?: Attachment[];
  notes?: string;
}

export interface ScheduleItem {
  time?: LocalTime;
  end?: LocalTime;
  title: string;
  place?: Id;
  reservation?: Id;
  notes?: string;
  optional?: boolean;
}

export interface Day {
  date: LocalDate;
  title?: string;
  base?: Id;
  notes?: string;
  items: ScheduleItem[];
  alternatives?: { title: string; when?: string; items: ScheduleItem[] }[];
}

export interface Contact {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface InfoSection {
  title: string;
  body: string;
}
