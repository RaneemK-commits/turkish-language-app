# Akış — Content Authoring Guide

> How to write, validate, and commit a card. Content is the quality ceiling of the app, and it is fully hand-authored (no runtime generation). This guide is the contract every card must satisfy. Grammar specs live in [CURRICULUM.md](CURRICULUM.md); this file is about *format, validation, and conventions*.

---

## 1. Where content lives

```
src/content/
  concepts.json              # ordered list of all concepts (id, tier, order, prereqs, tags)
  lessons/<conceptId>.json   # one lesson card per concept
  exercises/<conceptId>.json # array of exercise cards for that concept
  schema/                    # Zod schemas + validate-content script
  source/SeedSource.ts       # reads the above at build time
```

One file per concept keeps diffs small and review focused. `concepts.json` is the spine — the feed's prereq gate reads it.

---

## 2. The three record types

Authoritative field lists. The Zod schemas in `schema/` are the machine-checked version of this.

### Concept (`concepts.json` entry)

```jsonc
{
  "id": "accusative",          // kebab-case, stable, matches file names
  "tier": 2,                    // 1–5
  "order": 5,                   // global sequence position
  "title": "The Accusative Suffix",
  "prereqs": ["vowel-harmony", "consonant-assimilation"],
  "tags": ["case", "noun"]
}
```

### Lesson card (`lessons/<id>.json`)

```jsonc
{
  "id": "accusative.lesson",
  "conceptId": "accusative",
  "type": "lesson",
  "formula": "noun + -(y)I   →   definite object",
  "body": [
    { "kind": "rule", "md": "Use the accusative only for a **specific** object." },
    { "kind": "table", "headers": ["last vowel", "suffix"],
      "rows": [["a/ı","ı"],["e/i","i"],["o/u","u"],["ö/ü","ü"]] },
    { "kind": "example", "tr": "Kitabı okudum.", "gloss": "I read the book.",
      "highlight": [{ "span": [5,7], "note": "-ı accusative; p→b softening" }] }
  ]
}
```

`body` block kinds: `rule` (markdown), `table` (headers + rows), `example` (`tr`, `gloss`, optional `highlight` spans with `note`). Keep a lesson to **one screen** — one formula, one small table, 2–3 examples. Explanations are in **English**; only the target Turkish is Turkish.

### Exercise card (`exercises/<id>.json` — array element)

```jsonc
{
  "id": "accusative.ex.012",   // <conceptId>.ex.<zero-padded index>
  "conceptId": "accusative",
  "type": "exercise",
  "format": "fill_blank",       // see §4
  "difficulty": 3,              // 1–4 → L1–L4
  "prompt": "Ali ___ gördüm.",
  "answer": ["Ali'yi"],         // one or more fully-correct answers
  "alternates": ["Aliyi"],      // accepted-but-imperfect variants (still marked correct)
  "distractors": ["Ali'ye", "Ali", "Ali'de"],  // MC / suffix-tile wrong options
  "explanation": {
    "rule": "Proper noun + accusative -(y)I; buffer -y- after a vowel.",
    "why":  "‘Ali’ is a specific, definite object of ‘gördüm’."
  },
  "targets": ["missing_buffer_y", "missing_apostrophe"],  // error tags this card drills
  "audio": { "tts": "Ali'yi gördüm." }   // optional
}
```

`targets` is what the weak-point engine matches against a concept's spiking `errorPatterns`.

---

## 3. Difficulty levels

| `difficulty` | Level | Demand | Preferred formats |
|---|---|---|---|
| 1 | L1 | Recognition | `multiple_choice` |
| 2 | L2 | Cued production | `suffix_match`, `fill_blank` (with a hint in the prompt) |
| 3 | L3 | Free production | `fill_blank`, `reorder` |
| 4 | L4 | Integration | `translate` (mixes earlier concepts) |

**Per concept, ship ≥10–15 exercises** spread across the levels — roughly 3–4 at L1, 4–5 at L2, 3–4 at L3, 2–3 at L4. Cover every error tag the concept can produce (see CURRICULUM).

