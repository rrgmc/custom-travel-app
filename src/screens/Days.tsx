import { useState } from "react";
import { dayByDate, lodgingFor, placeById, reservationsOn } from "../data";
import { Schedule } from "../components/Schedule";
import { Ticket } from "../components/Ticket";
import { t } from "../lib/i18n";
import { formatDate, nowAtDestination, tripDates } from "../lib/time";
import { href } from "../lib/router";
import { Icon } from "../components/Icon";

export function DaysList() {
  const today = nowAtDestination().slice(0, 10);
  return (
    <>
      <h1 className="screen-title">{t.days}</h1>
      <ol className="day-list">
        {tripDates().map((date, i) => {
          const day = dayByDate.get(date);
          const count = day?.items.length ?? 0;
          return (
            <li key={date} className={date === today ? "is-today" : date < today ? "is-past" : ""}>
              <a href={href("days", date)}>
                <span className="day-num">{i + 1}</span>
                <span className="day-main">
                  <strong>{day?.title ?? formatDate(date, "long")}</strong>
                  <span className="muted">{formatDate(date)}{count ? ` · ${count}` : ""}</span>
                </span>
                <Icon name="chevron" size={18} />
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function DayDetail({ date }: { date: string }) {
  const day = dayByDate.get(date);
  const dates = tripDates();
  const idx = dates.indexOf(date);
  const [plan, setPlan] = useState(-1); // -1 = main plan
  const now = nowAtDestination();
  const items = plan < 0 ? day?.items ?? [] : day!.alternatives![plan].items;
  const stay = lodgingFor(date);
  const base = stay?.place ?? day?.base;
  const basePlace = base ? placeById.get(base) : undefined;

  return (
    <>
      <nav className="pager">
        {idx > 0 ? <a href={href("days", dates[idx - 1])}><Icon name="back" size={18} /> {formatDate(dates[idx - 1])}</a> : <span />}
        {idx < dates.length - 1 ? <a href={href("days", dates[idx + 1])}>{formatDate(dates[idx + 1])} <Icon name="chevron" size={18} /></a> : <span />}
      </nav>
      <section className="hero">
        <p className="hero-count">{t.day} {idx + 1} {t.of} {dates.length}</p>
        <h1>{day?.title ?? formatDate(date, "long")}</h1>
        {day?.title && <p className="lede">{formatDate(date, "long")}</p>}
        {day?.notes && <p className="note">{day.notes}</p>}
      </section>

      {day?.alternatives?.length ? (
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={plan < 0} onClick={() => setPlan(-1)}>{t.mainPlan}</button>
          {day.alternatives.map((a, i) => (
            <button key={i} role="tab" aria-selected={plan === i} onClick={() => setPlan(i)}>{a.title}</button>
          ))}
        </div>
      ) : null}
      {plan >= 0 && day?.alternatives?.[plan].when && <p className="aside">{day.alternatives[plan].when}</p>}

      <Schedule items={items} now={now.slice(0, 10) === date ? now.slice(11) : undefined} />

      {reservationsOn(date).length > 0 && (
        <section>
          <h2>{t.bookings}</h2>
          <div className="stack">{reservationsOn(date).map((r) => <Ticket key={r.id} r={r} />)}</div>
        </section>
      )}
      {basePlace && (
        <p className="aside">{t.sleepingAt} <a href={href("places", basePlace.id)}>{basePlace.name}</a></p>
      )}
    </>
  );
}
