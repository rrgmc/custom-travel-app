import { Icon } from "./Icon";
import { t } from "../lib/i18n";
import { openExternal, mapUrl, directionsUrl, telUrl, type Mappable } from "../lib/native";

export function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className="action" onClick={onClick}>
      <Icon name={icon} size={18} />
      <span>{label}</span>
    </button>
  );
}

/** Map and Directions (when there is somewhere to point at), plus Call and Website when given. */
export function PlaceActions({ place, phone, url }: { place?: Mappable; phone?: string; url?: string }) {
  const mappable = place && (place.location || place.address || place.near);
  if (!mappable && !phone && !url) return null;
  return (
    <div className="actions">
      {mappable && <ActionButton icon="map" label={t.map} onClick={() => openExternal(mapUrl(place))} />}
      {mappable && <ActionButton icon="route" label={t.directions} onClick={() => openExternal(directionsUrl(place))} />}
      {phone && <ActionButton icon="phone" label={t.call} onClick={() => openExternal(telUrl(phone))} />}
      {url && <ActionButton icon="link" label={t.website} onClick={() => openExternal(url)} />}
    </div>
  );
}
