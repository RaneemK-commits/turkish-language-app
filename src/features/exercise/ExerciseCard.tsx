import { useState } from "react";
import type { Concept, ExerciseCard as ExerciseCardData } from "@/content/schema/schema";
import type { CheckVerdict } from "@/domain/answer/check";
import { useFeedStore } from "@/store/feedStore";
import { ChoiceList } from "./formats/ChoiceList";
import { FillBlank } from "./formats/FillBlank";
import { FeedbackSheet } from "./FeedbackSheet";

const LEVEL_LABEL = ["", "L1 · recognise", "L2 · cued", "L3 · produce", "L4 · integrate"];

export function ExerciseCard({
  concept,
  card,
  onComplete,
}: {
  concept: Concept;
  card: ExerciseCardData;
  onComplete: () => void;
}) {
  const recordResult = useFeedStore((s) => s.recordResult);
  const answered = useFeedStore((s) => card.id in s.results);
  const [pending, setPending] = useState<{ verdict: CheckVerdict; given: string } | null>(null);
  const verdict = pending?.verdict ?? null;

  // Sheet opens on answer; the result is recorded on dismiss so the
  // advance-lock releases only after the explanation was seen.
  const handleAnswer = (v: CheckVerdict, given: string) =>
    setPending({ verdict: v, given });

  const dismiss = () => {
    if (!pending) return;
    recordResult(card.id, pending);
    setPending(null); // close the sheet — the card stays mounted behind us
    onComplete();
  };

  const body = (() => {
    switch (card.format) {
      case "multiple_choice":
        return (
          <ChoiceList card={card} variant="options" answered={answered} onAnswer={handleAnswer} />
        );
      case "suffix_match":
        return (
          <ChoiceList card={card} variant="tiles" answered={answered} onAnswer={handleAnswer} />
        );
      case "fill_blank":
      case "translate":
        return <FillBlank card={card} answered={answered} onAnswer={handleAnswer} />;
      default:
        return <p className="card__body">({card.format} arrives in a later phase)</p>;
    }
  })();

  return (
    <>
      <article className="card" aria-label={`Exercise: ${concept.title}`}>
        <p className="card__kicker">
          {concept.title} · {LEVEL_LABEL[card.difficulty]}
        </p>
        <p className="card__prompt" lang="tr">
          {card.prompt}
        </p>
        {body}
      </article>
      <FeedbackSheet card={card} verdict={verdict} onDismiss={dismiss} />
    </>
  );
}
