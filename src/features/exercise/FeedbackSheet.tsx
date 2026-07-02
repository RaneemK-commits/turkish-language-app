import type { ExerciseCard } from "@/content/schema/schema";
import type { CheckVerdict } from "@/domain/answer/check";
import { Star } from "@/ui/icons";

const VERDICT_LABEL: Record<CheckVerdict, string> = {
  correct: "Correct",
  typo: "Close — watch the spelling",
  incorrect: "Not quite",
};

/**
 * The explanatory sheet — slides up after every answer, right or wrong,
 * and always teaches the rule (PDR §2: the core differentiator).
 */
export function FeedbackSheet({
  card,
  verdict,
  onDismiss,
}: {
  card: ExerciseCard;
  verdict: CheckVerdict | null;
  onDismiss: () => void;
}) {
  const open = verdict !== null;
  return (
    <div
      className={`sheet${open ? " sheet--open" : ""}${verdict ? ` sheet--${verdict}` : ""}`}
      role="dialog"
      aria-live="polite"
      aria-hidden={!open}
    >
      {verdict && (
        <>
          <p className={`sheet__verdict sheet__verdict--${verdict}`}>
            <span className="sheet__star">
              <Star size={15} />
            </span>
            {VERDICT_LABEL[verdict]}
          </p>
          {verdict !== "correct" && (
            <p className="sheet__answer" lang="tr">
              → {card.answer[0]}
            </p>
          )}
          <p className="sheet__rule">{card.explanation.rule}</p>
          <p className="sheet__why">{card.explanation.why}</p>
          <button className="btn btn--block" onClick={onDismiss}>
            Got it
          </button>
        </>
      )}
    </div>
  );
}
