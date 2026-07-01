/**
 * Scheduler abstraction (PDR §7.1): FSRS is the implementation, but the
 * interface lets us swap in SM-2 for comparison without touching callers.
 * The reviewable unit is the CONCEPT (PDR §7.2).
 */
import type { ErrorTag } from "@/content/schema/schema";

export type Rating = "again" | "hard" | "good" | "easy";

export type ConceptStatus = "new" | "learning" | "review" | "mastered";

/** One memory state per concept — persisted verbatim in Dexie. */
export interface ConceptMemory {
  conceptId: string;
  status: ConceptStatus;
  /** FSRS stability (days) & difficulty — copied out for display/queries. */
  stability: number;
  difficulty: number;
  due: string; // ISO 8601
  lastReview: string | null;
  reps: number;
  lapses: number;
  errorPatterns: Partial<Record<ErrorTag, number>>;
  /** The scheduler's own serialized state (ts-fsrs Card) — version-proof. */
  schedulerState: unknown;
}

export interface Scheduler {
  /** Create the memory state for a concept's first-ever review. */
  initial(conceptId: string, now: Date): ConceptMemory;
  /** Apply one graded review and return the next state (pure — no mutation). */
  review(memory: ConceptMemory, rating: Rating, now: Date): ConceptMemory;
}
