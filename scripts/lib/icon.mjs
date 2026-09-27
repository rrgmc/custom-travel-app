// Renders the per-trip app icon: the trip's initial(s) on its accent color, with a small "sun" dot.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

export const DEFAULT_ACCENT = "#0E6E6B";
export const PAPER = "#F4F7F7";
const SIGNAL = "#F0A202";

export function loadTrip(root) {
  return YAML.parse(readFileSync(join(root, "trip/trip.yaml"), "utf8")).trip;
}

export function iconText(trip) {
  return (trip.icon ?? trip.title.trim()[0] ?? "?").toUpperCase();
}

const esc = (s) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);

/**
 * @param {object} o
 * @param {string} o.text      1–2 characters
 * @param {string} o.accent    background color
 * @param {"square"|"round"|"foreground"} o.shape
 *   foreground = transparent, content kept inside the adaptive-icon safe zone (66/108)
 */
export function iconSvg({ text, accent, shape = "square" }) {
  const S = 1024;
  const scale = shape === "foreground" ? 66 / 108 : 1;
  const c = S / 2;
  const fs = (text.length > 1 ? 470 : 600) * scale;
  const bg =
    shape === "foreground" ? "" :
    shape === "round" ? `<circle cx="${c}" cy="${c}" r="${c}" fill="${accent}"/>` :
    `<rect width="${S}" height="${S}" rx="${S * 0.22}" fill="${accent}"/>`;
  const sunR = 70 * scale;
  const sunX = c + 250 * scale;
  const sunY = c - 250 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  ${bg}
  <text x="${c}" y="${c + fs * 0.35}" text-anchor="middle" font-family="Figtree, DejaVu Sans, Arial, sans-serif" font-weight="800" font-size="${fs}" fill="#FFFFFF">${esc(text)}</text>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${SIGNAL}"/>
</svg>`;
}
