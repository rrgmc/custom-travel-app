import { useState } from "react";
import type { Reservation } from "../types";
import { placeById } from "../data";
import { Icon, reservationIcon } from "./Icon";
import { t } from "../lib/i18n";
import { copyText } from "../lib/native";
import { dateOf, formatDate, timeOf, zoneLabel } from "../lib/time";
import { href } from "../lib/router";

const TRANSPORT = ["flight", "train", "bus", "transfer"];

export function labelsFor(r: Reservation): [string, string] {
  if (r.type === "lodging") return [t.checkIn, t.checkOut];
  if (TRANSPORT.includes(r.type)) return [t.departs, t.arrives];
  return [t.starts, t.ends];
}

function When({ ldt, tz, label }: { ldt: string; tz?: string; label: string }) {
  const z = zoneLabel(tz, dateOf(ldt));
  return (
    <div className="when">
      <span className="when-label">{label}</span>
      <span className="when-time">{timeOf(ldt)}{z && <small> {z}</small>}</span>
      <span className="when-date">{formatDate(dateOf(ldt))}</span>
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

/** A reservation drawn as a ticket stub. The whole upper part links to the booking detail. */
export function Ticket({ r, linked = true }: { r: Reservation; linked?: boolean }) {
  const [a, b] = labelsFor(r);
  const from = r.place ? placeById.get(r.place) : undefined;
  const to = r.to ? placeById.get(r.to) : undefined;
  const top = (
    <>
      <div className="ticket-head">
        <span className="ticket-icon"><Icon name={reservationIcon(r.type)} /></span>
        <div className="ticket-title">
          <strong>{r.title}</strong>
          <span>{to && from ? `${from.name} → ${to.name}` : from?.name ?? r.provider ?? ""}</span>
        </div>
        {r.status !== "confirmed" && <span className={`pill pill-${r.status}`}>{t.status[r.status]}</span>}
      </div>
      <div className="ticket-times">
        <When ldt={r.start} tz={r.startTimezone} label={a} />
        {r.end && <When ldt={r.end} tz={r.endTimezone ?? r.startTimezone} label={b} />}
      </div>
    </>
  );
  return (
    <article className={`ticket ticket-${r.status}`}>
      {linked ? <a className="ticket-top" href={href("bookings", r.id)}>{top}</a> : <div className="ticket-top">{top}</div>}
      {r.confirmation && (
        <div className="ticket-stub">
          <span className="stub-label">{t.confirmation}</span>
          <CopyCode code={r.confirmation} />
        </div>
      )}
    </article>
  );
}
