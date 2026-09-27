// All trip times are wall-clock times at the place. We never convert them for display;
// we only need "what date is it now at a destination" to highlight where you are and today's day.
// Keep offset logic in sync with scripts/validate.mjs.

import { data, trip } from "../data";
import type { Destination } from "../types";

/** Simulated "now" for testing: add ?now=2026-10-10T10:00 to the URL (read as local time at every destination). */
function simulatedNow(): string | null {
  const m = new URLSearchParams(location.search).get("now") ?? sessionStorageGet("now");
  if (m && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(m)) {
    sessionStorageSet("now", m);
    return m;
  }
  return null;
}
function sessionStorageGet(k: string) {
  try { return sessionStorage.getItem(k); } catch { return null; }
}
function sessionStorageSet(k: string, v: string) {
  try { sessionStorage.setItem(k, v); } catch { /* ignore */ }
}

/** Current wall-clock date-time in a timezone, as YYYY-MM-DDTHH:MM. */
export function nowIn(timezone: string = trip.timezone): string {
  const sim = simulatedNow();
  if (sim) return sim;
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export const todayIn = (timezone?: string) => nowIn(timezone).slice(0, 10);

/**
 * The destination you're in right now, by its dates and its own timezone. On a travel day both the
 * old and the new destination match; the later one wins, since that's where you're heading.
 */
export function currentDestination(): Destination | undefined {
  let found: Destination | undefined;
  for (const d of data.destinations) {
    if (!d.from || !d.to) continue;
    const today = todayIn(d.timezone ?? trip.timezone);
    if (d.from <= today && today <= d.to) found = d;
  }
  return found;
}

const lang = trip.language;

export function formatDate(date: string, style: "long" | "short" = "short"): string {
  const d = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang, {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
  }).format(d);
}

/** "Oct 9 – 12", "Oct 30 – Nov 2", or a single day. */
export function formatRange(from: string, to: string): string {
  const f = new Intl.DateTimeFormat(lang, { timeZone: "UTC", day: "numeric", month: "short" });
  const a = new Date(`${from}T12:00:00Z`);
  const b = new Date(`${to}T12:00:00Z`);
  if (from === to) return f.format(a);
  try {
    return f.formatRange(a, b);
  } catch {
    return `${f.format(a)} – ${f.format(b)}`;
  }
}

/** Short zone label like "GMT-3", only when it differs from the trip's own zone. */
export function zoneLabel(tz: string | undefined, atDate: string): string {
  if (!tz || tz === trip.timezone) return "";
  try {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
    const part = f.formatToParts(new Date(`${atDate}T12:00:00Z`)).find((p) => p.type === "timeZoneName");
    return part?.value ?? tz;
  } catch {
    return tz;
  }
}

export const hasTime = (v: string) => v.length > 10;
export const timeOf = (v: string) => v.slice(11, 16);
export const dateOf = (v: string) => v.slice(0, 10);
