import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { AppLauncher } from "@capacitor/app-launcher";
import { Clipboard } from "@capacitor/clipboard";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capawesome-team/capacitor-file-opener";
import type { Location } from "../types";

/** Anything the map buttons can point at: an attraction, a destination, a hotel reservation. */
export interface Mappable {
  name: string;
  address?: string;
  location?: Location;
  /** Added to name-only searches to find the right place (e.g. the destination name). */
  near?: string;
}

export const isNative = Capacitor.isNativePlatform();

/**
 * Android's Back key: step back through the app's screens (they are hash routes, so they're in the
 * WebView history) and leave the app only from the first one. Without this, Back closes the app.
 */
export function handleBackButton() {
  if (!isNative) return;
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) history.back();
    else App.exitApp();
  });
}

/** Opens a URL in the right app (Maps, dialer, browser). */
export async function openExternal(url: string) {
  if (isNative) {
    try {
      await AppLauncher.openUrl({ url });
      return;
    } catch { /* fall through */ }
  }
  window.open(url, "_blank", "noopener");
}

export async function copyText(text: string) {
  if (isNative) await Clipboard.write({ string: text });
  else await navigator.clipboard.writeText(text);
}

const target = (p: Mappable) =>
  p.location ? `${p.location.lat},${p.location.lng}` : [p.name, p.address, p.near].filter(Boolean).join(", ");

/** Google Maps universal URLs: open the Maps app on Android (offline areas work) or the website elsewhere. */
export const mapUrl = (p: Mappable) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target(p))}`;
export const directionsUrl = (p: Mappable) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target(p))}`;
export const telUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const MIME: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
};

/**
 * Opens a bundled trip file (e.g. files/voucher.pdf) in an external viewer.
 * Android WebViews can't show PDFs, so on native we copy the file to the cache and hand it to the system.
 */
export async function openTripFile(path: string): Promise<void> {
  if (!isNative) {
    window.open(path, "_blank", "noopener");
    return;
  }
  const blob = await (await fetch(path)).blob();
  const base64 = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
  const name = path.split("/").pop()!;
  const { uri } = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
  const ext = name.split(".").pop()!.toLowerCase();
  await FileOpener.openFile({ path: uri, mimeType: MIME[ext] });
}
