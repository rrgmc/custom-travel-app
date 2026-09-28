// Questions for Claude about a trip item, written in the trip's language with the context Claude needs
// (where, when, where we stay, who's traveling) so the answer fits this trip.

import type { Attraction, DayPlan } from "../types";
import { attractionById, categoryById, data, destinationById, trip } from "../data";
import { formatRange } from "./time";

const pt = trip.language === "pt-BR";

function tripContext(destinationId: string): string {
  const d = destinationById.get(destinationId);
  const hotel = data.reservations.find((r) => r.type === "lodging" && r.status !== "cancelled" && r.destination === destinationId);
  const parts = [
    d && (pt ? `Destino: ${d.name}${d.country ? `, ${d.country}` : ""}` : `Destination: ${d.name}${d.country ? `, ${d.country}` : ""}`),
    d?.from && d.to && (pt ? `Datas: ${formatRange(d.from, d.to)}` : `Dates: ${formatRange(d.from, d.to)}`),
    hotel && (pt ? `Hospedagem: ${hotel.title}` : `Staying at: ${hotel.title}`),
    trip.travelers && (pt ? `Quem vai: ${trip.travelers}` : `Traveling: ${trip.travelers}`),
    trip.preferences && (pt ? `Preferências: ${trip.preferences}` : `Preferences: ${trip.preferences}`),
  ];
  return parts.filter(Boolean).join("\n");
}

const line = (label: string, value?: string) => (value ? `${label}: ${value}` : "");

export function attractionQuestion(a: Attraction): string {
  const category = categoryById.get(a.category)?.name;
  const known = [
    a.description,
    line(pt ? "Dicas" : "Tips", a.tips),
    line(pt ? "Horário" : "Hours", a.hours),
    line(pt ? "Fechado" : "Closed", a.closed),
    line(pt ? "Preço" : "Price", a.price),
    line(pt ? "Como chegar" : "Getting there", a.travelTime),
  ].filter(Boolean).join("\n");
  const where = [a.town, category].filter(Boolean).join(", ");
  return pt
    ? `Estou numa viagem e quero saber mais sobre um lugar.\n\n${tripContext(a.destination)}\n\nLugar: ${a.name}${where ? ` (${where})` : ""}\n${known ? `\nO que já anotei:\n${known}\n` : ""}\nMe explique melhor o que é, se vale a pena para nós, dicas práticas para a visita e o que conferir antes de ir (horários e preços podem ter mudado).`
    : `I'm on a trip and want to know more about a place.\n\n${tripContext(a.destination)}\n\nPlace: ${a.name}${where ? ` (${where})` : ""}\n${known ? `\nWhat I have noted:\n${known}\n` : ""}\nExplain what it is, whether it's worth it for us, practical tips for the visit, and what to check before going (hours and prices may have changed).`;
}

export function planQuestion(p: DayPlan): string {
  const names = p.attractions.map((id) => attractionById.get(id)?.name).filter(Boolean).join(", ");
  return pt
    ? `Estou numa viagem e quero ajuda com um roteiro de um dia.\n\n${tripContext(p.destination)}\n\nRoteiro: ${p.title}\nLugares: ${names}\n${p.notes ? `Notas: ${p.notes}\n` : ""}\nMe ajude a organizar esse dia: ordem e horários sugeridos, tempo em cada lugar, onde comer, e o que conferir antes (dias fechados, reservas, clima).`
    : `I'm on a trip and want help with a day plan.\n\n${tripContext(p.destination)}\n\nPlan: ${p.title}\nPlaces: ${names}\n${p.notes ? `Notes: ${p.notes}\n` : ""}\nHelp me organize this day: suggested order and times, time at each place, where to eat, and what to check first (closed days, bookings, weather).`;
}
