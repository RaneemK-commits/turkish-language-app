# Akış — Curriculum (Authoring Source of Truth)

> The canonical per-unit specification. Every lesson card and exercise card is authored *from this file*. If the grammar here is wrong, the app is wrong — so this is the place to get Turkish right, once. UI language is **English**. Phonetic scaffolding is **light**: each sound is introduced once (Unit 1) and not re-explained on later cards.

**Notation:** `A`={a,e} · `I`={ı,i,u,ü} · `D`={d,t} · `C`={c,ç} · `(y)`,`(n)`,`(s)` are buffer consonants inserted after a vowel. "Last vowel" = the last vowel of the stem; it governs harmony.

**Per-unit fields:** `id` · prereqs · formula · rules · examples · vocabulary introduced · error tags targeted.
The full error-tag taxonomy lives in [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md#error-tag-taxonomy).

---

## Tier 1 — Phonology

### 1. Alphabet & Phonology · `alphabet`
- **Prereqs:** none
- **Formula:** 29 letters · 8 vowels · no q / w / x
- **Rules (light, introduce once):**
  - Vowels: **a e ı i o ö u ü**. The tricky pairs for English speakers: **ı** (dotless, like the *e* in "open") vs **i** (dotted, "ee"); **ö** (German *ö*), **ü** (German *ü*).
  - Consonants worth a one-line cue: **c** = "j" (*ceket* ≈ "jacket"), **ç** = "ch", **ş** = "sh", **j** = "zh", **ğ** (*yumuşak ge* / soft-g) = silent, lengthens the preceding vowel (*dağ* ≈ "daa").
  - One sound ↔ one letter; spelling is phonetic. Stress is usually on the last syllable (don't drill this).
- **Examples:** `ev` — house · `kapı` — door · `dağ` — mountain (ğ lengthens) · `çocuk` — child
- **Vocabulary introduced:** ev, kapı, kitap, okul, su, çocuk, dağ, göz, kız, yol
- **Error tags:** `sound_letter_match`, `vowel_id` (ı vs i, ö, ü)

### 2. Vowel Harmony · `vowel-harmony` ★ (the master key)
- **Prereqs:** `alphabet`
- **Formula:** suffix vowel copies the **last vowel** of the stem — `A` 2-way, `I` 4-way
- **Rules:**
  - Classify vowels: **back** {a ı o u} vs **front** {e i ö ü}; **rounded** {o ö u ü} vs **unrounded** {a e ı i}.
  - **2-fold `A`:** back → **a**, front → **e**.
  - **4-fold `I`:** back+unrounded → **ı**, front+unrounded → **i**, back+rounded → **u**, front+rounded → **ü**.

    | last vowel | `A` | `I` |
    |---|---|---|
    | a, ı | a | ı |
    | e, i | e | i |
    | o, u | a | u |
    | ö, ü | e | ü |
- **Examples:** `ev-ler` (e→e) · `kapı-lar` (ı→a) · `gün-ü` (ü→ü) · `okul-u` (u→u)
- **Vocabulary introduced:** gün, ay, yıl, araba, köpek, deniz
- **Error tags:** `wrong_suffix_vowel`

### 3. Consonant Assimilation · `consonant-assimilation`
- **Prereqs:** `vowel-harmony`
- **Formula:** final **p ç t k → b c d ğ** before a vowel · suffix **D**=d/t, **C**=c/ç by voicing
- **Rules:**
  - **Softening:** a word-final voiceless stop voices when a vowel-initial suffix attaches: *kitap→kitabı*, *ağaç→ağacı*, *kanat→kanadı*, *çocuk→çocuğu*, *renk→rengi*. (Exceptions exist — many one-syllable words don't soften: *at→atı*, *ok→oku*; mark these per-word.)
  - **Consonant harmony:** a suffix starting with **D** is **t** after a voiceless consonant (f s t k ç ş h p), else **d**; same logic for **C** (ç/c). *ev-de* but *kitap-ta*; *uçak-tan* but *ev-den*.
- **Examples:** `kitab-ı` (p→b) · `ağac-ı` (ç→c) · `kitap-ta` (D→t) · `ev-de` (D→d)
- **Vocabulary introduced:** ağaç, kanat, renk, uçak, at, kuş
- **Error tags:** `no_consonant_softening`, `wrong_consonant_harmony`

---

## Tier 2 — Noun Morphology

### 4. Plural · `plural`
- **Prereqs:** `vowel-harmony`
- **Formula:** `noun + -lAr`
- **Rules:** the first systematic application of 2-fold harmony. No softening (suffix is consonant-initial).
- **Examples:** `ev-ler` · `kapı-lar` · `gün-ler` · `okul-lar` · `çocuk-lar`
- **Vocabulary introduced:** (reuse) — focus on the suffix, not new words
- **Error tags:** `wrong_suffix_vowel`

### 5. Accusative · `accusative`
- **Prereqs:** `vowel-harmony`, `consonant-assimilation`
- **Formula:** `noun + -(y)I  →  definite/specific direct object`
- **Rules:**
  - Use the accusative **only when the object is specific/definite** ("the book", a named thing). An indefinite object ("a book") takes no suffix: *Kitap okudum* (I read a book) vs *Kitabı okudum* (I read the book).
  - Buffer **-y-** after a vowel: *kapı-yı*, *su-yu*. Softening applies: *kitab-ı*.
  - Proper nouns take an apostrophe before the suffix: *Ali'yi*, *İstanbul'u*.
- **Examples:** `ev-i` · `kapı-yı` · `kitab-ı` · `Ali'yi` · `su-yu`
- **Vocabulary introduced:** verbs: görmek (see), okumak (read), sevmek (love/like)
- **Error tags:** `wrong_suffix_vowel`, `missing_buffer_y`, `no_consonant_softening`, `missing_apostrophe`, `wrong_case_choice` (definite vs indefinite)

### 6. Dative · Locative · Ablative · `cases-dla`
- **Prereqs:** `accusative`
- **Formula:** dative `-(y)A` (to) · locative `-DA` (at/in/on) · ablative `-DAn` (from)
- **Rules:** dative takes buffer **-y-** after a vowel (*kapı-ya*); locative/ablative use D-harmony (*kitap-ta*, *uçak-tan*).
- **Examples:** `ev-e` / `ev-de` / `ev-den` · `okul-a` / `okul-da` / `okul-dan` · `kapı-ya` · `kitap-ta`
- **Vocabulary introduced:** gitmek (go), gelmek (come), durmak (stop)
- **Error tags:** `wrong_suffix_vowel`, `missing_buffer_y`, `wrong_consonant_harmony`, `wrong_case_choice`

### 7. Genitive · `genitive`
- **Prereqs:** `accusative`
- **Formula:** `noun + -(n)In  →  possessor ("of / ’s")`
- **Rules:** buffer **-n-** after a vowel (*kapı-nın*). Irregular *su→suyun*. Pronoun genitives are lexical: *benim, senin, onun, bizim, sizin, onların*.
- **Examples:** `ev-in` · `kapı-nın` · `Ali'nin` · `benim`
- **Vocabulary introduced:** anne (mother), baba (father), öğretmen (teacher)
- **Error tags:** `wrong_suffix_vowel`, `missing_buffer_n`, `missing_apostrophe`

### 8. Possessive Suffixes · `possessive`
- **Prereqs:** `vowel-harmony`, `consonant-assimilation`
- **Formula:** 1sg `-(I)m` · 2sg `-(I)n` · 3sg `-(s)I` · 1pl `-(I)mIz` · 2pl `-(I)nIz` · 3pl `-lArI`
- **Rules:** the `(I)`/`(s)` buffer appears only after a vowel-final stem: *ev-im* but *araba-m*; *ev-i* but *araba-sı*.
- **Examples:** `ev-im / ev-in / ev-i / ev-imiz / ev-iniz / ev-leri` · `araba-m` · `araba-sı`
- **Vocabulary introduced:** araba (car), el (hand), isim (name)
- **Error tags:** `wrong_possessive_person`, `wrong_suffix_vowel`, `missing_buffer_s`

### 9. İzafet (Genitive–Possessive Chains) · `izafet`
- **Prereqs:** `genitive`, `possessive`, `cases-dla`
- **Formula:** possessor`-(n)In` + possessed`-(s)I`  (definite) · bare noun + noun`-(s)I` (indefinite compound)
- **Rules:**
  - **Definite izafet** (a specific X of Y): both suffixes — *Türkiye'nin başkenti* (Turkey's capital), *ev-in kapı-sı* (the house's door).
  - **Indefinite/compound izafet** (a type of thing): possessed takes 3sg possessive, possessor takes **no** genitive — *otobüs durağı* (bus stop), *Türkçe öğretmeni* (Turkish teacher).
- **Examples:** `evin kapısı` · `Türkiye'nin başkenti` · `otobüs durağı`
- **Vocabulary introduced:** başkent (capital), durak (stop), pencere (window)
- **Error tags:** `izafet_missing_genitive`, `izafet_missing_possessive`, `definite_vs_compound_izafet`

---

## Tier 3 — Predication

### 10. Copula & var/yok · `copula`
- **Prereqs:** `vowel-harmony`
- **Formula:** predicate person suffixes (present): 1sg `-(y)Im` · 2sg `-sIn` · 3sg `-∅` (formal `-DIr`) · 1pl `-(y)Iz` · 2pl `-sInIz` · 3pl `-lAr` · existence: **var** / **yok**
- **Rules:**
  - Turkish has no verb "to be" in the present — a person suffix attaches to the predicate noun/adjective: *öğrenci-y-im* (I am a student), *hasta-sın* (you are sick), *evde* (he/she is at home).
  - **var** = "there is/exists", **yok** = "there isn't": *Masada kitap var.* (There's a book on the table.) *Evde kimse yok.* (No one is home.)
- **Examples:** `öğrenciyim` · `mutluyuz` (we are happy) · `Masada kitap var.` · `Evde kimse yok.`
- **Vocabulary introduced:** öğrenci (student), hasta (sick), mutlu (happy), masa (table), kimse (anyone/no one)
- **Error tags:** `wrong_person_suffix`, `wrong_suffix_vowel`, `var_yok_choice`

---

## Tier 4 — Verb System

### 11. Verb Stems & Infinitive · `verb-stems`
- **Prereqs:** `vowel-harmony`, `consonant-assimilation`
- **Formula:** infinitive `stem + -mAk` · stem = infinitive minus `-mAk`
- **Rules:** every conjugation builds on the bare stem. *gelmek → gel-*, *okumak → oku-*, *gitmek → git-* (note *t* surfaces as *d* before vowel-initial endings later).
- **Examples:** `gelmek → gel-` · `okumak → oku-` · `yapmak → yap-` · `gitmek → git-`
- **Vocabulary introduced:** yapmak (do/make), yemek (eat), içmek (drink), bilmek (know)
- **Error tags:** `wrong_stem`

### 12. Present Continuous · `present-iyor`
- **Prereqs:** `verb-stems`
- **Formula:** `stem (+ harmonized I) + -yor + person`
- **Rules:**
  - A consonant-final stem inserts a harmonized high vowel (ı/i/u/ü) before *-yor*: *gel-iyor*, *yap-ıyor*, *gör-üyor*. A vowel-final stem drops its final vowel: *oku → okuyor*, *bekle → bekliyor*.
  - *t→d* softening in some stems: *git → gidiyor*.
  - Person endings: *-um, -sun, -∅, -uz, -sunuz, -lar* → *geliyorum, geliyorsun, geliyor, geliyoruz, geliyorsunuz, geliyorlar*.
- **Examples:** `geliyorum` · `gidiyor` · `okuyor` · `yapıyoruz`
- **Vocabulary introduced:** beklemek (wait), yazmak (write)
- **Error tags:** `iyor_vowel_drop`, `wrong_suffix_vowel`, `wrong_person_suffix`, `no_consonant_softening`

### 13. Aorist (Habitual/General) · `aorist`
- **Prereqs:** `verb-stems`
- **Formula:** `stem + -(I)r / -Ar + person`  (negative `-mAz`)
- **Rules:**
  - Vowel-final stem → just *-r*: *oku-r*. Consonant-final: most polysyllabic → *-Ir* (*gelir → gel-ir*), many monosyllabic → *-Ar* (*yap-ar*, *iç-er*). There is a known list of ~13 irregular monosyllables (*al-ır, gel-ir, gör-ür…*) — mark per-verb; don't expect a rule to cover all.
  - Negative aorist is irregular: *-mAz* (*gelmez*, *yapmaz*), 1sg *-mAm* (*gelmem*).
  - Use: habits, general truths, willingness. *Her gün çay içerim.* (I drink tea every day.)
- **Examples:** `okur` · `gelir` · `yapar` · `gelmez`
- **Vocabulary introduced:** çay (tea), her gün (every day), bazen (sometimes)
- **Error tags:** `aorist_ir_vs_ar`, `aorist_irregular`, `aorist_negative`

### 14. Definite Past · `past-di`
- **Prereqs:** `verb-stems`
- **Formula:** `stem + -DI + person`
- **Rules:** witnessed/definite past. D-harmony: *git-ti*, *yap-tı* (voiceless), *gel-di*, *oku-du* (voiced). Person: *-m, -n, -k, -niz, -ler* → *geldim, geldin, geldi, geldik, geldiniz, geldiler*.
- **Examples:** `geldim` · `gitti` · `okudu` · `yaptık`
- **Vocabulary introduced:** dün (yesterday)
- **Error tags:** `wrong_consonant_harmony`, `wrong_suffix_vowel`, `wrong_person_suffix`

### 15. Future · `future-ecek`
- **Prereqs:** `verb-stems`
- **Formula:** `stem + -(y)AcAk + person`
- **Rules:** buffer **-y-** after a vowel stem (*oku-y-acak*). Before a vowel-initial person ending, final *k→ğ*: *gelecek + im → geleceğim*. *gitmek → gideceğim* (t→d).
- **Examples:** `geleceğim` · `gidecek` · `okuyacak` · `yapacağız`
- **Vocabulary introduced:** yarın (tomorrow), sonra (later)
- **Error tags:** `missing_buffer_y`, `future_k_softening`, `wrong_suffix_vowel`

### 16. Evidential Past · `past-mis`
- **Prereqs:** `verb-stems`, `past-di`
- **Formula:** `stem + -mIş + person`
- **Rules:** reported, inferred, or newly-discovered past (not personally witnessed). Contrast with `-DI`: *gelmiş* (apparently he came) vs *geldi* (he came, I saw it).
- **Examples:** `gelmiş` · `gitmiş` · `okumuş` · `yapmışlar`
- **Vocabulary introduced:** —
- **Error tags:** `wrong_suffix_vowel`, `di_vs_mis_choice`

### 17. Negation · `negation`
- **Prereqs:** `present-iyor`, `past-di`, `future-ecek`
- **Formula:** verbal `stem + -mA- + tense` · nominal `… değil`
- **Rules:**
  - The negative *-mA-* sits between stem and tense suffix: *gel-me-di → gelmedi*, *yap-ma-yacak → yapmayacak*.
  - Before *-yor* the negative *-mA-* raises to *-mI-*: *gel-mi-yor → gelmiyor*.
  - Aorist negative is the special *-mAz* from Unit 13.
  - Nominal/adjectival negation uses **değil**: *öğrenci değilim* (I'm not a student).
- **Examples:** `gelmedi` · `gelmiyor` · `yapmayacak` · `öğrenci değilim`
- **Vocabulary introduced:** değil (not)
- **Error tags:** `negation_placement`, `negation_iyor_raising`, `wrong_suffix_vowel`

### 18. Question Particle · `question-mi`
- **Prereqs:** `copula`, `present-iyor`
- **Formula:** `… mI` — separate word, harmonizes, carries the person ending
- **Rules:** *mI* is written as a separate word but harmonizes with the preceding word (*mı/mi/mu/mü*). The person suffix moves onto *mI*: *Geliyor musun?* (Are you coming?), *Öğrenci misin?* (Are you a student?), *Evde mi?* (Is he home?).
- **Examples:** `Geliyor musun?` · `Öğrenci misin?` · `Okudu mu?` · `Evde mi?`
- **Vocabulary introduced:** —
- **Error tags:** `mi_harmony`, `mi_spacing`, `mi_person_placement`

---

## Tier 5 — Modality & Complex Syntax

### 19. Imperative & Optative · `imperative`
- **Prereqs:** `verb-stems`
- **Formula:** 2sg = bare stem · 2pl/polite `-(y)In(Iz)` · optative 1sg `-(y)AyIm`, 1pl `-(y)AlIm`, 3sg `-sIn`
- **Rules:** *Gel!* (Come!), *Gelin / Geliniz* (Come, polite/pl), *Geleyim* (Let me come), *Gidelim* (Let's go), *Gelsin* (Let him come).
- **Examples:** `Gel!` · `Geliniz` · `Gidelim` · `Gelsin`
- **Vocabulary introduced:** —
- **Error tags:** `imperative_person`, `wrong_suffix_vowel`

### 20. Ability / Possibility · `ability`
- **Prereqs:** `verb-stems`, `negation`
- **Formula:** positive `stem + -(y)Abil + tense` · negative `stem + -(y)A + -mA` ("cannot")
- **Rules:** *gel-ebil-ir → gelebilir* (can come), *yap-abil-ir → yapabilir*. Negative drops *bil*: *gel-e-me-m → gelemem* (I can't come), *yapamıyorum* (I can't do it).
- **Examples:** `gelebilir` · `okuyabilir` · `gelemem` · `yapamıyorum`
- **Vocabulary introduced:** —
- **Error tags:** `ability_negative_form`, `missing_buffer_y`, `wrong_suffix_vowel`

### 21. Necessitative · `necessitative`
- **Prereqs:** `verb-stems`
- **Formula:** `stem + -mAlI + person`  ("must / should")
- **Rules:** *gel-meli-y-im → gelmeliyim* (I must come), *yapmalısın* (you should do). Negative: *gelmemeliyim*.
- **Examples:** `gelmeliyim` · `yapmalısın` · `gitmeli`
- **Vocabulary introduced:** —
- **Error tags:** `wrong_suffix_vowel`, `wrong_person_suffix`

### 22. Conditional · `conditional`
- **Prereqs:** `copula`, `past-di`
- **Formula:** verbal conditional `stem + (tense) + -sE` · copular `… -(y)sE`
- **Rules:** *gelirse* (if he comes — aorist + se), *gelse* (if he were to come), *gelseydi* (if he had come). Copular conditional on nouns/adjectives: *öğrenciysen* (if you are a student), *evdeyse* (if he's home).
- **Examples:** `gelirse` · `gelse` · `öğrenciysen`
- **Vocabulary introduced:** eğer (if — optional emphasis word)
- **Error tags:** `conditional_form`, `wrong_suffix_vowel`

### 23. Participles · `participles`
- **Prereqs:** `past-di`, `future-ecek`
- **Formula:** subject `-(y)An` · object/factual `-DIK (+ possessive)` · future `-(y)AcAK (+ possessive)`
- **Rules:**
  - **Subject participle `-(y)An`** (the one who Vs): *gelen adam* (the man who comes/came).
  - **Object participle `-DIK`** (the X that someone Vs), carries a possessive marking the subject: *okuduğum kitap* (the book I read), *gördüğün ev* (the house you saw). Note *k→ğ* before the vowel possessive.
  - **Future participle `-(y)AcAK`**: *okuyacağım kitap* (the book I will read).
- **Examples:** `gelen adam` · `okuduğum kitap` · `okuyacağım kitap`
- **Vocabulary introduced:** adam (man)
- **Error tags:** `participle_choice`, `dik_possessive`, `k_softening`

### 24. Converbs · `converbs`
- **Prereqs:** `past-di`
- **Formula:** `-(y)Ip` (and-then) · `-(y)ErEk` (by/while doing) · `-(y)IncA` (when/once) · `-(y)ken` (while)
- **Rules:** link clauses without a conjunction. *Gelip gitti* (he came and [then] left). *Koşarak geldi* (he came running / by running). *Eve gelince beni ara* (call me when you get home).
- **Examples:** `gelip gitti` · `koşarak geldi` · `gelince` · `yürürken` (while walking)
- **Vocabulary introduced:** koşmak (run), yürümek (walk), aramak (call/search)
- **Error tags:** `converb_choice`, `missing_buffer_y`, `wrong_suffix_vowel`

### 25. Postpositions · `postpositions`
- **Prereqs:** `cases-dla`, `izafet`
- **Formula:** word + postposition, with case government
- **Rules:**
  - Bare-noun / genitive-pronoun: **ile** (with), **için** (for), **gibi** (like), **kadar** (as…as) → *benim için* (for me), *otobüs ile / otobüsle* (by bus), *aslan gibi* (like a lion).
  - **Ablative** government: **sonra** (after), **önce** (before), **başka** (other than) → *dersten sonra* (after class).
  - **Dative** government: **göre** (according to), **kadar** (until/up to), **doğru** (towards) → *bana göre* (in my opinion), *akşama kadar* (until evening).
- **Examples:** `benim için` · `otobüsle` · `dersten sonra` · `bana göre`
- **Vocabulary introduced:** ders (class/lesson), akşam (evening), otobüs (bus), aslan (lion)
- **Error tags:** `postposition_case_government`, `ile_cliticization`

---

## Cumulative vocabulary allowlist (maintained as units are authored)

Exercises for a concept may only use words introduced **at or before** that concept (plus a small closed set of function words: bu/şu/o, ve, ben/sen/o/biz/siz/onlar, çok, bir). Keep this list in sync as the canonical allowlist the validator checks against.

```
Tier 1–2: ev, kapı, kitap, okul, su, çocuk, dağ, göz, kız, yol, gün, ay, yıl, araba,
köpek, deniz, ağaç, kanat, renk, uçak, at, kuş, anne, baba, öğretmen, el, isim,
başkent, durak, pencere
Tier 3:   öğrenci, hasta, mutlu, masa, kimse
Tier 4:   görmek, okumak, sevmek, gitmek, gelmek, durmak, yapmak, yemek, içmek,
bilmek, beklemek, yazmak, çay, her gün, bazen, dün, yarın, sonra, değil
Tier 5:   adam, koşmak, yürümek, aramak, ders, akşam, otobüs, aslan, eğer
```

> This list is intentionally small. The goal is mastery of *structure* over breadth of vocabulary — words recur across many exercises until known.
