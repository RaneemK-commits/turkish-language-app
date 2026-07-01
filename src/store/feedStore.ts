import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CheckVerdict } from "@/domain/answer/check";
import type { FeedItem } from "@/domain/feed/linearFeed";

export interface ExerciseResult {
  verdict: CheckVerdict;
  /** what the learner picked/typed — kept for the feedback sheet */
  given: string;
}

interface FeedState {
  items: FeedItem[];
  index: number;
  /** exerciseId → result; presence = answered (drives the advance lock) */
  results: Record<string, ExerciseResult>;
  init: (items: FeedItem[]) => void;
  setIndex: (index: number) => void;
  recordResult: (exerciseId: string, result: ExerciseResult) => void;
}

export const useFeedStore = create<FeedState>()(
  immer((set) => ({
    items: [],
    index: 0,
    results: {},
    init: (items) =>
      set((s) => {
        s.items = items;
        s.index = 0;
        s.results = {};
      }),
    setIndex: (index) =>
      set((s) => {
        s.index = index;
      }),
    recordResult: (exerciseId, result) =>
      set((s) => {
        s.results[exerciseId] = result;
      }),
  })),
);

/** Highest card index the learner may scroll to: everything up to (and
 *  including) the first unanswered exercise. Lessons never block. */
export function selectUnlockedMax(s: {
  items: FeedItem[];
  results: Record<string, ExerciseResult>;
}): number {
  for (let i = 0; i < s.items.length; i++) {
    const item = s.items[i]!;
    if (item.kind === "exercise" && !(item.card.id in s.results)) return i;
  }
  return s.items.length - 1;
}

export function selectStats(s: { results: Record<string, ExerciseResult> }) {
  const all = Object.values(s.results);
  const correct = all.filter((r) => r.verdict !== "incorrect").length;
  return { answered: all.length, correct, incorrect: all.length - correct };
}
