import { data, daysForPlace, placeById } from "../data";
import type { PlaceKind } from "../types";
import { PlaceActions } from "../components/Actions";
import { t } from "../lib/i18n";
import { formatDate } from "../lib/time";
import { href } from "../lib/router";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";

const ORDER: PlaceKind[] = ["lodging", "attraction", "restaurant", "shopping", "service", "transport", "other"];

export function PlacesList() {
  const scheduled = data.places.filter((p) => !p.wishlist);
  const wishlist = data.places.filter((p) => p.wishlist);
  return (
    <>
      <h1 className="screen-title">{t.places}</h1>
      {ORDER.map((kind) => {
        const list = scheduled.filter((p) => p.kind === kind);
        if (!list.length) return null;
        return (
          <section key={kind}>
            <h2>{t.kinds[kind]}</h2>
            <PlaceRows ids={list.map((p) => p.id)} />
          </section>
        );
      })}
      {wishlist.length > 0 && (
        <section>
          <h2>{t.notScheduled}</h2>
          <PlaceRows ids={wishlist.map((p) => p.id)} />
        </section>
      )}
    </>
  );
}

function PlaceRows({ ids }: { ids: string[] }) {
  return (
    <ul className="rows">
      {ids.map((id) => {
        const p = placeById.get(id)!;
        const days = daysForPlace(id);
        return (
          <li key={id}>
            <a href={href("places", id)}>
              <span className="row-main">
                <strong>{p.name}</strong>
                <span className="muted">{[p.city, days.length ? days.map((d) => formatDate(d)).join(", ") : ""].filter(Boolean).join(" · ")}</span>
              </span>
              <Icon name="chevron" size={18} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function PlaceDetail({ id }: { id: string }) {
  const p = placeById.get(id);
  if (!p) return <p className="empty">Not found: {id}</p>;
  const days = daysForPlace(id);
  return (
    <>
      <section className="hero">
        <p className="hero-count">{t.kinds[p.kind]}{p.city ? ` · ${p.city}` : ""}</p>
        <h1>{p.name}</h1>
        {p.address && <p className="lede">{p.address}</p>}
      </section>
      <PlaceActions place={p} />
      <dl className="facts">
        {p.hours && <div><dt>{t.hours}</dt><dd>{p.hours}</dd></div>}
        {p.price && <div><dt>{t.price}</dt><dd>{p.price}</dd></div>}
        {days.length > 0 && (
          <div>
            <dt>{t.onDays}</dt>
            <dd>{days.map((d, i) => <span key={d}>{i > 0 && ", "}<a href={href("days", d)}>{formatDate(d)}</a></span>)}</dd>
          </div>
        )}
      </dl>
      {p.notes && <div className="note"><RichText text={p.notes} /></div>}
    </>
  );
}
