import { data, trip } from "../data";
import { t } from "../lib/i18n";
import { openExternal, telUrl } from "../lib/native";
import { formatDate } from "../lib/time";
import { RichText } from "../components/Text";
import { Icon } from "../components/Icon";

export function Info() {
  return (
    <>
      <h1 className="screen-title">{t.info}</h1>
      <p className="lede">{formatDate(trip.start, "long")} – {formatDate(trip.end, "long")}</p>

      {data.contacts?.length ? (
        <section>
          <h2>{t.contacts}</h2>
          <ul className="rows">
            {data.contacts.map((c, i) => (
              <li key={i}>
                <button className="row-button" disabled={!c.phone} onClick={() => c.phone && openExternal(telUrl(c.phone))}>
                  <span className="row-main">
                    <strong>{c.name}</strong>
                    <span className="muted">{[c.role, c.phone, c.email].filter(Boolean).join(" · ")}</span>
                  </span>
                  {c.phone && <Icon name="phone" size={18} />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(data.info ?? []).map((s, i) => (
        <section key={i}>
          <h2>{s.title}</h2>
          <RichText text={s.body} />
        </section>
      ))}

      {trip.travelers?.length ? (
        <section>
          <h2>{t.travelers}</h2>
          <p>{trip.travelers.map((p) => p.name).join(", ")}</p>
        </section>
      ) : null}

      <p className="fineprint">{t.builtAt} {new Date(__BUILD_TIME__).toLocaleString(trip.language)}</p>
    </>
  );
}
