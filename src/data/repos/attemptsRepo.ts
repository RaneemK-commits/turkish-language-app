import { db, type Attempt } from "@/data/db";

export const attemptsRepo = {
  async add(attempt: Omit<Attempt, "id">): Promise<void> {
    await db.attempts.add(attempt as Attempt);
  },
};
