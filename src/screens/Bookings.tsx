import { data, placeById, reservationById, reservationsSorted } from "../data";
import { Ticket, labelsFor } from "../components/Ticket";
import { PlaceActions, ActionButton } from "../components/Actions";
import { t } from "../lib/i18n";
import { dateOf, nowAtDestination } from "../lib/time";
import { href } from "../lib/router";
import { openExternal, openTripFile, telUrl } from "../lib/native";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";

export function BookingsList() {
  const today = nowAtDestination().slice(0, 10);
  const active = reservationsSorted.filter((r) => r.status !== "cancelled");
  const upcoming = active.filter((r) => dateOf(r.end ?? r.start) >= today);
  const past = active.filter((r) => dateOf(r.end ?? r.start) < today);
  const cancelled = reservationsSorted.filter((r) => r.status === "cancelled");
  return (
    <>
      <h1 className="screen-title">{t.bookings}</h1>
      <div className="stack">{upcoming.map((r) => <Ticket key={r.id} r={r} />)}</div>
      {past.length > 0 && (
        <details className="fold">
          <summary>{t.past} ({past.length})</summary>
          <div className="stack">{past.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </details>
      )}
      {cancelled.length > 0 && (
        <details className="fold">
          <summary>{t.cancelled} ({cancelled.length})</summary>
          <div className="stack">{cancelled.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </details>
      )}
      {data.reservations.length === 0 && <p className="empty">—</p>}
    </>
  );
}

export function BookingDetail({ id }: { id: string }) {
  const r = reservationById.get(id);
  if (!r) return <p className="empty">Not found: {id}</p>;
  const place = r.place ? placeById.get(r.place) : undefined;
  const to = r.to ? placeById.get(r.to) : undefined;
  const [, endLabel] = labelsFor(r);

  const facts: [string, string][] = [
    ...(r.details ?? []).map((d) => [d.label, d.value] as [string, string]),
    ...(r.provider ? [[t.provider, r.provider] as [string, string]] : []),
    ...(r.payment ? [[t.payment[r.payment.status], [r.payment.amount, r.payment.notes].filter(Boolean).join(" — ")] as [string, string]] : []),
    ...(r.cancellation ? [[t.cancellation, r.cancellation] as [string, string]] : []),
  ];

  return (
    <>
      <Ticket r={r} linked={false} />
      {facts.length > 0 && (
        <dl className="facts">
          {facts.map(([k, v], i) => (
            <div key={i}><dt>{k}</dt><dd>{v || "✓"}</dd></div>
          ))}
        </dl>
      )}
      {r.notes && <div className="note"><RichText text={r.notes} /></div>}

      {r.attachments?.length ? (
        <section>
          <h2>{t.documents}</h2>
          {r.attachments.map((a) => (
            <div key={a.file} className="attachment">
              {a.preview && <img src={a.preview} alt={a.label} loading="lazy" />}
              <button
                className="button button-quiet"
                onClick={() => openTripFile(a.file).catch(() => alert(t.openFailed))}
              >
                <Icon name="file" size={18} /> {t.open}: {a.label}
              </button>
            </div>
          ))}
        </section>
      ) : null}

      {(r.contact || r.url) && (
        <div className="actions">
          {r.contact && <ActionButton icon="phone" label={t.call} onClick={() => openExternal(telUrl(r.contact!))} />}
          {r.url && <ActionButton icon="link" label={t.website} onClick={() => openExternal(r.url!)} />}
        </div>
      )}

      {place && (
        <section>
          <h2><a href={href("places", place.id)}>{place.name}</a></h2>
          {place.address && <p className="muted">{place.address}</p>}
          <PlaceActions place={place} />
        </section>
      )}
      {to && (
        <section>
          <h2>{endLabel}: <a href={href("places", to.id)}>{to.name}</a></h2>
          <PlaceActions place={to} />
        </section>
      )}
    </>
  );
}
