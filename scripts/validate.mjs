#!/usr/bin/env node
// Validates trip/trip.yaml against the schema and the business rules in docs/business-rules.md.
// Errors break the build. Warnings are things a human should look at.
//
// Usage: node scripts/validate.mjs [path/to/trip.yaml]

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tripPath = resolve(process.argv[2] ?? join(root, "trip/trip.yaml"));
const tripDir = dirname(tripPath);
const schema = JSON.parse(readFileSync(join(root, "trip/trip.schema.json"), "utf8"));

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ---------- parse ----------
let data;
try {
  const doc = YAML.parseDocument(readFileSync(tripPath, "utf8"), { uniqueKeys: true });
  if (doc.errors.length) {
    for (const e of doc.errors) err("yaml", e.message);
    report();
  }
  data = doc.toJS();
} catch (e) {
  err("yaml", e.message);
  report();
}

// ---------- schema ----------
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
if (!ajv.validate(schema, data)) {
  for (const e of ajv.errors) {
    const extra = e.params?.additionalProperty ? ` ('${e.params.additionalProperty}')` : "";
    err(`schema ${e.instancePath || "/"}`, `${e.message}${extra}`);
  }
  report(); // semantic checks assume a structurally valid file
}

// ---------- time helpers (keep in sync with src/lib/time.ts) ----------
function validTimezone(tz) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
function offsetMinutes(epochMs, tz) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(new Date(epochMs)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUtc - Math.floor(epochMs / 1000) * 1000) / 60000;
}
/** Epoch for a wall-clock date or date-time in a zone (a bare date counts as 00:00). */
function toEpoch(dateOrDateTime, tz) {
  const [d, t = "00:00"] = dateOrDateTime.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, day, h, min);
  let epoch = guess - offsetMinutes(guess, tz) * 60000;
  epoch = guess - offsetMinutes(epoch, tz) * 60000; // second pass for DST edges
  return epoch;
}
const addDays = (date, n) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const dateOf = (v) => v.slice(0, 10);
function realDate(date) {
  const d = new Date(`${date}T00:00:00Z`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === date;
}

// ---------- semantic checks ----------
const { trip, categories, destinations, attractions, reservations, schedule = [] } = data;

/** Indexes a list by id, reporting duplicates. */
function index(list, label) {
  const map = new Map();
  list.forEach((x, i) => {
    if (map.has(x.id)) err(`${label}[${i}] '${x.id}'`, `duplicate ${label} id`);
    map.set(x.id, x);
  });
  return map;
}
const categoryById = index(categories, "categories");
// The destination page uses these as tab names next to the category tabs.
for (const reserved of ["booked", "about"])
  if (categoryById.has(reserved)) err(`categories '${reserved}'`, "this id is reserved; use another one");
const destById = index(destinations, "destinations");
const attrById = index(attractions, "attractions");
const resById = index(reservations, "reservations");

const checkRef = (where, map, id, field) => {
  if (id !== undefined && !map.has(id)) err(where, `${field} '${id}' does not exist`);
};

// Trip
if (!validTimezone(trip.timezone)) err("trip.timezone", `unknown timezone '${trip.timezone}'`);

// Destinations
let prev;
destinations.forEach((d, i) => {
  const where = `destinations[${i}] '${d.id}'`;
  if (d.timezone && !validTimezone(d.timezone)) err(where, `unknown timezone '${d.timezone}'`);
  if (!d.from) return;
  for (const k of ["from", "to"]) if (!realDate(d[k])) err(where, `${k} '${d[k]}' is not a real date`);
  if (d.to < d.from) err(where, `to (${d.to}) is before from (${d.from})`);
  // Travel days are shared (one ends the day the next starts), so only a longer overlap is suspicious.
  if (prev && d.from < prev.to) warn(where, `dates overlap '${prev.id}' (${prev.from} to ${prev.to}); destinations should be in travel order`);
  prev = d;
});

// Attractions
const usedCategories = new Set();
const attractionsPerDest = new Map();
attractions.forEach((a, i) => {
  const where = `attractions[${i}] '${a.id}'`;
  checkRef(where, destById, a.destination, "destination");
  checkRef(where, categoryById, a.category, "category");
  usedCategories.add(a.category);
  attractionsPerDest.set(a.destination, (attractionsPerDest.get(a.destination) ?? 0) + 1);
  if (!a.location && !a.address)
    warn(where, "no location or address — the map button will search by name only");
});
for (const c of categories) if (!usedCategories.has(c.id)) warn(`categories '${c.id}'`, "not used by any attraction");
for (const d of destinations) if (!attractionsPerDest.get(d.id)) warn(`destinations '${d.id}'`, "has no attractions yet");

// Reservations
reservations.forEach((r, i) => {
  const where = `reservations[${i}] '${r.id}'`;
  checkRef(where, destById, r.destination, "destination");
  checkRef(where, attrById, r.attraction, "attraction");
  const a = r.attraction && attrById.get(r.attraction);
  if (a && r.destination && a.destination !== r.destination)
    warn(where, `destination is '${r.destination}' but attraction '${a.id}' is in '${a.destination}'`);
  if (!r.destination && !a) warn(where, "no destination — it will only appear under Reservations");

  for (const k of ["startTimezone", "endTimezone"])
    if (r[k] && !validTimezone(r[k])) err(where, `unknown ${k} '${r[k]}'`);
  for (const k of ["start", "end"])
    if (r[k] && !realDate(dateOf(r[k]))) err(where, `${k} '${r[k]}' is not a real date`);
  if (r.end && !r.start) err(where, "has an end but no start");

  if (r.start && r.end) {
    const zone = (a && destById.get(a.destination)?.timezone) ?? destById.get(r.destination)?.timezone ?? trip.timezone;
    const s = toEpoch(r.start, r.startTimezone ?? zone);
    const e = toEpoch(r.end, r.endTimezone ?? r.startTimezone ?? zone);
    if (e < s) err(where, `ends (${r.end}) before it starts (${r.start})`);
  }
  if (r.type === "lodging" && !(r.start && r.end)) err(where, "lodging needs start (check-in) and end (check-out)");
  if (["flight", "train", "bus", "transfer"].includes(r.type) && !(r.from && r.to))
    warn(where, "transport without 'from' and 'to'");

  (r.attachments ?? []).forEach((att, j) => {
    for (const f of [att.file, att.preview].filter(Boolean))
      if (!existsSync(join(tripDir, f))) err(`${where} attachments[${j}]`, `file not found: trip/${f}`);
  });
});

// Lodging: two stays can't cover the same night (a night is the date you check in for it)
const nightOwner = new Map();
for (const r of reservations.filter((r) => r.type === "lodging" && r.status !== "cancelled" && r.start && r.end)) {
  for (let n = dateOf(r.start); n < dateOf(r.end); n = addDays(n, 1)) {
    if (nightOwner.has(n)) err("lodging", `'${r.id}' and '${nightOwner.get(n).id}' both cover the night of ${n}`);
    else nightOwner.set(n, r);
  }
}

// A destination is a place you stay: a dated one should have its lodging booked.
for (const d of destinations) {
  if (!d.from) continue;
  const stays = reservations.some((r) => r.type === "lodging" && r.status !== "cancelled" && r.destination === d.id);
  if (!stays) warn(`destinations '${d.id}'`, "no stay booked (lodging reservation with this destination)");
}

// Schedule (optional)
let prevDate = "";
const seenDates = new Set();
schedule.forEach((day, i) => {
  const where = `schedule[${i}] ${day.date}`;
  if (!realDate(day.date)) err(where, "not a real date");
  if (seenDates.has(day.date)) err(where, "duplicate day");
  seenDates.add(day.date);
  if (day.date < prevDate) err(where, "days are not in date order");
  prevDate = day.date;
  checkRef(where, destById, day.destination, "destination");
  const dest = destById.get(day.destination);
  if (dest?.from && (day.date < dest.from || day.date > dest.to))
    warn(where, `'${dest.id}' is dated ${dest.from} to ${dest.to}`);
  (day.attractions ?? []).forEach((id) => {
    const a = attrById.get(id);
    if (!a) err(where, `attraction '${id}' does not exist`);
    else if (a.destination !== day.destination) warn(where, `attraction '${id}' is in '${a.destination}', not '${day.destination}'`);
  });
});

report();

function report() {
  const rel = tripPath.replace(root + "/", "");
  for (const w of warnings) console.log(`\x1b[33mwarning\x1b[0m ${w}`);
  for (const e of errors) console.log(`\x1b[31merror\x1b[0m   ${e}`);
  if (errors.length) {
    console.log(`\n${rel}: ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  }
  console.log(`\n${rel}: OK (${warnings.length} warning(s))`);
  process.exit(0);
}
