/**
 * Zod schemas for the content bank — the machine-checked contract from
 * docs/CONTENT_AUTHORING.md §2. A card that fails these never reaches the feed.
 */
import { z } from "zod";

// ---- shared vocabulary ------------------------------------------------------

export const conceptIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "concept ids are kebab-case");

export const exerciseFormatSchema = z.enum([
  "multiple_choice",
  "suffix_match",
  "fill_blank",
  "reorder",
  "translate",
  "audio",
]);

/** Closed error-tag taxonomy — CONTENT_AUTHORING.md §7. Extend there first. */
export const errorTagSchema = z.enum([
  "wrong_suffix_vowel",
  "no_consonant_softening",
  "wrong_consonant_harmony",
  "missing_buffer_y",
  "missing_buffer_n",
  "missing_buffer_s",
  "missing_apostrophe",
  "wrong_case_choice",
  "wrong_possessive_person",
  "wrong_person_suffix",
  "izafet_missing_genitive",
  "izafet_missing_possessive",
  "definite_vs_compound_izafet",
  "var_yok_choice",
  "wrong_stem",
  "iyor_vowel_drop",
  "aorist_ir_vs_ar",
  "aorist_irregular",
  "aorist_negative",
  "di_vs_mis_choice",
  "future_k_softening",
  "k_softening",
  "negation_placement",
  "negation_iyor_raising",
  "mi_harmony",
  "mi_spacing",
  "mi_person_placement",
  "imperative_person",
  "conditional_form",
  "ability_negative_form",
  "participle_choice",
  "dik_possessive",
  "converb_choice",
  "postposition_case_government",
  "ile_cliticization",
  "word_order",
  "sound_letter_match",
  "vowel_id",
]);

// ---- concept ----------------------------------------------------------------

export const conceptSchema = z.object({
  id: conceptIdSchema,
  tier: z.number().int().min(1).max(5),
  order: z.number().int().min(1),
  title: z.string().min(1),
  prereqs: z.array(conceptIdSchema),
  tags: z.array(z.string().min(1)),
});

export const conceptsFileSchema = z.array(conceptSchema);

// ---- lesson card --------------------------------------------------------------

const ruleBlockSchema = z.object({
  kind: z.literal("rule"),
  md: z.string().min(1),
});

const tableBlockSchema = z.object({
  kind: z.literal("table"),
  headers: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

const exampleBlockSchema = z.object({
  kind: z.literal("example"),
  tr: z.string().min(1),
  gloss: z.string().min(1),
  highlight: z
    .array(
      z.object({
        span: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
        note: z.string().min(1),
      }),
    )
    .optional(),
});

export const lessonBodyBlockSchema = z.discriminatedUnion("kind", [
  ruleBlockSchema,
  tableBlockSchema,
  exampleBlockSchema,
]);

export const lessonCardSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+\.lesson$/),
  conceptId: conceptIdSchema,
  type: z.literal("lesson"),
  formula: z.string().min(1),
  body: z.array(lessonBodyBlockSchema).min(1),
});

// ---- exercise card ------------------------------------------------------------

export const exerciseCardSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+\.ex\.\d{3}$/),
    conceptId: conceptIdSchema,
    type: z.literal("exercise"),
    format: exerciseFormatSchema,
    difficulty: z.number().int().min(1).max(4),
    prompt: z.string().min(1),
    answer: z.array(z.string().min(1)).min(1),
    alternates: z.array(z.string().min(1)).default([]),
    distractors: z.array(z.string().min(1)).default([]),
    explanation: z.object({
      rule: z.string().min(1),
      why: z.string().min(1),
    }),
    targets: z.array(errorTagSchema).min(1),
    audio: z.object({ tts: z.string().min(1) }).optional(),
  })
  .superRefine((card, ctx) => {
    // Format-specific requirements (CONTENT_AUTHORING.md §4)
    if (
      (card.format === "multiple_choice" || card.format === "suffix_match") &&
      card.distractors.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${card.format} requires at least one distractor`,
        path: ["distractors"],
      });
    }
    if (card.answer.some((a) => card.distractors.includes(a))) {
      ctx.addIssue({
        code: "custom",
        message: "an answer also appears in distractors",
        path: ["distractors"],
      });
    }
  });

export const exercisesFileSchema = z.array(exerciseCardSchema).min(1);

// ---- inferred types -----------------------------------------------------------

export type Concept = z.infer<typeof conceptSchema>;
export type LessonCard = z.infer<typeof lessonCardSchema>;
export type LessonBodyBlock = z.infer<typeof lessonBodyBlockSchema>;
export type ExerciseCard = z.infer<typeof exerciseCardSchema>;
export type ExerciseFormat = z.infer<typeof exerciseFormatSchema>;
export type ErrorTag = z.infer<typeof errorTagSchema>;
