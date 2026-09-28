import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { t } from "../lib/i18n";
import { setMark, useMarks, type MarkKind } from "../lib/marks";

/**
 * An item's name, with a "Done" tag after it when it's done. The tag is kept on the same line as the
 * last word, so a long name never leaves it alone (and oddly indented) on a line of its own.
 */
export function NameWithDone({ name, done }: { name: string; done: boolean }) {
  if (!done) return <>{name}</>;
  const cut = name.lastIndexOf(" ") + 1;
  return (
    <>
      {name.slice(0, cut)}
      <span className="nowrap">{name.slice(cut)}<span className="done-tag">{t.done}</span></span>
    </>
  );
}

/** Done and Remove/Restore buttons for an item's own page. */
export function MarkButtons({ kind, id }: { kind: MarkKind; id: string }) {
  const mark = useMarks()(kind, id);
  return (
    <div className="actions">
      <button className={`action${mark === "done" ? " action-on" : ""}`} aria-pressed={mark === "done"}
        onClick={() => setMark(kind, id, mark === "done" ? undefined : "done")}>
        <Icon name="check" size={18} />
        <span>{mark === "done" ? t.done : t.markDone}</span>
      </button>
      <button className="action" onClick={() => setMark(kind, id, mark === "removed" ? undefined : "removed")}>
        <Icon name={mark === "removed" ? "restore" : "remove"} size={18} />
        <span>{mark === "removed" ? t.restore : t.remove}</span>
      </button>
    </div>
  );
}

/** The ⋯ button on a list row: a bottom sheet with Done and Remove/Restore for that item. */
export function MarkMenu({ kind, id, name }: { kind: MarkKind; id: string; name: string }) {
  const mark = useMarks()(kind, id);
  const sheet = useRef<HTMLDialogElement>(null);
  // The sheet exists only while open, so long lists don't carry one dialog per row.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) sheet.current?.showModal();
  }, [open]);
  const pick = (next: "done" | "removed") => {
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
            <button className="sheet-item" onClick={() => pick("done")}>
              <Icon name="check" size={20} /> {mark === "done" ? t.unmarkDone : t.markDone}
            </button>
            <button className="sheet-item" onClick={() => pick("removed")}>
              <Icon name={mark === "removed" ? "restore" : "remove"} size={20} /> {mark === "removed" ? t.restore : t.remove}
            </button>
            <button className="sheet-item sheet-cancel" onClick={() => sheet.current?.close()}>{t.cancel}</button>
          </div>
        </dialog>
      )}
    </>
  );
}
