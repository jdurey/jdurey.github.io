# Feedback-Integrity Harness

**When an AI writes the wrong-answer feedback for a quiz item, can you measure — not guess — whether that feedback quietly leaks the answer, invents a concept, or explains the wrong option? And can you tell when it's safe to stop checking by hand?**

This is the instrument I use to answer that, shown here on a **synthetic, fictional** K-8 Social
Studies bank so the whole machine is public while the real client bank stays behind its NDA. It
takes a bank of multiple-choice items, runs three rungs over the wrong-answer feedback — cheapest
first — and reports a **per-class graduation verdict**: which defect classes the pipeline can run
unsupervised, and which still need a human.

The companion writeup is [`content/case-studies/feedback-integrity.md`](../../content/case-studies/feedback-integrity.md).

## Why the data is fictional (it's load-bearing)

The ledger is an invented world — the Korin, the Tola, Lake Onu, the Charter of Onu. That is not
flavor. The centerpiece rung is a **blind-solver** that tries to name an item's correct answer from
its wrong-answer feedback alone. If the items used real facts (rivers, the Constitution), a model
would name the answer from prior knowledge and we'd be measuring its social-studies trivia, not
whether the feedback leaked. With invented content, the **only** way to recover an item's arbitrary
answer is if a feedback blurb gave it away. Same discipline as the expert-parity harness's fictional
insurer: the instrument is real, the domain is synthetic, and the line is labeled everywhere.

## The three defect classes (in the wrong-answer feedback)

| Class | What it is | Synthetic example in the ledger |
|---|---|---|
| **ARF** — answer-reveal | a wrong option's feedback teaches/states the correct answer | I02 (verbatim), **I03 (paraphrase)**, I10 |
| **GDF** — ghost-distractor | feedback names a thing on no option and not in the stem | I04 (subtle), I11 (a blatant anachronism) |
| **FOM** — feedback-option mismatch | feedback explains a different option than the one it's on | I05 (identical-to-option), I06, I13 |
| **LCU** — length cue | the correct option is conspicuously the longest (structural) | I07 |

## The pipeline, cheapest rung first

1. **Deterministic screen** ([`screen.mjs`](screen.mjs)) — exact, zero-cost tells: feedback
   identical to an option (FOM), feedback reusing ≥2 of the key's distinctive words (ARF), the
   longest-option-is-key cue (LCU). It deliberately has **no** ghost or subtle-mismatch rule —
   those have no exact signature, and a screen that overreaches is the false-confidence this whole
   instrument exists to defeat. Every flag is a candidate.
2. **Blind-solver** ([`solve.mjs`](solve.mjs)) — the centerpiece. Hands a local model *only* the
   three wrong-answer feedback blurbs (no stem, no options, no key) and asks it to reconstruct the
   correct answer. A reconstruction that names a **distinctive key token** means the feedback leaked
   it. Free-text (not multiple-choice) so the model can't solve by elimination; fictional content so
   it can't solve from knowledge. This rung catches the **paraphrased** leak the lexical screen
   structurally cannot see.
3. **Cheap semantic pass** ([`semantic.mjs`](semantic.mjs)) — a cheap model proposes a class + quote
   per item. Its output is **candidate-only, never auto-counted** toward graduation (see results
   below for why). Cheap models propose; they never adjudicate.
4. **Adjudication** — in a real engagement, a strong model or a human. In this public demo the
   adjudicator slot is filled by the **golden findings file**
   ([`golden/findings.json`](golden/findings.json)), human-verified and labeled as such — exactly
   how expert-parity fills its human-examiner slot with a deterministic reference.

[`score.mjs`](score.mjs) scores the trusted rungs against the golden set and emits, per class:
**recall**, a **noise tripwire**, a **canary check**, and a **READY / HOLD** verdict. Graduation is
per class — an easy class catching everything can't hide a class that collapsed.

## Results on this synthetic bank (real local-model run)

```
class  golden  recall   flagged(limit)  canary   verdict
  ARF      3        1   3(<=6)          ok      READY — graduate to unsupervised
  GDF      2        0   0(<=4)          MISS    HOLD — keep a human on this class
  FOM      3    0.333   1(<=6)          ok      HOLD — keep a human on this class
  LCU      1        1   1(<=2)          ok      READY — graduate to unsupervised

  ARF I02: screen   ·   ARF I03: solver  <- screen missed it; blind-solver caught it   ·   ARF I10: screen
  cheap semantic pass vs golden: agreement 21% · precision 21% · false-flagged 6/6 clean items
    -> COLLAPSED onto one label (14/14). Pure candidate noise; never auto-counted.
```

- **Answer-reveal graduates.** The screen caught the two word-for-word leaks; the blind-solver
  caught the paraphrase (I03) the screen's lexical rule missed. Recall 1.0, canary caught, no noise.
- **The cheap semantic pass was useless here** — a 3B local model collapsed onto a single class and
  false-flagged every clean item (21% agreement). That is the empirical reason the instrument never
  auto-trusts it. The classes only a competent semantic pass or a human could catch — ghost-distractor
  and subtle option-mismatch — correctly stay **HOLD**.
- **Per-class is the point.** ARF and LCU run unsupervised; GDF and FOM keep a human on the loop.

## Reproduce

```bash
node screen.mjs       # rung 1: deterministic screen           -> results/screen.json
node solve.mjs        # rung 2: blind-solver (local model)     -> results/solver.json + results/raw/
node semantic.mjs     # rung 3: cheap semantic pass (local)    -> results/semantic.json + results/raw_semantic/
node score.mjs        # per-class recall/noise/canary/verdict  -> results/scores.json
node manifest.mjs     # refresh dataset + code hashes          -> MANIFEST.md
```

The blind-solver and semantic pass run on local **Llama 3.2 3B** via `ollama` (temperature 0) — no
API keys, runs on a laptop. Every raw model response is saved under `results/raw/` and
`results/raw_semantic/` so every number recomputes from the system of record.

## Honest limitations

- **The numbers from the real bank stay under NDA.** What's public is the method, the synthetic
  fictional items, and the machine. The real catch rates and counts belong to the program.
- **The blind-solver measures exploitability, not intent.** It shows a student *could* name the
  answer from the feedback alone. It does not claim one *did*.
- **A 3B local model is a deliberately weak "cheap rung."** In a real engagement that slot is a
  frontier-small model that actually discriminates; here it's a free local model, and the harness
  honestly shows what happens when the cheap rung is too weak — you fall back to the trusted
  objective rungs and a human. See [`TRANSFER-MEMO.md`](TRANSFER-MEMO.md).
- **A clean run is a claim that has to survive its own zero.** A zero from this instrument means
  "the golden set says zero and the canaries were caught," not "nothing's there." If the golden set
  or canaries drift, re-score before trusting any verdict.
- **14 items is a probe, not a benchmark.** It's built to show where each rung breaks, not to
  publish a tight number. The NDA boundary is in [`NDA-BOUNDARY.md`](NDA-BOUNDARY.md).
