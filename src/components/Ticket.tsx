import { useState } from "react";
import type { Reservation } from "../types";
import { attractionById } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { copyText } from "../lib/native";
import { dateOf, formatDate, hasTime, timeOf, zoneLabel } from "../lib/time";
import { Icon, reservationIcon } from "./Icon";

const TRANSPORT = ["flight", "train", "bus", "transfer"];

export function labelsFor(r: Reservation): [string, string] {
  if (r.type === "lodging") return [t.checkIn, t.checkOut];
  if (TRANSPORT.includes(r.type)) return [t.departs, t.arrives];
  return [t.starts, t.ends];
}

/** The line under a reservation's title: route for transport, else the attraction or provider. */
function subtitleOf(r: Reservation): string {
  if (r.from && r.to) return `${r.from} → ${r.to}`;
  const a = r.attraction ? attractionById.get(r.attraction) : undefined;
  return a?.name ?? r.provider ?? "";
}

/** "Sat, Oct 10 · 09:30" or "Sat, Oct 10". */
export function whenText(v: string): string {
  return hasTime(v) ? `${formatDate(dateOf(v))} · ${timeOf(v)}` : formatDate(dateOf(v));
}

function When({ v, tz, label }: { v: string; tz?: string; label: string }) {
  const z = hasTime(v) ? zoneLabel(tz, dateOf(v)) : "";
  return (
    <div className="when">
      <span className="when-label">{label}</span>
      {hasTime(v) ? (
        <>
          <span className="when-time">{timeOf(v)}{z && <small> {z}</small>}</span>
          <span className="when-date">{formatDate(dateOf(v))}</span>
        </>
      ) : (
        <span className="when-time when-day">{formatDate(dateOf(v))}</span>
      )}
    </div>
  );
}

export function CopyCode({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="code"
      aria-label={`${t.copy} ${code}`}
      onClick={async (e) => {
        e.preventDefault();
        await copyText(code);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      <span className="code-value">{code}</span>
      <span className="code-hint">
        <Icon name={done ? "check" : "copy"} size={16} /> {done ? t.copied : t.copy}
      </span>
    </button>
  );
}

function StatusPill({ r }: { r: Reservation }) {
  return r.status !== "confirmed" ? <span className={`pill pill-${r.status}`}>{t.status[r.status]}</span> : null;
}

/** A reservation drawn as a ticket stub. The whole upper part links to the reservation detail. */
export function Ticket({ r, linked = true }: { r: Reservation; linked?: boolean }) {
  const [a, b] = labelsFor(r);
  const sub = subtitleOf(r);
  const top = (
    <>
      <div className="ticket-head">
        <span className="ticket-icon"><Icon name={reservationIcon(r.type)} /></span>
        <div className="ticket-title">
          <strong>{r.title}</strong>
          {sub && <span>{sub}</span>}
        </div>
        <StatusPill r={r} />
      </div>
      <div className="ticket-times">
        {r.start ? (
          <When v={r.start} tz={r.startTimezone} label={a} />
        ) : (
          <div className="when"><span className="when-label">{t.starts}</span><span className="when-time when-day">{t.openDate}</span></div>
        )}
        {r.end && <When v={r.end} tz={r.endTimezone ?? r.startTimezone} label={b} />}
      </div>
    </>
  );
  return (
    <article className={`ticket ticket-${r.status}`}>
      {linked ? <a className="ticket-top" href={href("reservations", r.id)}>{top}</a> : <div className="ticket-top">{top}</div>}
      {r.confirmation && (
        <div className="ticket-stub">
          <span className="stub-label">{t.confirmation}</span>
          <CopyCode code={r.confirmation} />
        </div>
      )}
    </article>
  );
}

/** One-line version for destination and attraction pages: icon, title, when, status. */
export function TicketRow({ r }: { r: Reservation }) {
  // Same-day ranges (most trains, tours) show the date once: "Tue, Oct 13 · 15:09 → 18:05".
  const endText = r.start && r.end && dateOf(r.start) === dateOf(r.end) && hasTime(r.end) ? timeOf(r.end) : r.end && whenText(r.end);
  const when = r.start ? (endText ? `${whenText(r.start)} → ${endText}` : whenText(r.start)) : t.openDate;
  return (
    <li>
      <a href={href("reservations", r.id)}>
        <span className="ticket-icon ticket-icon-sm"><Icon name={reservationIcon(r.type)} size={18} /></span>
        <span className="row-main">
          <strong>{r.title}</strong>
          <span className="muted">{when}</span>
        </span>
        <StatusPill r={r} />
        <Icon name="chevron" size={18} />
      </a>
    </li>
  );
}
