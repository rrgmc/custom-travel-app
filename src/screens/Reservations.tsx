import { RESERVATION_GROUPS, attractionById, data, destinationById, reservationById, reservationsInGroup } from "../data";
import { Ticket } from "../components/Ticket";
import { PlaceActions } from "../components/Actions";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { openTripFile } from "../lib/native";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";

export function ReservationsList() {
  const cancelled = data.reservations.filter((r) => r.status === "cancelled");
  return (
    <>
      <h1 className="screen-title">{t.reservations}</h1>
      {RESERVATION_GROUPS.map((g) => {
        const list = reservationsInGroup(g);
        if (!list.length) return null;
        return (
          <section key={g}>
            <h2>{t.groups[g]}</h2>
            <div className="stack">{list.map((r) => <Ticket key={r.id} r={r} />)}</div>
          </section>
        );
      })}
      {cancelled.length > 0 && (
        <details className="fold">
          <summary>{t.cancelled} ({cancelled.length})</summary>
          <div className="stack">{cancelled.map((r) => <Ticket key={r.id} r={r} />)}</div>
        </details>
      )}
      {data.reservations.length === 0 && <p className="empty">{t.noReservations}</p>}
    </>
  );
}

export function ReservationDetail({ id }: { id: string }) {
  const r = reservationById.get(id);
  if (!r) return <p className="empty">{t.notFound}: {id}</p>;
  const attraction = r.attraction ? attractionById.get(r.attraction) : undefined;
  const dest = destinationById.get(r.destination ?? attraction?.destination ?? "");

  const facts: [string, string][] = [
    ...(r.details ?? []).map((d) => [d.label, d.value] as [string, string]),
    ...(r.provider ? [[t.provider, r.provider] as [string, string]] : []),
    ...(r.payment ? [[t.payment[r.payment.status], [r.payment.amount, r.payment.notes].filter(Boolean).join(" — ")] as [string, string]] : []),
    ...(r.cancellation ? [[t.cancellation, r.cancellation] as [string, string]] : []),
    ...(r.address ? [[t.address, r.address] as [string, string]] : []),
  ];

  return (
    <>
      {dest && <p className="hero-count"><a href={href("destinations", dest.id)}>{dest.name}</a></p>}
      <Ticket r={r} linked={false} />
      <PlaceActions
        place={r.location || r.address ? { name: r.title, address: r.address, location: r.location } : undefined}
        phone={r.contact}
        url={r.url}
      />
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

      {attraction && (
        <ul className="rows">
          <li>
            <a href={href("attractions", attraction.id)}>
              <span className="row-main"><strong>{attraction.name}</strong></span>
              <Icon name="chevron" size={18} />
            </a>
          </li>
        </ul>
      )}
    </>
  );
}
