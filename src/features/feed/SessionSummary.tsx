import { useShallow } from "zustand/react/shallow";
import { useFeedStore, selectStats } from "@/store/feedStore";

export function SessionSummary() {
  const stats = useFeedStore(useShallow(selectStats));
  const pct =
    stats.answered === 0 ? 0 : Math.round((stats.correct / stats.answered) * 100);

  return (
    <article className="card" aria-label="Session summary">
      <p className="card__kicker">Session complete</p>
      <div className="summary-stats">
        <span>
          <strong>{pct}%</strong>
        </span>
        <span>
          {stats.correct} correct · {stats.incorrect} to revisit ·{" "}
          {stats.answered} answered
        </span>
        <span className="card__body">
          That's every authored card. Phase 2 brings the FSRS engine — reviews
          will come due and the feed becomes endless.
        </span>
      </div>
    </article>
  );
}
