/**
 * Answer normalization (CONTENT_AUTHORING.md §6): both the learner's input and
 * the card's accepted answers pass through this before comparison.
 */
import { toLowerTr } from "@/domain/turkish/harmony";

export function normalize(input: string): string {
  return toLowerTr(input)
    .replace(/[’‘`´]/g, "'") // fold apostrophe variants to ASCII '
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?]+$/g, ""); // trailing sentence punctuation is not part of the answer
}
