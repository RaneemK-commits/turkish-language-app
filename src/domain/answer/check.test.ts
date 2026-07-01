import { describe, expect, it } from "vitest";
import { checkAnswer, levenshtein } from "./check";
import { normalize } from "./normalize";

describe("normalize", () => {
  it("applies Turkish casefold", () => {
    expect(normalize("EVLER")).toBe("evler");
    expect(normalize("KAPI")).toBe("kapı"); // I → ı, not i
    expect(normalize("İstanbul")).toBe("istanbul");
  });
  it("folds apostrophes and whitespace", () => {
    expect(normalize("Ali’yi")).toBe("ali'yi");
    expect(normalize("  dün   kitabı  okudum. ")).toBe("dün kitabı okudum");
  });
});

describe("levenshtein", () => {
  it.each([
    ["evler", "evler", 0],
    ["evler", "evlar", 1],
    ["evler", "evlerr", 1],
    ["evler", "eler", 1],
    ["evler", "kapı", 5],
  ])("%s vs %s = %d", (a, b, d) => {
    expect(levenshtein(a, b)).toBe(d);
  });
});

describe("checkAnswer", () => {
  it("accepts exact matches after normalization", () => {
    expect(checkAnswer("Evler", ["evler"]).verdict).toBe("correct");
    expect(checkAnswer("ali’yi", ["Ali'yi"]).verdict).toBe("correct");
  });
  it("accepts alternates as fully correct", () => {
    expect(checkAnswer("Aliyi", ["Ali'yi"], ["Aliyi"]).verdict).toBe("correct");
  });
  it("classifies one-edit slips as typo", () => {
    expect(checkAnswer("evlerr", ["evler"]).verdict).toBe("typo");
    expect(checkAnswer("gözlr", ["gözler"]).verdict).toBe("typo");
  });
  it("vowel-for-vowel substitutions are harmony errors, not typos", () => {
    expect(checkAnswer("evlar", ["evler"]).verdict).toBe("incorrect");
    expect(checkAnswer("gözlur", ["gözler"]).verdict).toBe("incorrect");
    expect(checkAnswer("kitabi", ["kitabı"]).verdict).toBe("incorrect"); // i vs ı!
  });
  it("consonant slips and length slips remain typos", () => {
    expect(checkAnswer("evleq", ["evler"]).verdict).toBe("typo"); // consonant sub
    expect(checkAnswer("evle", ["evler"]).verdict).toBe("typo"); // deletion
  });
  it("rejects everything else", () => {
    expect(checkAnswer("kapı", ["evler"]).verdict).toBe("incorrect");
    expect(checkAnswer("", ["evler"]).verdict).toBe("incorrect");
  });
  it("reports the matched answer for feedback", () => {
    expect(checkAnswer("evlerr", ["evler"]).matched).toBe("evler");
    expect(checkAnswer("wrong", ["evler"]).matched).toBe("evler");
  });
});
