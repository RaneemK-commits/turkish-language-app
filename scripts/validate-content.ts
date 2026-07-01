/**
 * validate-content — CI/pre-commit gate for the content bank.
 * Gates (CONTENT_AUTHORING.md §5):
 *   1. Zod schema (structure)
 *   2. Referential integrity + deterministic Turkish checks (grammar; grows with
 *      the domain/turkish engine — currently harmony verification for plural
 *      suffix_match cards)
 *   3. Vocabulary allowlist (pedagogy; prefix-stem heuristic, Phase 1 will use
 *      the full suffix engine for exact analysis)
 * Exit code 1 if any card fails. Fix the card, not the gate.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import {
  conceptsFileSchema,
  lessonCardSchema,
  exercisesFileSchema,
  type Concept,
  type ExerciseCard,
  type LessonCard,
} from "../src/content/schema/schema.ts";
import { resolveSuffix, toLowerTr } from "../src/domain/turkish/harmony.ts";

const CONTENT_DIR = join(import.meta.dirname, "..", "src", "content");
const errors: string[] = [];
const fail = (where: string, msg: string) => errors.push(`${where}: ${msg}`);

const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(path, "utf-8"));

// ---------- gate 1: schema ----------

const conceptsResult = conceptsFileSchema.safeParse(
  readJson(join(CONTENT_DIR, "concepts.json")),
);
if (!conceptsResult.success) {
  fail("concepts.json", conceptsResult.error.message);
  report(); // cannot continue without the spine
}
const concepts: Concept[] = conceptsResult.data!;
const conceptById = new Map(concepts.map((c) => [c.id, c]));

const lessons = new Map<string, LessonCard>();
for (const file of listJson("lessons")) {
  const parsed = lessonCardSchema.safeParse(readJson(file));
  if (!parsed.success) {
    fail(basename(file), parsed.error.message);
    continue;
  }
  lessons.set(parsed.data.conceptId, parsed.data);
  if (basename(file) !== `${parsed.data.conceptId}.json`)
    fail(basename(file), `file name must match conceptId "${parsed.data.conceptId}"`);
}

const exercisesByConcept = new Map<string, ExerciseCard[]>();
for (const file of listJson("exercises")) {
  const parsed = exercisesFileSchema.safeParse(readJson(file));
  if (!parsed.success) {
    fail(basename(file), parsed.error.message);
    continue;
  }
  const conceptIds = new Set(parsed.data.map((e) => e.conceptId));
  if (conceptIds.size > 1)
    fail(basename(file), "mixed conceptIds in one exercise file");
  exercisesByConcept.set(parsed.data[0]!.conceptId, parsed.data);
  if (basename(file) !== `${parsed.data[0]!.conceptId}.json`)
    fail(basename(file), `file name must match conceptId "${parsed.data[0]!.conceptId}"`);
}

// ---------- gate 2: referential integrity + grammar ----------

// concepts: unique ids/orders, prereqs resolve and precede
{
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();
  for (const c of concepts) {
    if (seenIds.has(c.id)) fail("concepts.json", `duplicate id "${c.id}"`);
    if (seenOrders.has(c.order)) fail("concepts.json", `duplicate order ${c.order}`);
    seenIds.add(c.id);
    seenOrders.add(c.order);
    for (const p of c.prereqs) {
      const pre = conceptById.get(p);
      if (!pre) fail("concepts.json", `"${c.id}" prereq "${p}" does not exist`);
      else if (pre.order >= c.order)
        fail("concepts.json", `"${c.id}" prereq "${p}" must come earlier in order`);
    }
  }
}

// cards: conceptId resolves; exercise ids unique across the bank
{
  const exIds = new Set<string>();
  for (const [conceptId] of lessons)
    if (!conceptById.has(conceptId))
      fail(`lessons/${conceptId}.json`, "unknown conceptId");
  for (const [conceptId, cards] of exercisesByConcept) {
    if (!conceptById.has(conceptId))
      fail(`exercises/${conceptId}.json`, "unknown conceptId");
    for (const card of cards) {
      if (exIds.has(card.id)) fail(card.id, "duplicate exercise id");
      exIds.add(card.id);
      if (!card.id.startsWith(`${conceptId}.ex.`))
        fail(card.id, `id must start with "${conceptId}.ex."`);
    }
  }
}

// grammar: verify plural suffix_match answers against the harmony engine.
// (Grows to full suffix verification as domain/turkish gains cases/tenses.)
for (const cards of exercisesByConcept.values()) {
  for (const card of cards) {
    if (card.format !== "suffix_match") continue;
    const m = card.prompt.match(/^(\S+) \+ ___\s*\(plural\)/u);
    if (!m) continue;
    const expected = resolveSuffix(m[1]!, "lAr");
    if (!card.answer.includes(expected))
      fail(card.id, `harmony check: expected plural suffix "${expected}" for stem "${m[1]}", answers are [${card.answer.join(", ")}]`);
  }
}

// ---------- gate 3: vocabulary allowlist ----------

type Allowlist = { functionWords: string[]; introducedBy: Record<string, string[]> };
const allowlist = readJson(join(CONTENT_DIR, "allowlist.json")) as Allowlist;

for (const c of concepts)
  if (!(c.id in allowlist.introducedBy))
    fail("allowlist.json", `missing introducedBy entry for concept "${c.id}"`);

/** Cumulative stems available at a concept's position, incl. softening variants. */
function stemsAvailableAt(concept: Concept): Set<string> {
  const stems = new Set<string>(allowlist.functionWords.map(toLowerTr));
  for (const c of concepts) {
    if (c.order > concept.order) continue;
    for (const word of allowlist.introducedBy[c.id] ?? []) {
      const w = toLowerTr(word);
      stems.add(w);
      // final-stop softening variants: kitap→kitab, ağaç→ağac, kanat→kanad, çocuk→çocuğ
      const soft = w.replace(/p$/, "b").replace(/ç$/, "c").replace(/t$/, "d").replace(/k$/, "ğ");
      if (soft !== w) stems.add(soft);
      // verb stems: strip -mak/-mek
      const stem = w.replace(/m[ae]k$/, "");
      if (stem !== w) stems.add(stem);
    }
  }
  return stems;
}

