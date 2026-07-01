/**
 * The seam that keeps dynamic generation a drop-in later (PDR §15.5).
 * SeedSource is the only implementation in this revision.
 */
import type { Concept, ExerciseCard, LessonCard } from "@/content/schema/schema";

export interface ContentSource {
  getConcepts(): Concept[];
  getLesson(conceptId: string): LessonCard | undefined;
  getExercises(conceptId: string): ExerciseCard[];
}
