import { useState, type FormEvent } from "react";
import type { ExerciseCard } from "@/content/schema/schema";
import { checkAnswer, type CheckVerdict } from "@/domain/answer/check";

export function FillBlank({
  card,
  answered,
  onAnswer,
}: {
  card: ExerciseCard;
  answered: boolean;
  onAnswer: (verdict: CheckVerdict, given: string) => void;
}) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (answered || value.trim() === "") return;
    const result = checkAnswer(value, card.answer, card.alternates);
    onAnswer(result.verdict, value);
  };

  return (
    <form className="answer-row" onSubmit={submit}>
      <input
        className="answer-input"
        lang="tr"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={answered}
        placeholder="Type in Turkish…"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Your answer"
      />
      <button className="btn" type="submit" disabled={answered || value.trim() === ""}>
        Check
      </button>
    </form>
  );
}
