// Tiny inline icon set (no network, no icon font).
const paths: Record<string, string> = {
  destinations: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 2.5a7 7 0 0 1 7 7C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  reservations: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7ZM14 5v12",
  umbrella: "M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9ZM12 3v1M12 12v6.5a2 2 0 0 1-4 0",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  kids: "M9 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 21v-6l-1-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2l-1 4v6M14.5 21v-4l-.5-3a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5l-.5 3v4",
  chat: "M4 5h16v11H9l-5 4V5ZM8 9h8M8 12h5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z",
  lodging: "M3 19V8M3 14h18v5M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01",
  flight: "M3 15l7-2.5V6.5a2 2 0 0 1 4 0v6L21 15v2l-7-1.5V19l2 1.5V22l-4-1-4 1v-1.5l2-1.5v-3.5L3 17v-2Z",
  train: "M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM5 11h14M9 15h.01M15 15h.01M8 18l-2 3M16 18l2 3",
  car: "M5 17h14M5 17v2M19 17v2M4 17v-4l2-5a2 2 0 0 1 2-1.5h8A2 2 0 0 1 18 8l2 5v4M4 13h16M7.5 15h.01M16.5 15h.01",
  food: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 0-4 2-4 6v4h4",
  ticket: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7Z",
  copy: "M9 9h10v11H9zM5 15H4V4h11v1",
  check: "M5 12.5 10 17 19 7",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a4 4 0 0 1 4-4h2M18 9v6a4 4 0 0 1-4 4h-2",
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  file: "M6 3h8l4 4v14H6zM14 3v4h4",
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
};

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] ?? paths.ticket} />
    </svg>
  );
}

export const reservationIcon = (type: string) =>
  ({ lodging: "lodging", flight: "flight", train: "train", bus: "car", "car-rental": "car", transfer: "car", restaurant: "food" } as Record<string, string>)[type] ?? "ticket";
