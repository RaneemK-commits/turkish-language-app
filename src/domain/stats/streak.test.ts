import { describe, expect, it } from "vitest";
import { currentStreak, localDateKey } from "./streak";

const TODAY = new Date(2026, 6, 1); // 2026-07-01 local

describe("currentStreak", () => {
  it("counts consecutive days ending today", () => {
    const days = new Set(["2026-07-01", "2026-06-30", "2026-06-29"]);
    expect(currentStreak(days, TODAY)).toBe(3);
  });
  it("keeps the streak alive if today has no activity yet", () => {
    const days = new Set(["2026-06-30", "2026-06-29"]);
    expect(currentStreak(days, TODAY)).toBe(2);
  });
  it("breaks on a gap", () => {
    const days = new Set(["2026-07-01", "2026-06-29"]);
    expect(currentStreak(days, TODAY)).toBe(1);
  });
  it("zero when never active", () => {
    expect(currentStreak(new Set(), TODAY)).toBe(0);
  });
});

describe("localDateKey", () => {
  it("formats local dates", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
