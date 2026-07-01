import { useShallow } from "zustand/react/shallow";
import { useFeedStore, selectStats } from "@/store/feedStore";
import { useSrsStore } from "@/store/srsStore";

export function SessionSummary() {
  const stats = useFeedStore(useShallow(selectStats));
  const startSession = useFeedStore((s) => s.startSession);
  const streak = useSrsStore((s) => s.streak);
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
        <span>🔥 {streak}-day streak</span>
        <span className="card__body">
          Reviews are scheduled — anything you missed comes back sooner.
        </span>
      </div>
      <button className="btn btn--block" onClick={() => void startSession()}>
        New session
      </button>
    </article>
  );
}
