import { describe, expect, it } from "vitest";
import type { Concept, ExerciseCard, LessonCard } from "@/content/schema/schema";
import type { ContentSource } from "@/content/source/ContentSource";
import type { ConceptMemory } from "@/domain/srs/scheduler.types";
import { fsrsScheduler } from "@/domain/srs/fsrsScheduler";
import { buildFeed, DEFAULT_FEED_CONFIG, pickExercises } from "./buildFeed";
import { interleave } from "./interleave";
import { isUnlocked } from "./prereqGate";

// ---- tiny fake content bank ----

const NOW = new Date("2026-07-01T10:00:00Z");
const DAY = 86_400_000;

function concept(id: string, order: number, prereqs: string[] = []): Concept {
  return { id, tier: 1, order, title: id, prereqs, tags: [] };
}

function lesson(conceptId: string): LessonCard {
  return {
    id: `${conceptId}.lesson`,
    conceptId,
    type: "lesson",
    formula: "x",
    body: [{ kind: "rule", md: "r" }],
  };
}

function exercise(
  conceptId: string,
  n: number,
  difficulty: 1 | 2 | 3 | 4,
  targets: ExerciseCard["targets"] = ["wrong_suffix_vowel"],
): ExerciseCard {
  return {
    id: `${conceptId}.ex.${String(n).padStart(3, "0")}`,
    conceptId,
    type: "exercise",
    format: "fill_blank",
    difficulty,
    prompt: "p",
    answer: ["a"],
    alternates: [],
    distractors: [],
    explanation: { rule: "r", why: "w" },
    targets,
  };
}

function makeSource(
  concepts: Concept[],
  exercisesByConcept: Record<string, ExerciseCard[]>,
): ContentSource {
  return {
    getConcepts: () => concepts,
    getLesson: (id) => (exercisesByConcept[id] ? lesson(id) : undefined),
    getExercises: (id) => exercisesByConcept[id] ?? [],
  };
}

const A = concept("a", 1);
const B = concept("b", 2, ["a"]);
const C = concept("c", 3, ["b"]);

const bank = (id: string) =>
  [1, 1, 2, 2, 3, 3, 4, 4].map((d, i) => exercise(id, i + 1, d as 1 | 2 | 3 | 4));

const source = makeSource([A, B, C], { a: bank("a"), b: bank("b"), c: bank("c") });

/** A memory graduated to review-state, due at a given time. */
function reviewMemory(conceptId: string, dueAt: Date): ConceptMemory {
  let m = fsrsScheduler.initial(conceptId, new Date(NOW.getTime() - 10 * DAY));
  for (let i = 0; i < 4; i++)
    m = fsrsScheduler.review(m, "easy", new Date(NOW.getTime() - (9 - i) * DAY));
  return { ...m, due: dueAt.toISOString() };
}

// ---- tests ----

describe("isUnlocked", () => {
  it("gates on prereq graduation", () => {
    const states = new Map<string, ConceptMemory>();
    expect(isUnlocked(A, states)).toBe(true); // no prereqs
    expect(isUnlocked(B, states)).toBe(false);
    states.set("a", reviewMemory("a", NOW));
    expect(isUnlocked(B, states)).toBe(true);
  });
});

describe("interleave", () => {
  it("weaves ratio reviews per new card and drains the remainder", () => {
    expect(interleave([1, 2, 3, 4], [10, 20], 2)).toEqual([1, 2, 10, 3, 4, 20]);
    expect(interleave([], [10, 20], 2)).toEqual([10, 20]);
    expect(interleave([1, 2, 3], [], 2)).toEqual([1, 2, 3]);
  });
});

describe("buildFeed", () => {
  it("brand-new user: introduces only unlocked concepts", () => {
    const items = buildFeed(source, new Map(), NOW);
    const conceptIds = new Set(
      items.flatMap((i) => (i.kind === "exercise" ? [i.card.conceptId] : [])),
    );
    expect(conceptIds.has("a")).toBe(true);
    expect(conceptIds.has("b")).toBe(false); // locked behind a
    expect(items[0]).toMatchObject({ kind: "lesson" });
    expect(items.at(-1)).toMatchObject({ kind: "summary" });
  });

  it("graduating a prereq unlocks the next concept", () => {
    const states = new Map([["a", reviewMemory("a", new Date(NOW.getTime() + 5 * DAY))]]);
    const items = buildFeed(source, states, NOW);
    const lessons = items.filter((i) => i.kind === "lesson");
    expect(lessons.map((l) => (l.kind === "lesson" ? l.concept.id : ""))).toContain("b");
  });

  it("due reviews appear and interleave with new material", () => {
    const states = new Map([["a", reviewMemory("a", new Date(NOW.getTime() - DAY))]]);
    const items = buildFeed(source, states, NOW);
    const kinds = items.map((i) =>
      i.kind === "exercise" ? i.card.conceptId : i.kind,
    );
    expect(kinds).toContain("a"); // review of a
    expect(kinds).toContain("lesson"); // new concept b intro
    // review cards come before the first lesson (2:1 weave starts with reviews)
    expect(kinds.indexOf("a")).toBeLessThan(kinds.indexOf("lesson"));
  });

  it("caps total size and always ends with the summary", () => {
    const states = new Map([
      ["a", reviewMemory("a", new Date(NOW.getTime() - DAY))],
      ["b", reviewMemory("b", new Date(NOW.getTime() - DAY))],
    ]);
    const items = buildFeed(source, states, NOW, {
      ...DEFAULT_FEED_CONFIG,
      sessionSize: 10,
    });
    expect(items.length).toBeLessThanOrEqual(11);
    expect(items.at(-1)?.kind).toBe("summary");
  });

  it("is deterministic for identical inputs", () => {
    const states = new Map([["a", reviewMemory("a", new Date(NOW.getTime() - DAY))]]);
    const run = () =>
      buildFeed(source, states, NOW)
        .map((i) => (i.kind === "exercise" ? i.card.id : i.kind))
        .join(",");
    expect(run()).toBe(run());
  });
});

describe("pickExercises (weak-point injection)", () => {
  it("boosts cards targeting the dominant error pattern", () => {
    const special = exercise("a", 99, 2, ["missing_buffer_y"]);
    const withSpecial = makeSource([A], { a: [...bank("a"), special] });
    const memory: ConceptMemory = {
      ...reviewMemory("a", NOW),
      status: "review",
      errorPatterns: { missing_buffer_y: 5 },
    };
    const picked = pickExercises(withSpecial, A, memory, 3);
    expect(picked[0]!.id).toBe("a.ex.099");
  });

  it("difficulty band follows mastery", () => {
    const learning: ConceptMemory = {
      ...reviewMemory("a", NOW),
      status: "learning",
      errorPatterns: {},
    };
    const picked = pickExercises(source, A, learning, 3);
    for (const card of picked) expect(card.difficulty).toBeLessThanOrEqual(2);
  });

  it("rotates selection as reps grow", () => {
    const m1: ConceptMemory = { ...reviewMemory("a", NOW), errorPatterns: {}, reps: 0 };
    const m2: ConceptMemory = { ...m1, reps: 3 };
    const ids = (m: ConceptMemory) =>
      pickExercises(source, A, m, 3).map((c) => c.id).join(",");
    expect(ids(m1)).not.toBe(ids(m2));
  });
});