---

## 4. Exercise formats

Each format's required fields and an authoring example.

### `multiple_choice` (L1)
Recognition. `prompt` is the question, `answer` the correct option, `distractors` the wrong ones (rendered shuffled with the answer).
```jsonc
{ "format":"multiple_choice", "difficulty":1,
  "prompt":"Which is the correct plural of “ev”?",
  "answer":["evler"], "distractors":["evlar","eviler","evlar"],
  "explanation":{"rule":"-lAr harmonizes to the front vowel e → -ler.","why":"‘ev’ has front vowel e."},
  "targets":["wrong_suffix_vowel"] }
```

### `suffix_match` (L2)
Learner picks/drags the correct suffix tile. `answer` is the suffix; `distractors` are the other harmony variants.
```jsonc
{ "format":"suffix_match", "difficulty":2,
  "prompt":"kapı + ___  (plural)", "answer":["lar"], "distractors":["ler"],
  "explanation":{"rule":"Back vowel ı → -lar.","why":"Last vowel of ‘kapı’ is ı (back)."},
  "targets":["wrong_suffix_vowel"] }
```

### `fill_blank` (L2–L3)
Type the missing form. At L2 include a bracketed hint in `prompt`; at L3 don't.
```jsonc
{ "format":"fill_blank", "difficulty":3,
  "prompt":"Ali ___ gördüm.", "answer":["Ali'yi"], "alternates":["Aliyi"],
  "explanation":{"rule":"Accusative -(y)I with buffer -y- after a vowel; proper noun takes an apostrophe.","why":"Definite object."},
  "targets":["missing_buffer_y","missing_apostrophe"] }
```

### `reorder` (L3)
Drag scrambled tokens into order. `prompt` holds the scrambled tokens (array); `answer` the correct ordering (joined string).
```jsonc
{ "format":"reorder", "difficulty":3,
  "prompt":"okula | her gün | giderim", "answer":["Her gün okula giderim."],
  "explanation":{"rule":"Turkish is SOV; time adverb fronts, verb goes last.","why":"‘giderim’ is the verb → sentence-final."},
  "targets":["word_order"] }
```

### `translate` (L4)
Short EN→TR (or TR→EN) translation, normalized check. Provide all acceptable answers.
```jsonc
{ "format":"translate", "difficulty":4,
  "prompt":"Translate: “I read the book yesterday.”",
  "answer":["Dün kitabı okudum."], "alternates":["Kitabı dün okudum."],
  "explanation":{"rule":"Definite object → accusative -ı (kitap→kitabı); witnessed past -DI.","why":"Combines accusative + past tense."},
  "targets":["no_consonant_softening","wrong_case_choice"] }
```

### `audio` (stretch, L1–L2)
Identify the heard form. Uses `audio.tts`; otherwise MC-shaped.

---

## 5. Validation pipeline

`npm run validate-content` runs in pre-commit and CI. Three gates, in order:

1. **Zod schema** — structural. Field types, required fields, `id` format, `difficulty` ∈ 1..4, `conceptId` exists in `concepts.json`, prereqs resolve, no orphan files.
2. **Deterministic Turkish suffix check** — grammatical. The `domain/turkish` engine (harmony + buffer + softening + D/C harmony rules) recomputes the expected form and asserts every `answer` is actually correct for the transformation the card claims to drill. Because Turkish morphology is rule-regular, most single-suffix answers are machine-verifiable. Irregular stems (aorist list, non-softening monosyllables) are declared in a per-word exceptions table the checker consults.
3. **Vocabulary allowlist** — pedagogical. Every Turkish word in a card's `prompt`/`answer`/examples must appear in the cumulative allowlist at or before this concept's `order` (allowlist maintained in CURRICULUM §"Cumulative vocabulary allowlist", closed function-word set exempt). Blocks accidental vocabulary ambush.

A card failing any gate blocks the commit. Fix the card, not the gate.

