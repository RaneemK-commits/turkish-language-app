/**
 * Phase 1 feed order: linear — for each concept (curriculum order) that has
 * content, its lesson followed by its exercises sorted by difficulty.
 * Phase 2 replaces this with the FSRS-driven buildFeed (PDR §7.4); the
 * FeedItem shape is already what that engine will emit.
 */
import type { ContentSource } from "@/content/source/ContentSource";
import type { Concept, ExerciseCard, LessonCard } from "@/content/schema/schema";

export type FeedItem =
  | { kind: "lesson"; concept: Concept; card: LessonCard }
  | { kind: "exercise"; concept: Concept; card: ExerciseCard }
  | { kind: "summary" };

export function buildLinearFeed(source: ContentSource): FeedItem[] {
  const items: FeedItem[] = [];
  for (const concept of source.getConcepts()) {
    const lesson = source.getLesson(concept.id);
    const cards = source
      .getExercises(concept.id)
      .slice()
      .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
    if (!lesson && cards.length === 0) continue; // not authored yet
    if (lesson) items.push({ kind: "lesson", concept, card: lesson });
    for (const card of cards) items.push({ kind: "exercise", concept, card });
  }
  items.push({ kind: "summary" });
  return items;
}
