/**
 * Vowel harmony — the deterministic core of the Turkish engine (CURRICULUM Unit 2).
 * Pure functions, zero dependencies. Used by both the content validator (CI gate 2)
 * and runtime answer feedback.
 */

export const BACK_VOWELS = ["a", "ı", "o", "u"] as const;
export const FRONT_VOWELS = ["e", "i", "ö", "ü"] as const;
export const ROUNDED_VOWELS = ["o", "ö", "u", "ü"] as const;
export const VOWELS = [...BACK_VOWELS, ...FRONT_VOWELS] as const;

export type Vowel = (typeof VOWELS)[number];

export function isVowel(ch: string): ch is Vowel {
  return (VOWELS as readonly string[]).includes(ch);
}

export function isBack(v: Vowel): boolean {
  return (BACK_VOWELS as readonly string[]).includes(v);
}

export function isRounded(v: Vowel): boolean {
  return (ROUNDED_VOWELS as readonly string[]).includes(v);
}

/**
 * The last vowel of a stem — the one that governs harmony.
 * Turkish-aware lowercasing (İ→i, I→ı) is applied first.
 */
export function lastVowel(stem: string): Vowel | undefined {
  const s = toLowerTr(stem);
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i]!;
    if (isVowel(ch)) return ch;
  }
  return undefined;
}

function requireLastVowel(stem: string): Vowel {
  const v = lastVowel(stem);
  if (v === undefined)
    throw new Error(`stem "${stem}" has no vowel — cannot harmonize`);
  return v;
}

/** 2-fold harmony: `A` → a (back) / e (front). */
export function resolveA(stem: string): "a" | "e" {
  const v = requireLastVowel(stem);
  return isBack(v) ? "a" : "e";
}

/** 4-fold harmony: `I` → ı / i / u / ü by backness + rounding. */
export function resolveI(stem: string): "ı" | "i" | "u" | "ü" {
  const v = requireLastVowel(stem);
  if (isBack(v)) return isRounded(v) ? "u" : "ı";
  return isRounded(v) ? "ü" : "i";
}

/**
 * Resolve an archiphoneme-notated suffix against a stem:
 * "lAr" + "ev" → "ler" · "(y)I" is NOT handled here (buffers live in suffix.ts).
 */
export function resolveSuffix(stem: string, suffixTemplate: string): string {
  let out = "";
  for (const ch of suffixTemplate) {
    if (ch === "A") out += resolveA(stem);
    else if (ch === "I") out += resolveI(stem);
    else out += ch;
    // NOTE: after the first resolved vowel, subsequent harmony vowels in the
    // same suffix chain should technically harmonize progressively. For the
    // suffixes in scope (-lAr, -DA, -DAn, -(I)mIz…) the governing vowel is the
    // same, so stem-based resolution is equivalent. Revisit when chaining
    // multiple suffixes (Phase 2 of the engine).
  }
  return out;
}

/** Turkish-aware lowercase: İ→i and I→ı (Unicode default maps I→i, which is wrong). */
export function toLowerTr(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}
