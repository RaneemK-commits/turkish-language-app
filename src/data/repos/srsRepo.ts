import { db } from "@/data/db";
import type { ConceptMemory } from "@/domain/srs/scheduler.types";

export const srsRepo = {
  async getAll(): Promise<Map<string, ConceptMemory>> {
    const rows = await db.srs.toArray();
    return new Map(rows.map((r) => [r.conceptId, r]));
  },
  async put(memory: ConceptMemory): Promise<void> {
    await db.srs.put(memory);
  },
};
