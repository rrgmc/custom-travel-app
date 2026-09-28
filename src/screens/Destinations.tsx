import { useEffect, useRef } from "react";
import type { Attraction } from "../types";
import { attractionCount, attractionsByCategory, data, destinationById, reservationsFor, trip } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { currentDestination, formatRange } from "../lib/time";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { TicketRow } from "../components/Ticket";
import { PlaceActions } from "../components/Actions";
import { LengthTag, PriorityTag } from "./Attraction";

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

/** Tabs after the category tabs. Category ids can't use these names (the validator checks). */
export const SECTION_TABS = ["booked", "about"] as const;

export function DestinationDetail({ id, tab }: { id: string; tab?: string }) {
  const d = destinationById.get(id);
  if (!d) return <p className="empty">{t.notFound}: {id}</p>;

  const groups = attractionsByCategory(id);
  const booked = reservationsFor(id);
  const hasAbout = !!(d.summary || d.tips || d.location);
  const tabs: { key: string; label: string }[] = [
    ...groups.map((g) => ({ key: g.category.id, label: g.category.name })),
    ...(booked.length ? [{ key: "booked", label: t.bookedHere }] : []),
    ...(hasAbout ? [{ key: "about", label: t.about }] : []),
  ];
  const current = tabs.find((x) => x.key === tab)?.key ?? tabs[0]?.key;
  const group = groups.find((g) => g.category.id === current);
  // Switching tabs replaces the history entry, so the Back button leaves the page instead of
  // walking back through every tab that was looked at.
  const select = (key: string) => location.replace(href("destinations", id, key));

  return (
    <>
      <section className="hero hero-tight">
        {(d.country || d.from) && <p className="hero-count">{[d.country, datesOf(d)].filter(Boolean).join(" · ")}</p>}
        <h1>{d.name}</h1>
      </section>

      {tabs.length > 1 && <TabRow tabs={tabs} current={current} onSelect={select} />}

      {group && <ul className="rows">{group.items.map((a) => <AttractionRow key={a.id} a={a} />)}</ul>}

      {current === "booked" && <ul className="rows">{booked.map((r) => <TicketRow key={r.id} r={r} />)}</ul>}

      {current === "about" && (
        <>
          {d.summary && <div className="body-text"><RichText text={d.summary} /></div>}
          <PlaceActions place={d.location ? { name: d.name, location: d.location } : undefined} />
          {d.tips && (
            <section>
              <h2>{t.tips}</h2>
              <div className="note"><RichText text={d.tips} /></div>
            </section>
          )}
        </>
      )}

      {tabs.length === 0 && <p className="empty">{t.noAttractions}</p>}
    </>
  );
}

function TabRow({ tabs, current, onSelect }: { tabs: { key: string; label: string }[]; current?: string; onSelect: (key: string) => void }) {
  const row = useRef<HTMLDivElement>(null);
  // Coming back from an attraction, the selected tab may be past the right edge: bring it into view.
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el && row.current) row.current.scrollLeft = el.offsetLeft - row.current.offsetLeft - 20;
  }, [current]);
  return (
    <div className="segmented tabs" role="tablist" ref={row}>
      {tabs.map((x) => (
        <button key={x.key} role="tab" aria-selected={x.key === current} onClick={() => onSelect(x.key)}>
          {x.label}
        </button>
      ))}
    </div>
  );
}

function AttractionRow({ a }: { a: Attraction }) {
  const hasTicket = data.reservations.some((r) => r.attraction === a.id && r.status !== "cancelled");
  // Another town and how far it is matter more in a list than how long the visit takes.
  const meta = [a.town !== a.name && a.town, a.travelTime ?? a.duration].filter(Boolean).join(" · ");
  return (
    <li className={`attraction attraction-${a.priority}`}>
      <a href={href("attractions", a.id)}>
        <span className="row-main">
          <strong>{a.name}</strong>
          <span className="row-meta">
            <PriorityTag p={a.priority} />
            {a.length && <LengthTag length={a.length} />}
            {meta && <span className="muted">{meta}</span>}
            {hasTicket && <span className="booked"><Icon name="ticket" size={15} /></span>}
          </span>
          {a.description && <span className="muted clamp">{a.description}</span>}
        </span>
        <Icon name="chevron" size={18} />
      </a>
    </li>
  );
}
