// All trip times are wall-clock times at the place. We never convert them for display;
// we only need "what date/time is it now at the destination" to highlight today and the next item.
// Keep offset logic in sync with scripts/validate.mjs.

import { trip } from "../data";

/** Simulated "now" for testing: add ?now=2026-10-10T10:00 to the URL (interpreted in the trip timezone). */
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

/** Current wall-clock date-time at the destination, as YYYY-MM-DDTHH:MM. */
export function nowAtDestination(): string {
  const sim = simulatedNow();
  if (sim) return sim;
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: trip.timezone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

export function tripDates(): string[] {
  const out: string[] = [];
  for (let d = trip.start; d <= trip.end; d = addDays(d, 1)) out.push(d);
  return out;
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

export const timeOf = (ldt: string) => ldt.slice(11, 16);
export const dateOf = (ldt: string) => ldt.slice(0, 10);
