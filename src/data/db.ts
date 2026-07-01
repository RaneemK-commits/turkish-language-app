/**
 * Dexie (IndexedDB) skeleton — stores per PDR §15.3.
 * Content is NOT stored here; it ships in the bundle (SeedSource).
 * Repos in src/data/repos/ wrap these tables from Phase 2 on.
 */
import Dexie, { type EntityTable } from "dexie";
import type { ErrorTag } from "@/content/schema/schema";

export type ConceptStatus = "new" | "learning" | "review" | "mastered";

/** One FSRS memory state per concept (PDR §7.2). */
export interface UserConceptState {
  conceptId: string;
  status: ConceptStatus;
  stability: number;
  difficulty: number;
  due: string; // ISO 8601
  lastReview: string | null;
  reps: number;
  lapses: number;
  errorPatterns: Partial<Record<ErrorTag, number>>;
}

/** Per-day session statistics powering streaks and the stats view. */
export interface DayStats {
  date: string; // YYYY-MM-DD (local)
  cardsSeen: number;
  correct: number;
  incorrect: number;
  msStudied: number;
}

/** Singleton app settings (key = "settings"). */
export interface Settings {
  key: "settings";
  ttsEnabled: boolean;
  reducedMotion: boolean;
  lastSessionAt: string | null;
}

/** Raw answer log (optional analytics/debug — PDR §15.3). */
export interface Attempt {
  id?: number; // auto-increment
  at: string;
  exerciseId: string;
  conceptId: string;
  correct: boolean;
  usedHint: boolean;
  msToAnswer: number;
}

export class AkisDb extends Dexie {
  srs!: EntityTable<UserConceptState, "conceptId">;
  stats!: EntityTable<DayStats, "date">;
  settings!: EntityTable<Settings, "key">;
  attempts!: EntityTable<Attempt, "id">;

  constructor() {
    super("akis");
    this.version(1).stores({
      srs: "conceptId, due, status",
      stats: "date",
      settings: "key",
      attempts: "++id, exerciseId, conceptId, at",
    });
  }
}

export const db = new AkisDb();

/**
 * Ask the browser not to evict IndexedDB under storage pressure (iOS caveat,
 * PDR §10). Best-effort; export/import of progress is the real safety valve.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage?.persist) {
    return navigator.storage.persist();
  }
  return false;
}
