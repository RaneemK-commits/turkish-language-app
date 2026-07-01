/**
 * Grade derivation (PDR §7.3): exercise result → FSRS rating.
 *   correct + fast + no hint → easy
 *   correct                  → good
 *   correct w/ typo or hint  → hard
 *   incorrect                → again
 */
import type { CheckVerdict } from "@/domain/answer/check";
import type { Rating } from "./scheduler.types";

/** Answering faster than this (per difficulty level) counts as "fast". */
const FAST_MS_BY_DIFFICULTY = [0, 5_000, 8_000, 12_000, 20_000] as const;

export function deriveRating(input: {
  verdict: CheckVerdict;
  msToAnswer: number;
  usedHint?: boolean;
  difficulty: number; // 1–4
}): Rating {
  if (input.verdict === "incorrect") return "again";
  if (input.verdict === "typo" || input.usedHint) return "hard";
  const fastMs = FAST_MS_BY_DIFFICULTY[input.difficulty] ?? 8_000;
  return input.msToAnswer <= fastMs ? "easy" : "good";
}
