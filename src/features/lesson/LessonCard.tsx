import type { Concept, LessonCard as LessonCardData } from "@/content/schema/schema";
import { MiniMd } from "@/ui/MiniMd";

export function LessonCard({
  concept,
  card,
}: {
  concept: Concept;
  card: LessonCardData;
}) {
  return (
    <article className="card" aria-label={`Lesson: ${concept.title}`}>
      <p className="card__kicker">
        Lesson · {concept.title}
      </p>
      <p className="card__formula">{card.formula}</p>
      {card.body.map((block, i) => {
        switch (block.kind) {
          case "rule":
            return (
              <p key={i} className="card__rule">
                <MiniMd text={block.md} />
              </p>
            );
          case "table":
            return (
              <table key={i} className="card__table">
                <thead>
                  <tr>
                    {block.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case "example":
            return <ExampleLine key={i} block={block} />;
        }
      })}
    </article>
  );
}

function ExampleLine({
  block,
}: {
  block: Extract<LessonCardData["body"][number], { kind: "example" }>;
}) {
  const spans = block.highlight ?? [];
  // Split tr into plain/highlighted segments by span offsets.
  const segments: { text: string; note?: string }[] = [];
  let cursor = 0;
  for (const h of [...spans].sort((a, b) => a.span[0] - b.span[0])) {
    const [start, end] = h.span;
    if (start > cursor) segments.push({ text: block.tr.slice(cursor, start) });
    segments.push({ text: block.tr.slice(start, end + 1), note: h.note });
    cursor = end + 1;
  }
  if (cursor < block.tr.length) segments.push({ text: block.tr.slice(cursor) });

  return (
    <div className="example">
      <p className="example__tr" lang="tr">
        {segments.map((seg, i) =>
          seg.note ? (
            <mark key={i} title={seg.note}>
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>
      <p className="example__gloss">{block.gloss}</p>
    </div>
  );
}
