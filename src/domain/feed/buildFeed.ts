/**
 * The session builder (PDR §7.4) — pure and deterministic for a given input.
 *
 *   1. Due reviews (due ≤ now), most overdue first, capped at maxReviewShare.
 *   2. New material: next concepts whose prereqs graduated, in curriculum order.
 *   3. Interleave ~2 review cards per 1 new card.
 *   4. Weak-point injection: a concept's dominant errorPattern biases exercise
 *      selection toward cards that target it.
 *   5. If the session is short, pad with extra practice from introduced
 *      concepts (keeps early sessions from feeling empty).
 */
import type { Concept, ExerciseCard } from "@/content/schema/schema";
import type { ContentSource } from "@/content/source/ContentSource";
import type { ConceptMemory } from "@/domain/srs/scheduler.types";
import { isUnlocked } from "./prereqGate";
import { interleave } from "./interleave";
import type { FeedItem } from "./linearFeed";

export interface FeedConfig {
  sessionSize: number;
  maxReviewShare: number; // reviews never crowd out progress (PDR: ≤0.6)
  newConceptsPerSession: number;
  exercisesPerReview: number;
  exercisesPerNewConcept: number;
  interleaveRatio: number; // review cards per new card
}

export const DEFAULT_FEED_CONFIG: FeedConfig = {
  sessionSize: 30,
  maxReviewShare: 0.6,
  newConceptsPerSession: 2,
  exercisesPerReview: 3,
  exercisesPerNewConcept: 4,
  interleaveRatio: 2,
};

export function buildFeed(
  source: ContentSource,
  states: ReadonlyMap<string, ConceptMemory>,
  now: Date,
  config: FeedConfig = DEFAULT_FEED_CONFIG,
): FeedItem[] {
  const concepts = source.getConcepts().filter(hasContent(source));

  // ---- 1. due reviews, most overdue first ----
  const due = concepts
    .filter((c) => {
      const s = states.get(c.id);
      return s && s.status !== "new" && new Date(s.due).getTime() <= now.getTime();
    })
    .sort((a, b) => dueTime(states, a) - dueTime(states, b));

  const reviewBudget = Math.floor(config.sessionSize * config.maxReviewShare);
  const reviewConcepts = due.slice(
    0,
    Math.max(1, Math.floor(reviewBudget / config.exercisesPerReview)),
  );

  const reviewCards: FeedItem[] = [];
  for (const concept of reviewConcepts) {
    const memory = states.get(concept.id)!;
    for (const card of pickExercises(source, concept, memory, config.exercisesPerReview)) {
      reviewCards.push({ kind: "exercise", concept, card });
    }
  }

  // ---- 2. new material behind the prereq gate ----
  const fresh: FeedItem[] = [];
  const newConcepts = concepts
    .filter((c) => {
      const s = states.get(c.id);
      return (!s || s.status === "new") && isUnlocked(c, states);
    })
    .slice(0, config.newConceptsPerSession);

  for (const concept of newConcepts) {
    const lesson = source.getLesson(concept.id);
    if (lesson) fresh.push({ kind: "lesson", concept, card: lesson });
    const intro = source
      .getExercises(concept.id)
      .slice()
      .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id))
      .slice(0, config.exercisesPerNewConcept);
    for (const card of intro) fresh.push({ kind: "exercise", concept, card });
  }

  // ---- 3. interleave ----
  let items = interleave(reviewCards, fresh, config.interleaveRatio);

  // ---- 5. pad short sessions with extra practice ----
  if (items.length < config.sessionSize) {
    const used = new Set(
      items.flatMap((i) => (i.kind === "exercise" ? [i.card.id] : [])),
    );
    outer: for (const concept of newConcepts.length > 0 ? newConcepts : reviewConcepts) {
      for (const card of source.getExercises(concept.id)) {
        if (items.length >= config.sessionSize) break outer;
        if (used.has(card.id)) continue;
        items.push({ kind: "exercise", concept, card });
        used.add(card.id);
      }
    }
  }

  items = items.slice(0, config.sessionSize);
  items.push({ kind: "summary" });
  return items;
}

/**
 * Exercise selection for a review (PDR §7.4 step 4):
 *  - difficulty band follows mastery (learning → easier, mastered → harder)
 *  - cards targeting the concept's dominant error tags float to the front
 *  - rotation by rep count so consecutive sessions see different cards
 */
export function pickExercises(
  source: ContentSource,
  concept: Concept,
  memory: ConceptMemory,
  count: number,
): ExerciseCard[] {
  const all = source.getExercises(concept.id);
  if (all.length === 0) return [];

  const band: [number, number] =
    memory.status === "learning"
      ? [1, 2]
      : memory.status === "mastered"
        ? [3, 4]
        : [2, 3];

  const topErrors = Object.entries(memory.errorPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([tag]) => tag);

  const score = (card: ExerciseCard): number => {
    let s = 0;
    if (card.difficulty >= band[0] && card.difficulty <= band[1]) s += 2;
    if (topErrors.some((t) => card.targets.includes(t as never))) s += 3; // weak-point boost
    return s;
  };

  // Stable rotation: shift the candidate order by rep count.
  const rotated = all
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((card, i, arr) => ({ card, order: (i + memory.reps) % arr.length }));

  return rotated
    .sort((a, b) => score(b.card) - score(a.card) || a.order - b.order)
    .slice(0, count)
    .map((x) => x.card);
}

function hasContent(source: ContentSource) {
  return (c: Concept) =>
    source.getLesson(c.id) !== undefined || source.getExercises(c.id).length > 0;
}

function dueTime(states: ReadonlyMap<string, ConceptMemory>, c: Concept): number {
  return new Date(states.get(c.id)!.due).getTime();
}
