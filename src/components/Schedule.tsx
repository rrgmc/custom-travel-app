import type { ScheduleItem } from "../types";
import { placeById, reservationById } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { Icon, reservationIcon } from "./Icon";

/**
 * A day's plan as a timeline. If `now` (HH:MM) is given, the marker is drawn before the first item
 * that hasn't started yet, and that item is highlighted as "next".
 */
export function Schedule({ items, now }: { items: ScheduleItem[]; now?: string }) {
  if (!items.length) return <p className="empty">{t.nothingPlanned}</p>;
  const nextIdx = now ? items.findIndex((it) => it.time && it.time >= now) : -1;
  return (
    <ol className="timeline">
      {items.map((it, i) => {
        const place = it.place ? placeById.get(it.place) : undefined;
        const res = it.reservation ? reservationById.get(it.reservation) : undefined;
        const past = now !== undefined && it.time !== undefined && (nextIdx === -1 || i < nextIdx);
        return (
          <li key={i} className={`tl-item${past ? " is-past" : ""}${i === nextIdx ? " is-next" : ""}${it.optional ? " is-optional" : ""}`}>
            {i === nextIdx && (
              <div className="now-line" aria-label={`${t.now} ${now}`}><span>{t.now} {now}</span></div>
            )}
            <div className="tl-time">
              {it.time ?? ""}
              {it.end && <small>{it.end}</small>}
            </div>
            <div className="tl-body">
              <div className="tl-title">
                {it.title}
                {it.optional && <span className="tag">{t.optional}</span>}
              </div>
              {place && <a className="tl-link" href={href("places", place.id)}>{place.name}</a>}
              {res && (
                <a className="tl-link tl-res" href={href("bookings", res.id)}>
                  <Icon name={reservationIcon(res.type)} size={15} /> {res.title}
                  {res.status === "pending" && <span className="pill pill-pending">{t.status.pending}</span>}
                </a>
              )}
              {it.notes && <p className="tl-notes">{it.notes}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
