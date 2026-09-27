import { data, dayByDate, lodgingFor, placeById, reservationsOn, trip } from "../data";
import { Schedule } from "../components/Schedule";
import { Ticket } from "../components/Ticket";
import { PlaceActions } from "../components/Actions";
import { t } from "../lib/i18n";
import { daysBetween, formatDate, nowAtDestination, tripDates } from "../lib/time";
import { href } from "../lib/router";

export function Today() {
  const now = nowAtDestination();
  const today = now.slice(0, 10);
  const dates = tripDates();

  if (today < trip.start) return <BeforeTrip days={daysBetween(today, trip.start)} />;
  if (today > trip.end) {
    return (
      <section className="hero">
        <h1>{t.tripOver}</h1>
        <p className="lede">{t.tripOverBody}</p>
        <a className="button" href={href("days")}>{t.days}</a>
      </section>
    );
  }

  const day = dayByDate.get(today);
  const index = dates.indexOf(today) + 1;
  const stay = lodgingFor(today);
  const stayPlace = stay?.place ? placeById.get(stay.place) : day?.base ? placeById.get(day.base) : undefined;
  const bookings = reservationsOn(today);

  return (
    <>
      <section className="hero">
        <p className="hero-count">{t.day} {index} {t.of} {dates.length}</p>
        <h1>{day?.title ?? formatDate(today, "long")}</h1>
        {day?.title && <p className="lede">{formatDate(today, "long")}</p>}
        {day?.notes && <p className="note">{day.notes}</p>}
      </section>

      <Schedule items={day?.items ?? []} now={now.slice(11)} />

      {day?.alternatives?.length ? (
        <p className="aside">
          {t.otherPlans}: <a href={href("days", today)}>{day.alternatives.map((a) => a.title).join(", ")}</a>
        </p>
      ) : null}

      {bookings.length > 0 && (
        <section>
          <h2>{t.bookings}</h2>
          <div className="stack">{bookings.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </section>
      )}

      {stayPlace && today !== trip.end && (
        <section className="stay">
          <h2>{t.sleepingAt}</h2>
          <a className="stay-name" href={href("places", stayPlace.id)}>{stayPlace.name}</a>
          {stayPlace.address && <p className="muted">{stayPlace.address}</p>}
          <PlaceActions place={stayPlace} phone={stay?.contact} />
        </section>
      )}
    </>
  );
}

function BeforeTrip({ days }: { days: number }) {
  const attention = data.reservations.filter(
    (r) => r.status === "pending" || r.payment?.status === "unpaid",
  );
  const first = dayByDate.get(trip.start);
  return (
    <>
      <section className="hero">
        <p className="hero-count">{formatDate(trip.start, "long")}</p>
        <h1>{t.startsIn(days)}</h1>
        {trip.subtitle && <p className="lede">{trip.subtitle}</p>}
      </section>
      {attention.length > 0 && (
        <section>
          <h2>{t.needsAttention}</h2>
          <div className="stack">{attention.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </section>
      )}
      <section>
        <h2>{t.firstDay}{first?.title ? `: ${first.title}` : ""}</h2>
        <Schedule items={first?.items ?? []} />
      </section>
    </>
  );
}
