/**
 * Owns the per-concept memory states and the single write path for reviews —
 * both the feed and the deck grade through applyReview, so scheduling,
 * persistence, and stats can never drift apart.
 */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ErrorTag } from "@/content/schema/schema";
import type { ConceptMemory, Rating } from "@/domain/srs/scheduler.types";
import { fsrsScheduler } from "@/domain/srs/fsrsScheduler";
import { srsRepo } from "@/data/repos/srsRepo";
import { statsRepo } from "@/data/repos/statsRepo";
import { localDateKey } from "@/domain/stats/streak";
import { db } from "@/data/db";

interface SrsState {
  states: Record<string, ConceptMemory>;
  streak: number;
  loaded: boolean;
  load: () => Promise<void>;
  applyReview: (input: {
    conceptId: string;
    rating: Rating;
    /** error tags to bump when the review failed */
    failedTags?: ErrorTag[];
    now?: Date;
  }) => ConceptMemory;
  refreshStreak: () => Promise<void>;
}

export const useSrsStore = create<SrsState>()(
  immer((set, get) => ({
    states: {},
    streak: 0,
    loaded: false,

    load: async () => {
      const map = await srsRepo.getAll();
      const streak = await statsRepo.getStreak(new Date());
      set((s) => {
        s.states = Object.fromEntries(map);
        s.streak = streak;
        s.loaded = true;
      });
    },

    applyReview: ({ conceptId, rating, failedTags = [], now = new Date() }) => {
      const prev =
        get().states[conceptId] ?? fsrsScheduler.initial(conceptId, now);

      // Same-day dampening: a graduated concept gets at most ONE successful
      // scheduler update per day — otherwise a 12-exercise session compounds
      // stability into absurd intervals ("due in 170d" after day one).
      // Failures always count, and learning-state concepts always count
      // (FSRS learning steps are same-day by design).
      const graduated = prev.status === "review" || prev.status === "mastered";
      const alreadyToday =
        prev.lastReview !== null &&
        localDateKey(new Date(prev.lastReview)) === localDateKey(now);
      if (graduated && alreadyToday && rating !== "again") {
        return prev; // extra practice — stats still record, schedule unchanged
      }

      let next = fsrsScheduler.review(prev, rating, now);
      if (rating === "again" && failedTags.length > 0) {
        const patterns = { ...next.errorPatterns };
        for (const tag of failedTags) patterns[tag] = (patterns[tag] ?? 0) + 1;
        next = { ...next, errorPatterns: patterns };
      }
      set((s) => {
        s.states[conceptId] = next;
      });
      // Fire-and-forget persistence; IndexedDB writes stay off the hot path.
      void srsRepo.put(next).catch(console.error);
      return next;
    },

    refreshStreak: async () => {
      const streak = await statsRepo.getStreak(new Date());
      set((s) => {
        s.streak = streak;
      });
    },
  })),
);

/** Concepts due for review right now (drives the deck badge + deck view). */
export function selectDueConceptIds(
  states: Record<string, ConceptMemory>,
  now: Date,
): string[] {
  return Object.values(states)
    .filter((m) => m.status !== "new" && new Date(m.due).getTime() <= now.getTime())
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .map((m) => m.conceptId);
}

/** Best-effort request that iOS not evict our storage (PDR §10). */
export async function ensurePersistentStorage(): Promise<void> {
  try {
    await db.open();
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch (e) {
    console.error("storage persistence request failed", e);
  }
}
