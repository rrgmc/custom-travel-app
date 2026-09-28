import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { trip } from "../data";

/**
 * What the travelers marked on this phone: an attraction or day plan is "done" (stays in place) or
 * "removed" (faded, moved to the bottom). This is the app's only state. It lives on the phone
 * (Android SharedPreferences through @capacitor/preferences, localStorage on the web), so it survives
 * app upgrades but not an uninstall, and each phone has its own. Keyed by id: renaming an id in
 * trip.yaml loses its mark.
 */
export type Mark = "done" | "removed";
export type MarkKind = "attraction" | "plan";
type Marks = Partial<Record<MarkKind, Record<string, Mark>>>;

const KEY = `marks.${trip.id}`;
let marks: Marks = {};
const listeners = new Set<() => void>();

/** Reads the saved marks; call once before the first render. */
export async function loadMarks() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) marks = JSON.parse(value) as Marks;
  } catch { /* nothing saved or unreadable: start empty */ }
}

export function setMark(kind: MarkKind, id: string, mark: Mark | undefined) {
  const own = { ...marks[kind] };
  if (mark) own[id] = mark;
  else delete own[id];
  marks = { ...marks, [kind]: own };
  listeners.forEach((l) => l());
  Preferences.set({ key: KEY, value: JSON.stringify(marks) }).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Re-renders the caller when any mark changes; returns a lookup. */
export function useMarks() {
  const current = useSyncExternalStore(subscribe, () => marks);
  return (kind: MarkKind, id: string): Mark | undefined => current[kind]?.[id];
}

/** The same order, with removed items moved to the end. */
export function removedLast<T extends { id: string }>(items: T[], kind: MarkKind, markOf: ReturnType<typeof useMarks>) {
  return [...items.filter((x) => markOf(kind, x.id) !== "removed"), ...items.filter((x) => markOf(kind, x.id) === "removed")];
}
