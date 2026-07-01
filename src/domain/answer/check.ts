/**
 * Answer checking (CONTENT_AUTHORING.md §6):
 *   exact match (normalized)  → "correct"
 *   Levenshtein ≤ 1           → "typo"      (still passes, gentler feedback)
 *   otherwise                 → "incorrect"
 */
import { normalize } from "./normalize";
import { isVowel } from "@/domain/turkish/harmony";

export type CheckVerdict = "correct" | "typo" | "incorrect";

export interface CheckResult {
  verdict: CheckVerdict;
  /** The accepted answer the input was closest to (for feedback display). */
  matched: string;
}

export function checkAnswer(
  input: string,
  answers: readonly string[],
  alternates: readonly string[] = [],
): CheckResult {
  const accepted = [...answers, ...alternates];
  const norm = normalize(input);

  for (const a of accepted) {
    if (normalize(a) === norm) return { verdict: "correct", matched: a };
  }
  for (const a of accepted) {
    const target = normalize(a);
    if (levenshtein(target, norm) <= 1 && !isVowelSubstitution(target, norm))
      return { verdict: "typo", matched: a };
  }
  return { verdict: "incorrect", matched: answers[0] ?? "" };
}

/**
 * Turkish-aware refinement: a single edit that swaps one vowel for another
 * (evlar↔evler, gözlür↔gözler) is almost always a HARMONY error, not a slip
 * of the finger — grade it as incorrect so the rule gets retaught.
 */
function isVowelSubstitution(a: string, b: string): boolean {
  if (a.length !== b.length) return false; // insertions/deletions stay typos
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      // first (and only, at distance ≤1) differing position
      return isVowel(a[i]!) && isVowel(b[i]!);
    }
  }
  return false;
}

/** Classic two-row Levenshtein — inputs here are short answer strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j]! + 1, // deletion
        curr[j - 1]! + 1, // insertion
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1), // substitution
      );
    }
    prev = curr;
  }
  return prev[b.length]!;
}
