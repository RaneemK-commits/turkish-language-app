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
import { useUiStore } from "@/store/uiStore";
import { StarOutline } from "@/ui/icons";

const GRADES: { rating: Rating; label: string; hint: string }[] = [
  { rating: "again", label: "Again", hint: "forgot" },
  { rating: "hard", label: "Hard", hint: "struggled" },
  { rating: "good", label: "Good", hint: "got it" },
  { rating: "easy", label: "Easy", hint: "instant" },
];

export function DeckView() {
  const states = useSrsStore((s) => s.states);
  const applyReview = useSrsStore((s) => s.applyReview);
  const setTab = useUiStore((s) => s.setTab);

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
        <div className="empty">
          <span className="empty__star">
            <StarOutline />
          </span>
          <p className="empty__title">Deck's clear</p>
          <p className="empty__body">
            Reviews appear here when the scheduler says a concept needs
            refreshing.
          </p>
          <button className="btn--text" onClick={() => setTab("feed")}>
            Scroll the feed
          </button>
        </div>
      </div>
    );

  if (pos >= deck.length)
    return (
      <div className="deck deck--empty">
        <div className="empty">
          <span className="empty__star">
            <StarOutline />
          </span>
          <p className="empty__title">Deck cleared</p>
          <p className="empty__body">{deck.length} concepts reviewed.</p>
          <button className="btn--text" onClick={() => setTab("feed")}>
            Back to the feed
          </button>
        </div>
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
