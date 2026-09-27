import { useEffect } from "react";
import { attractionById, destinationById, reservationsOn, schedule, trip } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { formatDate, todayIn } from "../lib/time";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { TicketRow } from "../components/Ticket";
import { PriorityTag } from "./Attraction";

/** The suggested schedule: one card per day with its destination and attractions. No times. */
export function ScheduleScreen({ date }: { date?: string }) {
  // Opened from an attraction ("In the schedule"): jump to that day.
  useEffect(() => {
    if (date) document.getElementById(`day-${date}`)?.scrollIntoView();
  }, [date]);

  return (
    <>
      <h1 className="screen-title">{t.schedule}</h1>
      <ol className="sched">
        {schedule.map((day, i) => {
          const dest = destinationById.get(day.destination);
          const today = todayIn(dest?.timezone ?? trip.timezone);
          const state = day.date === today ? "is-today" : day.date < today ? "is-past" : "";
          const bookings = reservationsOn(day.date);
          return (
            <li key={day.date} id={`day-${day.date}`} className={`sched-day ${state}`}>
              <p className="sched-kicker">
                {t.day} {i + 1} · {formatDate(day.date)}
                {dest && <> · <a href={href("destinations", dest.id)}>{dest.name}</a></>}
              </p>
              <h2>{day.title ?? dest?.name}</h2>
              {day.attractions?.length ? (
                <ul className="rows">
                  {day.attractions.map((id) => {
                    const a = attractionById.get(id);
                    if (!a) return null;
                    return (
                      <li key={id}>
                        <a href={href("attractions", id)}>
                          <span className="row-main">
                            <strong>{a.name}</strong>
                            {a.priority === "must" && <span className="row-meta"><PriorityTag p={a.priority} /></span>}
                          </span>
                          <Icon name="chevron" size={18} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {bookings.length > 0 && <ul className="rows rows-tickets">{bookings.map((r) => <TicketRow key={r.id} r={r} />)}</ul>}
              {day.notes && <div className="sched-notes"><RichText text={day.notes} /></div>}
            </li>
          );
        })}
      </ol>
    </>
  );
}
