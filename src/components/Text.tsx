/** Renders the tiny text format used in trip.yaml: blank line = new paragraph, "- " = list item. */
export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="rich">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- ")))
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>;
        return <p key={i}>{b}</p>;
      })}
    </div>
  );
}