---

## 6. Answer-checking (runtime, `domain/answer`)

How a typed answer is judged correct — author with this in mind:

- **Normalize** both sides: trim, collapse internal whitespace, lowercase with **Turkish-aware casefold** (İ→i, I→ı), and fold apostrophe variants (`'` `’` and the un-apostrophed form) — which is why `alternates` like `Aliyi` are accepted.
- **Exact match** against `answer` ∪ `alternates` → correct (Good/Easy grade).
- **Levenshtein ≤ 1** against any accepted answer → correct-with-typo (Hard grade), and feedback says "close — watch the spelling" rather than teaching the rule as if missed.
- Anything else → incorrect (Again grade); feedback shows the `explanation.rule`.

Author implication: put *every* legitimately correct surface form in `answer`/`alternates` (e.g. both word orders for a translation). Don't rely on the checker to be clever.

---

## 7. Error-tag taxonomy

`targets` values must come from this closed set (extend it here if a genuinely new class appears):

| Tag | Meaning |
|---|---|
| `wrong_suffix_vowel` | vowel harmony wrong (A/I) |
| `no_consonant_softening` | failed p/ç/t/k → b/c/d/ğ |
| `wrong_consonant_harmony` | D or C voicing wrong (d/t, c/ç) |
| `missing_buffer_y` / `missing_buffer_n` / `missing_buffer_s` | dropped a buffer consonant |
| `missing_apostrophe` | proper-noun apostrophe omitted |
| `wrong_case_choice` | wrong case, or definite-vs-indefinite object |
| `wrong_possessive_person` / `wrong_person_suffix` | person marking wrong |
| `izafet_missing_genitive` / `izafet_missing_possessive` / `definite_vs_compound_izafet` | izafet chain errors |
| `var_yok_choice` | var vs yok |
| `wrong_stem` / `iyor_vowel_drop` | verb-stem handling |
| `aorist_ir_vs_ar` / `aorist_irregular` / `aorist_negative` | aorist |
| `di_vs_mis_choice` | witnessed vs evidential past |
| `future_k_softening` / `k_softening` | k→ğ before vowel |
| `negation_placement` / `negation_iyor_raising` | negation |
| `mi_harmony` / `mi_spacing` / `mi_person_placement` | question particle |
| `imperative_person` / `conditional_form` / `ability_negative_form` | modality forms |
| `participle_choice` / `dik_possessive` / `converb_choice` | complex syntax |
| `postposition_case_government` / `ile_cliticization` | postpositions |
| `word_order` | SOV / constituent order |
| `sound_letter_match` / `vowel_id` | phonology (Unit 1) |

---

## 8. Per-card authoring checklist

- [ ] `id` follows convention and is unique
- [ ] `conceptId` exists; the card only uses grammar from this concept + its prereqs
- [ ] `difficulty` matches the format guidance (§3–4)
- [ ] All Turkish words are in the allowlist for this concept's position
- [ ] `answer` includes every legitimately correct surface form; `alternates` covers spelling variants
- [ ] `distractors` are *plausible* (target real errors), not absurd
- [ ] `explanation.rule` states the grammar; `explanation.why` ties it to this sentence — **English**
- [ ] `targets` are valid tags and actually match what the card drills
- [ ] Runs clean through `validate-content` (schema + suffix check + allowlist)
- [ ] Reads naturally to a fluent speaker (human review)

---

## 9. Authoring workflow

1. Read the concept spec in [CURRICULUM.md](CURRICULUM.md).
2. Write `lessons/<id>.json` — one screen, formula + small table + 2–3 examples.
3. Write `exercises/<id>.json` — 10–15 cards across L1–L4, covering the concept's error tags.
4. `npm run validate-content` → fix until green.
5. Human review for naturalness and pedagogy.
6. Commit. CI re-validates on push.

> When dynamic generation is eventually added, generated cards pass through the **same** §5 gates before being cached — this guide stays the contract for both hand-authored and generated content.
