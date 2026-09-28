import type { Priority, Rain, VisitLength } from "../types";
import { attractionById, categoryById, destinationById, plansWithAttraction, reservationsForAttraction } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { Ticket } from "../components/Ticket";
import { AskClaudeButton, PlaceActions } from "../components/Actions";
import { attractionQuestion } from "../lib/prompts";
import { DoneTag, MarkButtons } from "../components/Marks";
import { useMarks } from "../lib/marks";

export function PriorityTag({ p }: { p: Priority }) {
  return (
    <span className={`prio prio-${p}`}>
      {p === "must" && <Icon name="star" size={13} />}
      {t.priority[p]}
    </span>
  );
}

export function LengthTag({ length }: { length: VisitLength }) {
  return (
    <span className="len">
      <Icon name="clock" size={13} />
      {t.length[length]}
    </span>
  );
}

export function RainTag({ rain }: { rain: Rain }) {
  return (
    <span className={`len rain-${rain}`}>
      <Icon name={rain === "outdoor" ? "sun" : "umbrella"} size={13} />
      {t.rain[rain]}
    </span>
  );
}

export function KidsTag() {
  return (
    <span className="len kids">
      <Icon name="kids" size={13} />
      {t.kidFriendly}
    </span>
  );
}

export function AttractionDetail({ id }: { id: string }) {
  const markOf = useMarks();
  const a = attractionById.get(id);
  if (!a) return <p className="empty">{t.notFound}: {id}</p>;
  const dest = destinationById.get(a.destination);
  const category = categoryById.get(a.category);
  const tickets = reservationsForAttraction(id);
  const plans = plansWithAttraction(id);

  const facts: [string, string][] = (
    [
      [t.hours, a.hours],
      [t.closed, a.closed],
      [t.price, a.price],
      [t.travelTime, a.travelTime],
      [t.duration, a.duration],
      [t.inRain, a.rainNote],
      [t.withKids, a.kidsNote],
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
        <p className="hero-tags">
          <PriorityTag p={a.priority} />
          {a.length && <LengthTag length={a.length} />}
          {a.rain && <RainTag rain={a.rain} />}
          {a.kidFriendly && <KidsTag />}
        </p>
      </section>
      <MarkButtons kind="attraction" id={a.id} />

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
      <AskClaudeButton question={() => attractionQuestion(a)} />

      {tickets.length > 0 && (
        <section>
          <h2>{t.reservations}</h2>
          <div className="stack">{tickets.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </section>
      )}

      {plans.length > 0 && (
        <section>
          <h2>{t.inPlans}</h2>
          <ul className="rows">
            {plans.map((p) => (
              <li key={p.id} className={markOf("plan", p.id) ? `is-${markOf("plan", p.id)}` : undefined}>
                <a href={href("plans", p.id)}>
                  <span className="row-main">
                    <strong>{p.title}{markOf("plan", p.id) === "done" && <DoneTag />}</strong>
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
