/**
 * DeckView — the classic flashcard mode (pulled into core, PDR §4).
 * Deck = concepts due now. Front: a sampled exercise prompt. Reveal → answer +
 * rule. Self-grade Again/Hard/Good/Easy feeds the SAME scheduler as the feed.
 */
import { useMemo, useState } from "react";
import { seedSource } from "@/content/source/SeedSource";
import type { Rating } from "@/domain/srs/scheduler.types";
import { pickExercises } from "@/domain/feed/buildFeed";
import { statsRepo } from "@/data/repos/statsRepo";
import { useSrsStore, selectDueConceptIds } from "@/store/srsStore";

const GRADES: { rating: Rating; label: string; hint: string }[] = [
  { rating: "again", label: "Again", hint: "forgot" },
  { rating: "hard", label: "Hard", hint: "struggled" },
  { rating: "good", label: "Good", hint: "got it" },
  { rating: "easy", label: "Easy", hint: "instant" },
];

export function DeckView() {
  const states = useSrsStore((s) => s.states);
  const applyReview = useSrsStore((s) => s.applyReview);

  // Deck is frozen at mount so grading doesn't reshuffle it underneath you.
  const deck = useMemo(() => {
    const due = selectDueConceptIds(states, new Date());
    return due.flatMap((conceptId) => {
      const concept = seedSource.getConcepts().find((c) => c.id === conceptId);
      const memory = states[conceptId];
      if (!concept || !memory) return [];
      const [card] = pickExercises(seedSource, concept, memory, 1);
      return card ? [{ concept, card }] : [];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (deck.length === 0)
    return (
      <div className="deck deck--empty">
        <article className="card">
          <p className="card__kicker">Deck</p>
          <p className="card__prompt">Nothing due right now 🎉</p>
          <p className="card__body">
            Reviews appear here when the scheduler says a concept needs
            refreshing. Keep scrolling the feed to seed it.
          </p>
        </article>
      </div>
    );

  if (pos >= deck.length)
    return (
      <div className="deck deck--empty">
        <article className="card">
          <p className="card__kicker">Deck</p>
          <p className="card__prompt">Deck cleared ✓</p>
          <p className="card__body">{deck.length} concepts reviewed.</p>
        </article>
      </div>
    );

  const { concept, card } = deck[pos]!;

  const grade = (rating: Rating) => {
    applyReview({ conceptId: concept.id, rating, failedTags: card.targets });
    void statsRepo
      .bump(new Date(), { correct: rating !== "again", ms: 0 })
      .catch(console.error);
    setRevealed(false);
    setPos((p) => p + 1);
  };

  return (
    <div className="deck">
      <p className="deck__count">
        {pos + 1} / {deck.length} due
      </p>
      <article className="card" aria-label={`Flashcard: ${concept.title}`}>
        <p className="card__kicker">{concept.title}</p>
        <p className="card__prompt" lang="tr">
          {card.prompt}
        </p>
        {revealed && (
          <>
            <p className="sheet__answer" lang="tr">
              → {card.answer[0]}
            </p>
            <p className="sheet__rule">{card.explanation.rule}</p>
            <p className="sheet__why">{card.explanation.why}</p>
          </>
        )}
      </article>
      {revealed ? (
        <div className="deck__grades">
          {GRADES.map(({ rating, label, hint }) => (
            <button
              key={rating}
              className={`btn deck__grade deck__grade--${rating}`}
              onClick={() => grade(rating)}
            >
              {label}
              <small>{hint}</small>
            </button>
          ))}
        </div>
      ) : (
        <button className="btn btn--block" onClick={() => setRevealed(true)}>
          Reveal
        </button>
      )}
    </div>
  );
}
