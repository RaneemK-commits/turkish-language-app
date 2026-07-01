/**
 * Dependency-graph gating (PDR §7.4 step 2): a concept unlocks only when
 * every prerequisite has graduated (status review or mastered).
 */
import type { Concept } from "@/content/schema/schema";
import type { ConceptMemory } from "@/domain/srs/scheduler.types";

export function isUnlocked(
  concept: Concept,
  states: ReadonlyMap<string, ConceptMemory>,
): boolean {
  return concept.prereqs.every((p) => {
    const s = states.get(p);
    return s?.status === "review" || s?.status === "mastered";
  });
}
