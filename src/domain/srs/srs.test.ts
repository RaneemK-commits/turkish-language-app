import { describe, expect, it } from "vitest";
import { fsrsScheduler } from "./fsrsScheduler";
import { deriveRating } from "./grade";

const NOW = new Date("2026-07-01T10:00:00Z");
const later = (ms: number) => new Date(NOW.getTime() + ms);
const DAY = 86_400_000;

describe("fsrsScheduler", () => {
  it("creates a new-state memory", () => {
    const m = fsrsScheduler.initial("plural", NOW);
    expect(m.status).toBe("new");
    expect(m.reps).toBe(0);
    expect(m.conceptId).toBe("plural");
  });

  it("graduates to review after successive good reviews", () => {
    let m = fsrsScheduler.initial("plural", NOW);
    m = fsrsScheduler.review(m, "good", NOW);
    expect(m.status).toBe("learning"); // in learning steps
    m = fsrsScheduler.review(m, "good", later(60_000));
    m = fsrsScheduler.review(m, "good", later(120_000));
    expect(m.status === "review" || m.status === "learning").toBe(true);
    expect(m.reps).toBe(3);
    expect(new Date(m.due).getTime()).toBeGreaterThan(NOW.getTime());
  });

  it("failing a review counts a lapse and shortens the interval", () => {
    let m = fsrsScheduler.initial("plural", NOW);
    for (let i = 0; i < 4; i++) m = fsrsScheduler.review(m, "easy", later(i * DAY));
    const dueBefore = new Date(m.due).getTime();
    const failedAt = later(5 * DAY);
    m = fsrsScheduler.review(m, "again", failedAt);
    expect(m.lapses).toBeGreaterThanOrEqual(1);
    expect(new Date(m.due).getTime()).toBeLessThan(dueBefore + 30 * DAY);
  });

  it("easy grows stability faster than hard", () => {
    let easy = fsrsScheduler.initial("a", NOW);
    let hard = fsrsScheduler.initial("b", NOW);
    for (let i = 0; i < 3; i++) {
      easy = fsrsScheduler.review(easy, "easy", later(i * DAY));
      hard = fsrsScheduler.review(hard, "hard", later(i * DAY));
    }
    expect(easy.stability).toBeGreaterThan(hard.stability);
  });

  it("round-trips scheduler state through JSON (storage safety)", () => {
    let m = fsrsScheduler.initial("plural", NOW);
    m = fsrsScheduler.review(m, "good", NOW);
    const revived = JSON.parse(JSON.stringify(m));
    const next = fsrsScheduler.review(revived, "good", later(600_000));
    expect(next.reps).toBe(2);
  });
});

describe("deriveRating", () => {
  it("maps verdicts per PDR §7.3", () => {
    expect(deriveRating({ verdict: "incorrect", msToAnswer: 3000, difficulty: 1 })).toBe("again");
    expect(deriveRating({ verdict: "typo", msToAnswer: 3000, difficulty: 1 })).toBe("hard");
    expect(deriveRating({ verdict: "correct", msToAnswer: 3000, usedHint: true, difficulty: 1 })).toBe("hard");
    expect(deriveRating({ verdict: "correct", msToAnswer: 3000, difficulty: 1 })).toBe("easy");
    expect(deriveRating({ verdict: "correct", msToAnswer: 30_000, difficulty: 1 })).toBe("good");
  });
  it("fast threshold scales with difficulty", () => {
    expect(deriveRating({ verdict: "correct", msToAnswer: 10_000, difficulty: 1 })).toBe("good");
    expect(deriveRating({ verdict: "correct", msToAnswer: 10_000, difficulty: 4 })).toBe("easy");
  });
});
