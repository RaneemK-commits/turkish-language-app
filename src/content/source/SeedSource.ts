/**
 * SeedSource — reads the bundled, CI-validated content JSON.
 * Vite eagerly inlines these at build time, so the whole bank ships in the
 * bundle and is covered by the service-worker precache.
 */
import type { Concept, ExerciseCard, LessonCard } from "@/content/schema/schema";
import type { ContentSource } from "./ContentSource";
import conceptsJson from "@/content/concepts.json";

const lessonModules = import.meta.glob<{ default: LessonCard }>(
  "@/content/lessons/*.json",
  { eager: true },
);
const exerciseModules = import.meta.glob<{ default: ExerciseCard[] }>(
  "@/content/exercises/*.json",
  { eager: true },
);

const concepts = (conceptsJson as Concept[]).slice().sort((a, b) => a.order - b.order);

const lessons = new Map<string, LessonCard>();
for (const mod of Object.values(lessonModules)) {
  lessons.set(mod.default.conceptId, mod.default);
}

const exercises = new Map<string, ExerciseCard[]>();
for (const mod of Object.values(exerciseModules)) {
  const cards = mod.default;
  if (cards.length > 0) exercises.set(cards[0]!.conceptId, cards);
}

export const seedSource: ContentSource = {
  getConcepts: () => concepts,
  getLesson: (conceptId) => lessons.get(conceptId),
  getExercises: (conceptId) => exercises.get(conceptId) ?? [],
};
