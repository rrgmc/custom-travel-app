import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { trip } from "../data";

/**
 * What the travelers marked on this phone: an attraction or day plan is "todo" (moved to the top),
 * "done" (stays in place) or "removed" (faded, moved to the bottom). One mark per item: marking a
 * to-do done or removed takes it out of the top. This is the app's only state. It lives on the phone
 * (Android SharedPreferences through @capacitor/preferences, localStorage on the web), so it survives
 * app upgrades but not an uninstall, and each phone has its own. Keyed by id: renaming an id in
 * trip.yaml loses its mark.
 */
export type Mark = "todo" | "done" | "removed";
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

/** The same order, with to-do items moved to the top and removed ones to the end. */
export function sortByMark<T extends { id: string }>(items: T[], kind: MarkKind, markOf: ReturnType<typeof useMarks>) {
  const RANK: Record<Mark, number> = { todo: 0, done: 1, removed: 2 };
  const rank = (x: T) => { const m = markOf(kind, x.id); return m ? RANK[m] : 1; };
  return [...items].sort((a, b) => rank(a) - rank(b)); // stable: original order within each group
}
