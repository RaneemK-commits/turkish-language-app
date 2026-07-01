import { useEffect, useRef, useState } from "react";
import type { Concept, ExerciseCard as ExerciseCardData } from "@/content/schema/schema";
import type { CheckVerdict } from "@/domain/answer/check";
import type { FeedItem } from "@/domain/feed/linearFeed";
import { useFeedStore } from "@/store/feedStore";
import { ChoiceList } from "./formats/ChoiceList";
import { FillBlank } from "./formats/FillBlank";
import { FeedbackSheet } from "./FeedbackSheet";

const LEVEL_LABEL = ["", "L1 · recognise", "L2 · cued", "L3 · produce", "L4 · integrate"];

export function ExerciseCard({
  concept,
  card,
  active,
  onComplete,
}: {
  concept: Concept;
  card: ExerciseCardData;
  /** true while this card is the one snapped into view — starts the clock */
  active: boolean;
  onComplete: () => void;
}) {
  const recordExercise = useFeedStore((s) => s.recordExercise);
  const answered = useFeedStore((s) => card.id in s.results);
  const [pending, setPending] = useState<{ verdict: CheckVerdict; given: string } | null>(null);
  const activeAt = useRef<number | null>(null);

  useEffect(() => {
    if (active && activeAt.current === null) activeAt.current = Date.now();
  }, [active]);

  const handleAnswer = (verdict: CheckVerdict, given: string) =>
    setPending({ verdict, given });

  const dismiss = () => {
    if (!pending) return;
    const msToAnswer = activeAt.current ? Date.now() - activeAt.current : 30_000;
    const item: Extract<FeedItem, { kind: "exercise" }> = {
      kind: "exercise",
      concept,
      card,
    };
    recordExercise(item, { ...pending, msToAnswer });
    setPending(null);
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
      <FeedbackSheet card={card} verdict={pending?.verdict ?? null} onDismiss={dismiss} />
    </>
  );
}
