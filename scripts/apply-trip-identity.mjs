#!/usr/bin/env node
// Makes the android/ project match trip/trip.yaml, so every trip installs as its own app:
//   - applicationId  io.github.rrgmc.travel.<trip.id>
//   - app name       trip.title
//   - launcher icons and splash screen
// Safe to run repeatedly. Runs as part of `npm run android:sync`.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { iconSvg, iconText, loadTrip, DEFAULT_ACCENT, PAPER } from "./lib/icon.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const android = join(root, "android");
if (!existsSync(android)) {
  console.error("android/ not found. Run `npx cap add android` first.");
  process.exit(1);
}
const trip = loadTrip(root);
const appId = `io.github.rrgmc.travel.${trip.id}`;
const accent = trip.accent ?? DEFAULT_ACCENT;
const text = iconText(trip);
const res = join(android, "app/src/main/res");
const xml = (s) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "\\'", '"': '\\"' })[c]);

function patch(file, pairs) {
  const p = join(android, file);
  let s = readFileSync(p, "utf8");
  for (const [re, rep] of pairs) {
    if (!re.test(s)) throw new Error(`${file}: pattern not found: ${re}`);
    s = s.replace(re, rep);
  }
  writeFileSync(p, s);
}

patch("app/build.gradle", [[/applicationId "[^"]*"/, `applicationId "${appId}"`]]);
patch("app/src/main/res/values/strings.xml", [
  [/(<string name="app_name">)[^<]*(<\/string>)/, `$1${xml(trip.title)}$2`],
  [/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${xml(trip.title)}$2`],
  [/(<string name="package_name">)[^<]*(<\/string>)/, `$1${appId}$2`],
  [/(<string name="custom_url_scheme">)[^<]*(<\/string>)/, `$1${appId}$2`],
]);
patch("app/src/main/res/values/ic_launcher_background.xml", [
  [/(<color name="ic_launcher_background">)[^<]*(<\/color>)/, `$1${accent}$2`],
]);

// Launcher icons
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const render = (shape, size) => sharp(Buffer.from(iconSvg({ text, accent, shape }))).resize(size, size).png();
for (const [d, k] of Object.entries(densities)) {
  const dir = join(res, `mipmap-${d}`);
  await render("square", 48 * k).toFile(join(dir, "ic_launcher.png"));
  await render("round", 48 * k).toFile(join(dir, "ic_launcher_round.png"));
  await render("foreground", 108 * k).toFile(join(dir, "ic_launcher_foreground.png"));
}

// Splash screens: paper background with the icon in the middle, same sizes as the originals
for (const dir of readdirSync(res).filter((d) => d.startsWith("drawable"))) {
  const file = join(res, dir, "splash.png");
  if (!existsSync(file)) continue;
  const { width, height } = await sharp(file).metadata();
  const s = Math.round(Math.min(width, height) * 0.28);
  const icon = await render("square", s).toBuffer();
  const out = await sharp({ create: { width, height, channels: 4, background: PAPER } })
    .composite([{ input: icon, left: Math.round((width - s) / 2), top: Math.round((height - s) / 2) }])
    .png()
    .toBuffer();
  writeFileSync(file, out);
}

console.log(`android: ${appId} "${trip.title}" (icon "${text}", ${accent})`);
