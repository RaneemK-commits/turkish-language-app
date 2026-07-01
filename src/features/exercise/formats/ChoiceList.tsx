/**
 * Shared tap-to-answer list used by multiple_choice (vertical options) and
 * suffix_match (horizontal tiles). Grading is immediate on tap.
 */
import { useState } from "react";
import type { ExerciseCard } from "@/content/schema/schema";
import type { CheckVerdict } from "@/domain/answer/check";
import { seededShuffle } from "@/ui/seededShuffle";

export function ChoiceList({
  card,
  variant,
  answered,
  onAnswer,
}: {
  card: ExerciseCard;
  variant: "options" | "tiles";
  answered: boolean;
  onAnswer: (verdict: CheckVerdict, given: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const choices = seededShuffle(
    [...card.answer.slice(0, 1), ...card.distractors],
    card.id,
  );
  const correctSet = new Set(card.answer);

  const pick = (choice: string) => {
    if (answered || picked) return;
    setPicked(choice);
    onAnswer(correctSet.has(choice) ? "correct" : "incorrect", choice);
  };

  return (
    <div className={variant === "tiles" ? "tiles" : "options"}>
      {choices.map((choice) => {
        let cls = "option";
        if (picked) {
          if (choice === picked)
            cls += correctSet.has(choice)
              ? " option--picked-correct"
              : " option--picked-incorrect";
          else if (correctSet.has(choice)) cls += " option--reveal-correct";
        }
        return (
          <button
            key={choice}
            className={cls}
            disabled={answered || picked !== null}
            onClick={() => pick(choice)}
            lang="tr"
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}