/** A Turkish token passes if an available stem is a prefix of it (suffixes allowed). */
function tokenAllowed(token: string, stems: Set<string>): boolean {
  const t = toLowerTr(token).replace(/['’.,!?;:()"…-]/g, "");
  if (t.length <= 2) return true; // single letters / particles are meta-language
  for (const stem of stems)
    if (t.startsWith(stem)) return true;
  return false;
}

for (const [conceptId, cards] of exercisesByConcept) {
  const concept = conceptById.get(conceptId);
  if (!concept) continue;
  const stems = stemsAvailableAt(concept);
  for (const card of cards) {
    // Turkish appears in answers/alternates/distractors (prompts may be English).
    // suffix_match tiles are bare morphemes ("lar", "de"), not vocabulary — exempt.
    if (card.format === "suffix_match") continue;
    const turkish = [...card.answer, ...card.alternates, ...card.distractors];
    for (const phrase of turkish)
      for (const token of phrase.split(/\s+/))
        if (!tokenAllowed(token, stems))
          fail(card.id, `vocabulary: "${token}" not introduced at or before "${conceptId}"`);
  }
}

// ---------- report ----------

function listJson(dir: string): string[] {
  const full = join(CONTENT_DIR, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(full, f));
}

function report(): never {
  const lessonCount = lessons?.size ?? 0;
  const exCount = [...(exercisesByConcept?.values() ?? [])].reduce(
    (n, cards) => n + cards.length,
    0,
  );
  if (errors.length > 0) {
    console.error(`✗ content validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(
    `✓ content valid — ${concepts.length} concepts, ${lessonCount} lessons, ${exCount} exercises`,
  );
  process.exit(0);
}

report();
