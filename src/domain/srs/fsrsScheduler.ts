/**
 * FSRS implementation of the Scheduler interface, wrapping ts-fsrs.
 * Fuzz is disabled for determinism (testability; feed order stays stable).
 */
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating as FsrsRating,
  State,
  type Card,
  type Grade,
} from "ts-fsrs";
import type { ConceptMemory, Rating, Scheduler } from "./scheduler.types";

/** Stability (days) above which a Review-state concept counts as mastered. */
const MASTERED_STABILITY_DAYS = 21;

const RATING_MAP: Record<Rating, Grade> = {
  again: FsrsRating.Again,
  hard: FsrsRating.Hard,
  good: FsrsRating.Good,
  easy: FsrsRating.Easy,
};

const engine = fsrs(generatorParameters({ enable_fuzz: false }));

function toStatus(card: Card): ConceptMemory["status"] {
  switch (card.state) {
    case State.New:
      return "new";
    case State.Learning:
    case State.Relearning:
      return "learning";
    case State.Review:
      return card.stability >= MASTERED_STABILITY_DAYS ? "mastered" : "review";
  }
}

function toMemory(
  conceptId: string,
  card: Card,
  errorPatterns: ConceptMemory["errorPatterns"],
): ConceptMemory {
  return {
    conceptId,
    status: toStatus(card),
    stability: card.stability,
    difficulty: card.difficulty,
    due: new Date(card.due).toISOString(),
    lastReview: card.last_review
      ? new Date(card.last_review).toISOString()
      : null,
    reps: card.reps,
    lapses: card.lapses,
    errorPatterns,
    schedulerState: serializeCard(card),
  };
}

/** Dates → ISO strings so the state survives any storage/JSON round-trip. */
function serializeCard(card: Card): unknown {
  return {
    ...card,
    due: new Date(card.due).toISOString(),
    last_review: card.last_review
      ? new Date(card.last_review).toISOString()
      : undefined,
  };
}

function reviveCard(state: unknown): Card {
  const raw = state as Card & { due: string | Date; last_review?: string | Date };
  return {
    ...raw,
    due: new Date(raw.due),
    last_review: raw.last_review ? new Date(raw.last_review) : undefined,
  };
}

export const fsrsScheduler: Scheduler = {
  initial(conceptId, now) {
    return toMemory(conceptId, createEmptyCard(now), {});
  },

  review(memory, rating, now) {
    const card = reviveCard(memory.schedulerState);
    const { card: next } = engine.next(card, now, RATING_MAP[rating]);
    return toMemory(memory.conceptId, next, memory.errorPatterns);
  },
};
