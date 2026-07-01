import { db, type DayStats } from "@/data/db";
import { currentStreak, localDateKey } from "@/domain/stats/streak";

export const statsRepo = {
  /** Accumulate one answered card into today's row. */
  async bump(now: Date, delta: { correct: boolean; ms: number }): Promise<void> {
    const date = localDateKey(now);
    await db.transaction("rw", db.stats, async () => {
      const row: DayStats = (await db.stats.get(date)) ?? {
        date,
        cardsSeen: 0,
        correct: 0,
        incorrect: 0,
        msStudied: 0,
      };
      row.cardsSeen += 1;
      row.correct += delta.correct ? 1 : 0;
      row.incorrect += delta.correct ? 0 : 1;
      row.msStudied += delta.ms;
      await db.stats.put(row);
    });
  },

  async getToday(now: Date): Promise<DayStats | undefined> {
    return db.stats.get(localDateKey(now));
  },

  async getStreak(now: Date): Promise<number> {
    const rows = await db.stats.toArray();
    const active = new Set(rows.filter((r) => r.cardsSeen > 0).map((r) => r.date));
    return currentStreak(active, now);
  },
};
