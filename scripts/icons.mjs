#!/usr/bin/env node
// Writes the web/PWA icons into public/ from trip/trip.yaml. Runs as part of `npm run build`.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { iconSvg, iconText, loadTrip, DEFAULT_ACCENT } from "./lib/icon.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const trip = loadTrip(root);
const svg = iconSvg({ text: iconText(trip), accent: trip.accent ?? DEFAULT_ACCENT });
const pub = join(root, "public");
mkdirSync(pub, { recursive: true });
writeFileSync(join(pub, "icon.svg"), svg);
for (const size of [192, 512]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(pub, `icon-${size}.png`));
}
console.log("icons: public/icon.svg, icon-192.png, icon-512.png");
