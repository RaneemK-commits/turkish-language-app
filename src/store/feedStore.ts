import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CheckVerdict } from "@/domain/answer/check";
import type { FeedItem } from "@/domain/feed/linearFeed";
import { buildFeed } from "@/domain/feed/buildFeed";
import { deriveRating } from "@/domain/srs/grade";
import { seedSource } from "@/content/source/SeedSource";
import { statsRepo } from "@/data/repos/statsRepo";
import { attemptsRepo } from "@/data/repos/attemptsRepo";
import { useSrsStore } from "./srsStore";

export interface ExerciseResult {
  verdict: CheckVerdict;
  given: string;
}

interface FeedState {
  phase: "loading" | "ready";
  items: FeedItem[];
  index: number;
  /** exerciseId → result; presence = answered (drives the advance lock) */
  results: Record<string, ExerciseResult>;
  /** Build a fresh session from current SRS state. */
  startSession: () => Promise<void>;
  setIndex: (index: number) => void;
  /** Grade an answered exercise: lock-release + FSRS review + persistence. */
  recordExercise: (
    item: Extract<FeedItem, { kind: "exercise" }>,
    result: ExerciseResult & { msToAnswer: number },
  ) => void;
}

export const useFeedStore = create<FeedState>()(
  immer((set) => ({
    phase: "loading",
    items: [],
    index: 0,
    results: {},

    startSession: async () => {
      const srs = useSrsStore.getState();
      if (!srs.loaded) await srs.load();
      const states = new Map(Object.entries(useSrsStore.getState().states));
      const items = buildFeed(seedSource, states, new Date());
      set((s) => {
        s.items = items;
        s.index = 0;
        s.results = {};
        s.phase = "ready";
      });
    },

    setIndex: (index) =>
      set((s) => {
        s.index = index;
      }),

    recordExercise: (item, { verdict, given, msToAnswer }) => {
      const now = new Date();
      const card = item.card;
      set((s) => {
        s.results[card.id] = { verdict, given };
      });

      const rating = deriveRating({
        verdict,
        msToAnswer,
        difficulty: card.difficulty,
      });
      useSrsStore.getState().applyReview({
        conceptId: card.conceptId,
        rating,
        failedTags: card.targets,
        now,
      });

      void statsRepo
        .bump(now, { correct: verdict !== "incorrect", ms: msToAnswer })
        .then(() => useSrsStore.getState().refreshStreak())
        .catch(console.error);
      void attemptsRepo
        .add({
          at: now.toISOString(),
          exerciseId: card.id,
          conceptId: card.conceptId,
          correct: verdict !== "incorrect",
          usedHint: false,
          msToAnswer,
        })
        .catch(console.error);
    },
  })),
);

/** Highest card index the learner may scroll to (lessons never block). */
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
