import { useEffect, useState } from "react";
import { seedSource } from "@/content/source/SeedSource";
import type { ErrorTag } from "@/content/schema/schema";
import { statsRepo } from "@/data/repos/statsRepo";
import type { DayStats } from "@/data/db";
import { useSrsStore } from "@/store/srsStore";
import { Star } from "@/ui/icons";

const STATUS_ICON = { new: "·", learning: "◐", review: "●" } as const;

export function StatsView() {
  const states = useSrsStore((s) => s.states);
  const streak = useSrsStore((s) => s.streak);
  const [today, setToday] = useState<DayStats | undefined>();

  useEffect(() => {
    void statsRepo.getToday(new Date()).then(setToday);
  }, [states]);

  const concepts = seedSource.getConcepts();
  const started = concepts.filter((c) => states[c.id]);

  // Weak points: aggregate error patterns across concepts (PDR §7.4 step 4).
  const weak = new Map<ErrorTag, { count: number; concepts: Set<string> }>();
  for (const m of Object.values(states)) {
    for (const [tag, count] of Object.entries(m.errorPatterns)) {
      const entry = weak.get(tag as ErrorTag) ?? { count: 0, concepts: new Set() };
      entry.count += count;
      entry.concepts.add(m.conceptId);
      weak.set(tag as ErrorTag, entry);
    }
  }
  const weakest = [...weak.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  return (
    <div className="stats">
      <article className="card">
        <p className="card__kicker">Today</p>
        <div className="summary-stats">
          <span>
            <strong>{streak}</strong> day streak
          </span>
          <span>
            {today?.cardsSeen ?? 0} cards · {today?.correct ?? 0} correct ·{" "}
            {Math.round((today?.msStudied ?? 0) / 60_000)} min
          </span>
        </div>
      </article>

      {weakest.length > 0 && (
        <article className="card">
          <p className="card__kicker">Weak points</p>
          <ul className="stats__list">
            {weakest.map(([tag, { count, concepts: cs }]) => (
              <li key={tag}>
                <span className="stats__tag">{tag.replaceAll("_", " ")}</span>
                <span className="card__body">
                  ×{count} · {[...cs].join(", ")}
                </span>
              </li>
            ))}
          </ul>
          <p className="card__why card__body">
            The feed is already prioritising drills that target these.
          </p>
        </article>
      )}

      <article className="card">
        <p className="card__kicker">
          Curriculum · {started.length}/{concepts.length} started
        </p>
        <ul className="stats__list">
          {concepts.map((c) => {
            const m = states[c.id];
            const status = m?.status ?? "new";
            return (
              <li key={c.id}>
                <span className={`stats__status stats__status--${status}`}>
                  {status === "mastered" ? <Star size={11} /> : STATUS_ICON[status]}
                </span>
                <span>{c.title}</span>
                <span className="card__body stats__due">
                  {m && status !== "new"
                    ? dueLabel(new Date(m.due))
                    : m
                      ? "learning"
                      : "locked / unseen"}
                </span>
              </li>
            );
          })}
        </ul>
      </article>
    </div>
  );
}

function dueLabel(due: Date): string {
  const days = Math.round((due.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "due now";
  if (days === 1) return "due tomorrow";
  return `due in ${days}d`;
}
