import type { Priority } from "../types";
import { attractionById, categoryById, destinationById, reservationsForAttraction, schedule, scheduleDaysFor } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { formatDate } from "../lib/time";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { Ticket } from "../components/Ticket";
import { PlaceActions } from "../components/Actions";

export function PriorityTag({ p }: { p: Priority }) {
  return (
    <span className={`prio prio-${p}`}>
      {p === "must" && <Icon name="star" size={13} />}
      {t.priority[p]}
    </span>
  );
}

export function AttractionDetail({ id }: { id: string }) {
  const a = attractionById.get(id);
  if (!a) return <p className="empty">{t.notFound}: {id}</p>;
  const dest = destinationById.get(a.destination);
  const category = categoryById.get(a.category);
  const tickets = reservationsForAttraction(id);
  const days = scheduleDaysFor(id);

  const facts: [string, string][] = (
    [
      [t.hours, a.hours],
      [t.closed, a.closed],
      [t.price, a.price],
      [t.travelTime, a.travelTime],
      [t.duration, a.duration],
      [t.booking, a.booking],
      [t.address, a.address],
    ] as [string, string | undefined][]
  ).filter((f): f is [string, string] => !!f[1]);

  return (
    <>
      <section className="hero">
        <p className="hero-count">
          {dest && <a href={href("destinations", dest.id)}>{dest.name}</a>}
          {category && ` · ${category.name}`}
          {a.town && a.town !== a.name && ` · ${a.town}`}
        </p>
        <h1>{a.name}</h1>
        <p className="hero-tags"><PriorityTag p={a.priority} /></p>
      </section>

      {a.description && <div className="body-text"><RichText text={a.description} /></div>}
      <PlaceActions
        place={{ name: a.name, address: a.address, location: a.location, near: dest?.name }}
        phone={a.phone}
        url={a.url}
      />

      {facts.length > 0 && (
        <dl className="facts">
          {facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      )}
      {a.tips && <div className="note"><RichText text={a.tips} /></div>}

      {tickets.length > 0 && (
        <section>
          <h2>{t.reservations}</h2>
          <div className="stack">{tickets.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </section>
      )}

      {days.length > 0 && (
        <section>
          <h2>{t.inSchedule}</h2>
          <ul className="rows">
            {days.map((d) => (
              <li key={d.date}>
                <a href={href("schedule", d.date)}>
                  <span className="row-main">
                    <strong>{t.day} {schedule.indexOf(d) + 1} · {formatDate(d.date)}</strong>
                    {d.title && <span className="muted">{d.title}</span>}
                  </span>
                  <Icon name="chevron" size={18} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
