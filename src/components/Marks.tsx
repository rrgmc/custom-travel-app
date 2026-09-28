import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { t } from "../lib/i18n";
import { setMark, useMarks, type Mark, type MarkKind } from "../lib/marks";

/** Each mark with its icon and the labels to set it or take it off, in menu order. */
const MARKS: { mark: Mark; icon: string; set: string; unset: string }[] = [
  { mark: "todo", icon: "flag", set: t.markTodo, unset: t.unmarkTodo },
  { mark: "done", icon: "check", set: t.markDone, unset: t.unmarkDone },
  { mark: "removed", icon: "remove", set: t.remove, unset: t.restore },
];
const iconFor = (m: Mark, current?: Mark) => (m === "removed" && current === "removed" ? "restore" : MARKS.find((x) => x.mark === m)!.icon);

/**
 * An item's name, with a "To do" or "Done" tag after it. The tag is kept on the same line as the
 * last word, so a long name never leaves it alone (and oddly indented) on a line of its own.
 */
export function NameWithMark({ name, mark }: { name: string; mark?: Mark }) {
  if (mark !== "todo" && mark !== "done") return <>{name}</>;
  const cut = name.lastIndexOf(" ") + 1;
  return (
    <>
      {name.slice(0, cut)}
      <span className="nowrap">{name.slice(cut)}<span className={`mark-tag tag-${mark}`}>{mark === "todo" ? t.todo : t.done}</span></span>
    </>
  );
}

/** To do, Done and Remove/Restore toggles for an item's own page, short enough to fit one row. */
export function MarkButtons({ kind, id }: { kind: MarkKind; id: string }) {
  const mark = useMarks()(kind, id);
  return (
    <div className="actions mark-actions">
      {MARKS.map((m) => {
        const on = mark === m.mark;
        // Pressed To do / Done buttons fill with their color; Remove turns into Restore.
        const label = m.mark === "todo" ? t.todo : m.mark === "done" ? t.done : on ? t.restore : t.removeShort;
        return (
          <button key={m.mark} className={`action${on && m.mark !== "removed" ? ` action-${m.mark}` : ""}`} aria-pressed={on}
            onClick={() => setMark(kind, id, on ? undefined : m.mark)}>
            <Icon name={iconFor(m.mark, mark)} size={18} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** The ⋯ button on a list row: a bottom sheet with To do, Done and Remove/Restore for that item. */
export function MarkMenu({ kind, id, name }: { kind: MarkKind; id: string; name: string }) {
  const mark = useMarks()(kind, id);
  const sheet = useRef<HTMLDialogElement>(null);
  // The sheet exists only while open, so long lists don't carry one dialog per row.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) sheet.current?.showModal();
  }, [open]);
  const pick = (next: Mark) => {
    setMark(kind, id, mark === next ? undefined : next);
    sheet.current?.close();
  };
  return (
    <>
      <button className="more" aria-label={`${t.more}: ${name}`} onClick={() => setOpen(true)}>
        <Icon name="more" size={20} />
      </button>
      {/* The dialog has no padding, so a click on the dialog itself is on the dimmed area outside the
          sheet: that closes it. Android's Back key closes it too (src/lib/native.ts). */}
      {open && (
        <dialog className="sheet" ref={sheet} onClose={() => setOpen(false)}
          onClick={(e) => e.target === sheet.current && sheet.current.close()}>
          <div className="sheet-body">
            <strong className="sheet-title">{name}</strong>
            {MARKS.map((m) => (
              <button key={m.mark} className={`sheet-item sheet-${m.mark}`} onClick={() => pick(m.mark)}>
                <Icon name={iconFor(m.mark, mark)} size={20} /> {mark === m.mark ? m.unset : m.set}
              </button>
            ))}
            <button className="sheet-item sheet-cancel" onClick={() => sheet.current?.close()}>{t.cancel}</button>
          </div>
        </dialog>
      )}
    </>
  );
}
