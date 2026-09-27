#!/usr/bin/env node
// Validates trip/trip.yaml against the schema and the business rules in docs/business-rules.md.
// Errors break the build. Warnings are things a human should look at before the trip.
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
function toEpoch(localDateTime, tz) {
  const [d, t] = localDateTime.split("T");
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
const dateOf = (ldt) => ldt.slice(0, 10);
function realDate(date) {
  const d = new Date(`${date}T00:00:00Z`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === date;
}

// ---------- semantic checks ----------
const { trip, places, reservations, days, contacts = [] } = data;
const placeIds = new Map();
const resIds = new Map();

// Trip
for (const k of ["start", "end"]) if (!realDate(trip[k])) err(`trip.${k}`, `'${trip[k]}' is not a real date`);
if (trip.end < trip.start) err("trip", `end (${trip.end}) is before start (${trip.start})`);
if (!validTimezone(trip.timezone)) err("trip.timezone", `unknown timezone '${trip.timezone}'`);
const tripDates = [];
for (let d = trip.start; d <= trip.end && tripDates.length < 400; d = addDays(d, 1)) tripDates.push(d);
const inTrip = (d) => d >= trip.start && d <= trip.end;

// Places
places.forEach((p, i) => {
  const where = `places[${i}] '${p.id}'`;
  if (placeIds.has(p.id)) err(where, "duplicate place id");
  placeIds.set(p.id, p);
  if (!p.location && !p.address) warn(where, "no location or address — map button will search by name only");
});

const checkPlace = (where, id, field = "place") => {
  if (id !== undefined && !placeIds.has(id)) err(where, `${field} '${id}' does not exist in places`);
};

// Reservations
reservations.forEach((r, i) => {
  const where = `reservations[${i}] '${r.id}'`;
  if (resIds.has(r.id)) err(where, "duplicate reservation id");
  resIds.set(r.id, r);
  checkPlace(where, r.place);
  checkPlace(where, r.to, "to");

  for (const k of ["startTimezone", "endTimezone"])
    if (r[k] && !validTimezone(r[k])) err(where, `unknown ${k} '${r[k]}'`);
  for (const k of ["start", "end"])
    if (r[k] && !realDate(dateOf(r[k]))) err(where, `${k} '${r[k]}' is not a real date`);

  if (r.end) {
    const s = toEpoch(r.start, r.startTimezone ?? trip.timezone);
    const e = toEpoch(r.end, r.endTimezone ?? r.startTimezone ?? trip.timezone);
    if (e < s) err(where, `ends (${r.end}) before it starts (${r.start})`);
  }
  if (r.type === "lodging" && !r.end) err(where, "lodging needs an end (check-out)");
  if (["flight", "train", "bus", "transfer"].includes(r.type) && !r.to)
    warn(where, "transport without 'to' (arrival place)");

  const startDate = dateOf(r.start);
  if (!inTrip(startDate) && startDate !== addDays(trip.start, -1))
    warn(where, `starts ${startDate}, outside the trip (${trip.start} to ${trip.end})`);

  if (r.status === "pending") warn(where, "still pending — confirm before the trip");
  if (r.status !== "cancelled" && !r.confirmation && ["lodging", "flight", "train", "car-rental"].includes(r.type))
    warn(where, "no confirmation code");

  (r.attachments ?? []).forEach((a, j) => {
    for (const f of [a.file, a.preview].filter(Boolean))
      if (!existsSync(join(tripDir, f))) err(`${where} attachments[${j}]`, `file not found: trip/${f}`);
  });
});

// Lodging: overlaps and gaps (a "night" is identified by the date you check in for it)
const lodging = reservations.filter((r) => r.type === "lodging" && r.status !== "cancelled" && r.end);
const nightOwner = new Map();
for (const r of lodging) {
  for (let n = dateOf(r.start); n < dateOf(r.end); n = addDays(n, 1)) {
    if (nightOwner.has(n)) err(`lodging`, `'${r.id}' and '${nightOwner.get(n).id}' both cover the night of ${n}`);
    else nightOwner.set(n, r);
  }
}
for (const n of tripDates.slice(0, -1)) {
  if (!nightOwner.has(n)) warn("lodging", `no lodging reservation for the night of ${n}`);
}

// Days
const seenDates = new Set();
let prevDate = "";
days.forEach((d, i) => {
  const where = `days[${i}] ${d.date}`;
  if (!realDate(d.date)) err(where, "not a real date");
  if (seenDates.has(d.date)) err(where, "duplicate day");
  seenDates.add(d.date);
  if (!inTrip(d.date)) err(where, `outside the trip (${trip.start} to ${trip.end})`);
  if (d.date < prevDate) err(where, "days are not in date order");
  prevDate = d.date;
  checkPlace(where, d.base, "base");

  const owner = nightOwner.get(d.date);
  if (d.base && owner?.place && owner.place !== d.base)
    warn(where, `base is '${d.base}' but lodging reservation '${owner.id}' is at '${owner.place}'`);

  const checkItems = (items, label) => {
    let prevTime = "";
    items.forEach((it, j) => {
      const w = `${where} ${label}[${j}] '${it.title}'`;
      checkPlace(w, it.place);
      if (it.reservation !== undefined) {
        const r = resIds.get(it.reservation);
        if (!r) err(w, `reservation '${it.reservation}' does not exist`);
        else {
          if (r.status === "cancelled") warn(w, `uses cancelled reservation '${r.id}'`);
          const touches = [dateOf(r.start), r.end && dateOf(r.end)].filter(Boolean);
          if (!touches.includes(d.date)) warn(w, `reservation '${r.id}' is not on ${d.date}`);
        }
      }
      if (it.end && it.time && it.end < it.time) err(w, `end ${it.end} is before time ${it.time}`);
      if (it.time) {
        if (it.time < prevTime) warn(w, `time ${it.time} is out of order`);
        prevTime = it.time;
      }
    });
  };
  checkItems(d.items, "items");
  (d.alternatives ?? []).forEach((a, k) => checkItems(a.items, `alternatives[${k}]`));
});
for (const d of tripDates) if (!seenDates.has(d)) warn("days", `no schedule for ${d}`);

contacts.forEach((c, i) => {
  if (!c.phone && !c.email) warn(`contacts[${i}] '${c.name}'`, "no phone or email");
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
