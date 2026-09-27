import type { Place } from "../types";
import { Icon } from "./Icon";
import { t } from "../lib/i18n";
import { directionsUrl, mapUrl, openExternal, telUrl } from "../lib/native";

export function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className="action" onClick={onClick}>
      <Icon name={icon} size={18} />
      <span>{label}</span>
    </button>
  );
}

export function PlaceActions({ place, phone }: { place: Place; phone?: string }) {
  const tel = phone ?? place.phone;
  return (
    <div className="actions">
      <ActionButton icon="map" label={t.map} onClick={() => openExternal(mapUrl(place))} />
      <ActionButton icon="route" label={t.directions} onClick={() => openExternal(directionsUrl(place))} />
      {tel && <ActionButton icon="phone" label={t.call} onClick={() => openExternal(telUrl(tel))} />}
      {place.url && <ActionButton icon="link" label={t.website} onClick={() => openExternal(place.url!)} />}
    </div>
  );
}
