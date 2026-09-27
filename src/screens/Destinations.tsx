import { useState } from "react";
import type { Attraction } from "../types";
import { attractionCount, attractionsByCategory, data, destinationById, reservationsFor, trip } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { currentDestination, formatRange } from "../lib/time";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { TicketRow } from "../components/Ticket";
import { PlaceActions } from "../components/Actions";
import { PriorityTag } from "./Attraction";

const datesOf = (d: { from?: string; to?: string }) => (d.from && d.to ? formatRange(d.from, d.to) : "");

export function DestinationsList() {
  const here = currentDestination();
  return (
    <>
      <section className="hero">
        <h1>{t.destinations}</h1>
        {trip.subtitle && <p className="lede">{trip.subtitle}</p>}
      </section>

      {here && (
        <a className="here-card" href={href("destinations", here.id)}>
          <span className="here-label">{t.hereNow}</span>
          <strong>{here.name}</strong>
          <span className="muted">{[datesOf(here), t.attractionsCount(attractionCount(here.id))].filter(Boolean).join(" · ")}</span>
        </a>
      )}

      <ol className="dest-list">
        {data.destinations.map((d, i) => (
          <li key={d.id} className={d.id === here?.id ? "is-here" : ""}>
            <a href={href("destinations", d.id)}>
              <span className="day-num">{i + 1}</span>
              <span className="row-main">
                <strong>{d.name}</strong>
                <span className="muted">
                  {[d.country, datesOf(d), t.attractionsCount(attractionCount(d.id))].filter(Boolean).join(" · ")}
                </span>
              </span>
              <Icon name="chevron" size={18} />
            </a>
          </li>
        ))}
      </ol>

      <p className="fineprint">{t.builtAt} {new Date(__BUILD_TIME__).toLocaleString(trip.language)}</p>
    </>
  );
}

export function DestinationDetail({ id }: { id: string }) {
  const [onlyMust, setOnlyMust] = useState(false);
  const d = destinationById.get(id);
  if (!d) return <p className="empty">{t.notFound}: {id}</p>;

  const mine = data.attractions.filter((a) => a.destination === id);
  // The filter only makes sense when it would hide something and leave something.
  const canFilter = mine.some((a) => a.priority === "must") && mine.some((a) => a.priority !== "must");
  const groups = attractionsByCategory(id, onlyMust && canFilter);
  const booked = reservationsFor(id);

  return (
    <>
      <section className="hero">
        {(d.country || d.from) && <p className="hero-count">{[d.country, datesOf(d)].filter(Boolean).join(" · ")}</p>}
        <h1>{d.name}</h1>
        {d.summary && <div className="lede"><RichText text={d.summary} /></div>}
      </section>
      <PlaceActions place={d.location ? { name: d.name, location: d.location } : undefined} />

      {booked.length > 0 && (
        <section>
          <h2>{t.bookedHere}</h2>
          <ul className="rows">{booked.map((r) => <TicketRow key={r.id} r={r} />)}</ul>
        </section>
      )}

      {canFilter && (
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={!onlyMust} onClick={() => setOnlyMust(false)}>{t.all}</button>
          <button role="tab" aria-selected={onlyMust} onClick={() => setOnlyMust(true)}>{t.mustOnly}</button>
        </div>
      )}

      {groups.map(({ category, items }) => (
        <section key={category.id}>
          <h2>{category.name}</h2>
          <ul className="rows">{items.map((a) => <AttractionRow key={a.id} a={a} />)}</ul>
        </section>
      ))}
      {mine.length === 0 && <p className="empty">{t.noAttractions}</p>}

      {d.tips && (
        <section>
          <h2>{t.tips}</h2>
          <div className="note"><RichText text={d.tips} /></div>
        </section>
      )}
    </>
  );
}

function AttractionRow({ a }: { a: Attraction }) {
  const hasTicket = data.reservations.some((r) => r.attraction === a.id && r.status !== "cancelled");
  return (
    <li className={`attraction attraction-${a.priority}`}>
      <a href={href("attractions", a.id)}>
        <span className="row-main">
          <strong>{a.name}</strong>
          <span className="row-meta">
            <PriorityTag p={a.priority} />
            {a.duration && <span className="muted">{a.duration}</span>}
            {hasTicket && <span className="booked"><Icon name="ticket" size={15} /></span>}
          </span>
          {a.description && <span className="muted clamp">{a.description}</span>}
        </span>
        <Icon name="chevron" size={18} />
      </a>
    </li>
  );
}
