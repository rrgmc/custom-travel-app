import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { parse } from "yaml";
import { readFileSync, cpSync, existsSync, createReadStream } from "node:fs";
import { join, resolve, extname } from "node:path";

const TRIP_DIR = resolve(__dirname, "trip");
const trip = parse(readFileSync(join(TRIP_DIR, "trip.yaml"), "utf8")).trip;

/** Lets the app `import data from "../trip/trip.yaml"`. The trip is bundled into the JS: no network needed. */
function yamlPlugin(): Plugin {
  return {
    name: "trip-yaml",
    transform(code, id) {
      if (!id.endsWith(".yaml")) return null;
      return { code: `export default ${JSON.stringify(parse(code))};`, map: null };
    },
  };
}

/** Serves trip/files/* at /files/* in dev and copies them into the build. */
function tripFilesPlugin(): Plugin {
  const src = join(TRIP_DIR, "files");
  let outDir = "dist";
  return {
    name: "trip-files",
    configResolved(c) {
      outDir = c.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use("/files", (req, res, next) => {
        const file = join(src, decodeURIComponent((req.url ?? "").split("?")[0]));
        if (!file.startsWith(src) || !existsSync(file)) return next();
        const types: Record<string, string> = { ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
        res.setHeader("Content-Type", types[extname(file).toLowerCase()] ?? "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (existsSync(src)) cpSync(src, join(outDir, "files"), { recursive: true, filter: (f) => !f.endsWith(".gitkeep") });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    yamlPlugin(),
    tripFilesPlugin(),
    VitePWA({
      // The service worker is only registered outside the native app (see src/main.tsx):
      // inside Capacitor every file is already local.
      injectRegister: null,
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: trip.title,
        short_name: trip.title.slice(0, 12),
        description: trip.subtitle ?? trip.title,
        lang: trip.language,
        display: "standalone",
        start_url: "./",
        background_color: "#F4F7F7",
        theme_color: trip.accent ?? "#0E6E6B",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,pdf,woff2}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      },
    }),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
