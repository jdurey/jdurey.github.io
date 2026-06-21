# Judge-Trust POC

**Can you trust an LLM to QC educational content?** This is a fully-automated instrument that
measures how often an LLM-as-judge *rubber-stamps deliberately-broken quiz items* (false-positive
passes) — and demonstrates a cross-family, fictional-content method that drives that rate down and
reports when a judge is trustworthy enough to run unattended.

One command produces [`report.md`](report.md) with the headline numbers.

```bash
./run.sh            # full run (config.yaml)
./run.sh config.smoke.yaml   # fast 2-family smoke run
./run.sh --force    # regenerate everything from scratch
```

---

## Why this is methodologically honest

The hard problem in judging a judge is **where does ground truth come from?** If an LLM injects or
labels the defects, you are validating a judge against an unverified judge — circular. This POC
refuses that:

> **Ground truth is by CONSTRUCTION, never by LLM judgment.**

- Defects are injected by **deterministic structural mutations** whose label is true *by the
  operation* (`inject.py`).
- "Clean" items are admitted only after a **deterministic check** confirms no target-defect
  predicate fires (`verify_clean.py`).
- The scorer compares judge verdicts to these by-construction labels with **no LLM in the labeling
  path** (`score.py`).

The integrity of that spine is enforced by a self-test that must pass before any run:
`detect_X(inject_X(clean)) == True` **and** `detect_X(clean) == False` for every defect
(`python3 src/inject.py --selftest`, also stage 0 of `run.sh`).

All content is about **fictional topics** (fake countries, elements, events) so a judge cannot lean
on memorized facts — this isolates *reasoning about item structure* from *world knowledge*.

## The five defect classes (real ed-content QC failure modes)

| Class | Mutation | True-by-construction label |
|---|---|---|
| **ARF** | correct answer's text inserted into a wrong option's feedback | answer reveal |
| **GDF** | a distractor overwritten with the correct answer | ghost distractor (two correct) |
| **FOM** | per-option feedback rotated off its option | feedback-option mismatch |
| **KEY-LEN** | correct option padded to be uniquely longest | length cueing |
| **FRQ-LEAK** | rubric's required points concatenated into the prompt | rubric leak |

## What the harness reports

1. **Per-family false-positive-pass rate** — how often each vendor passes a broken item (the
   dangerous error), alongside false-fail rate (a judge that fails everything isn't "good").
2. **Self-enhancement matrix (N×N)** — false-pass rate for every (generator family, judge family)
   pair. The diagonal (a model judging its *own* output) vs the off-diagonal is the bias signal.
3. **Cross-family K-of-N agreement** — require K of N independent vendors to agree before PASS,
   fail-closed; sweep K and watch the false-pass / false-fail tradeoff. This is the fix.
4. **Graduation verdict** — sensitivity at a fixed specificity floor; a single "trustworthy enough
   to run unattended / not yet" call per judge and for the cross-family ensemble.

## Pipeline

```
run.sh chains:
  0. inject.py --selftest      GT-integrity gate (aborts if the spine is broken)
  1. generate.py   LLM → fictional CLEAN items, round-robin across 4 vendor families  → items_clean.jsonl
  2. inject.py     DETERMINISTIC defect injectors + by-construction labels            → items_labeled.jsonl
  3. verify_clean  DETERMINISTIC drop of any clean item that trips a detector          → items_verified.jsonl
  4. judge.py      batched cross-family grading (resumable, timeout-bounded)           → verdicts.jsonl
  5. score.py      verdicts vs by-construction GT                          → metrics.json + report.md
```

**Independence is at the vendor/training level** — Claude (Anthropic), Codex/GPT (OpenAI),
Grok (xAI), Gemini (Google) — invoked via their local CLIs. That is what makes "verifier
independence" real rather than cosmetic, and it is the basis of the K-of-N result.

The judge stage caches verdicts per (item, family), so a run is **fully resumable**: a crash,
timeout, or interruption loses nothing and a re-run only fills gaps. Any family that flakes or
times out degrades to an abstain — it never hangs the pipeline.

## Config (`config.yaml`)

`n_mcq`, `n_frq`, `seed`, `defect_frac`, `families`, `batch_size`, and the graduation floors
(`spec_floor`, `sens_target`). The deterministic stages are fully seeded; LLM generation is cached
to disk so re-runs are reproducible from the committed artifacts.

## Reproducing the published numbers without model access

Judging calls the four vendor CLIs, so a full `./run.sh` needs them installed. You do not need them
to check the result. The judge verdicts are saved in `data/verdicts.jsonl` and the scorer is
deterministic, so you can re-derive `report.md` from the saved ballots alone:

```bash
PYTHONPATH=src python3 src/score.py \
  --items data/items_verified.jsonl --verdicts data/verdicts.jsonl \
  --metrics-out data/metrics.json --report-out report.md \
  --families claude,codex,grok,gemini --seed 42
```

The ground-truth spine is also checkable on its own, with no model and no network:
`python3 src/inject.py --selftest`.

## Honesty / scope

- **DO claim:** a reproducible instrument that quantifies false-positive-pass rate and
  judge-trustworthiness for *structurally-defined* ed-content defects, with sound ground truth and
  no human in the loop.
- **DO NOT claim:** that a human golden set is eliminated *in general*. By-construction GT works
  *because* the defects are synthetic; on real content, ground-truth sourcing remains the open
  frontier. This POC is the automated floor, not the whole solution.
- **No LLM touches the labeling path** — by design, to avoid the exact circularity the POC studies.
