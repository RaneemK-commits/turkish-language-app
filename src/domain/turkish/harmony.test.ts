import { describe, expect, it } from "vitest";
import {
  lastVowel,
  resolveA,
  resolveI,
  resolveSuffix,
  toLowerTr,
} from "./harmony";

describe("toLowerTr", () => {
  it("maps dotted/dotless I correctly", () => {
    expect(toLowerTr("İstanbul")).toBe("istanbul");
    expect(toLowerTr("IRMAK")).toBe("ırmak");
    expect(toLowerTr("KAPI")).toBe("kapı");
  });
});

describe("lastVowel", () => {
  it("finds the governing vowel", () => {
    expect(lastVowel("ev")).toBe("e");
    expect(lastVowel("kapı")).toBe("ı");
    expect(lastVowel("okul")).toBe("u");
    expect(lastVowel("gün")).toBe("ü");
    expect(lastVowel("kanat")).toBe("a");
  });
  it("returns undefined for vowelless input", () => {
    expect(lastVowel("krk")).toBeUndefined();
  });
});

describe("resolveA (2-fold)", () => {
  it.each([
    ["ev", "e"],
    ["kapı", "a"],
    ["okul", "a"],
    ["gün", "e"],
    ["göz", "e"],
    ["çocuk", "a"],
  ])("%s → %s", (stem, expected) => {
    expect(resolveA(stem)).toBe(expected);
  });
});

describe("resolveI (4-fold)", () => {
  it.each([
    ["kapı", "ı"], // back unrounded
    ["ev", "i"], // front unrounded
    ["okul", "u"], // back rounded
    ["gün", "ü"], // front rounded
    ["kız", "ı"],
    ["deniz", "i"],
    ["su", "u"],
    ["göz", "ü"],
  ])("%s → %s", (stem, expected) => {
    expect(resolveI(stem)).toBe(expected);
  });
});

describe("resolveSuffix", () => {
  it("resolves the plural -lAr", () => {
    expect(resolveSuffix("ev", "lAr")).toBe("ler");
    expect(resolveSuffix("kapı", "lAr")).toBe("lar");
    expect(resolveSuffix("gün", "lAr")).toBe("ler");
    expect(resolveSuffix("okul", "lAr")).toBe("lar");
  });
  it("resolves 4-fold suffixes", () => {
    expect(resolveSuffix("ev", "I")).toBe("i");
    expect(resolveSuffix("okul", "I")).toBe("u");
  });
  it("resolves multi-vowel templates like -ImIz", () => {
    expect(resolveSuffix("ev", "ImIz")).toBe("imiz");
    expect(resolveSuffix("okul", "ImIz")).toBe("umuz");
  });
});
