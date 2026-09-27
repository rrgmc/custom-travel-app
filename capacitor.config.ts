import type { CapacitorConfig } from "@capacitor/cli";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

// App identity comes from trip/trip.yaml so each trip installs as its own app.
// `npm run trip:apply` pushes the same values into the android/ project.
const { trip } = parse(readFileSync("trip/trip.yaml", "utf8"));

const config: CapacitorConfig = {
  appId: `io.github.rrgmc.travel.${trip.id}`,
  appName: trip.title,
  webDir: "dist",
  android: {
    // Trip data never leaves the device; no remote content is loaded.
    allowMixedContent: false,
  },
};

export default config;
