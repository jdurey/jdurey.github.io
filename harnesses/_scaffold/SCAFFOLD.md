# Synthetic-NDA harness scaffold

A shared scaffold for the harness family in this folder. Each harness demonstrates a real method on a
**fictional** domain, so the machine is public while the real client work stays behind its NDA.
Extracted at the third such harness (`agent-boundary`), from the common surface of `expert-parity` and
`feedback-integrity`. The pattern was deliberately NOT abstracted at N=1 or N=2 — three concrete
instances earned it.

## The shared shape

```
<harness>/
  domain/        the fictional world: data + (optionally) a builder that lays it on disk
  golden/        human-verified ground truth + the canary battery
  results/       raw model responses (system of record) + scored JSON
  <rung>.mjs      one file per rung, cheapest first
  score.mjs      folds the rungs into a per-class/per-vector verdict against golden/
  manifest.mjs   audit trail: dataset + code hashes, model versions, reproducibility checklist
  README.md · NDA-BOUNDARY.md · TRANSFER-MEMO.md
```

## What lives in `core.mjs`

- `LOCAL` + `runLocal()` — the reproducible local baseline subject (Llama 3.2 3B via ollama, temp 0),
  so every number recomputes on a laptop with no API keys.
- `CLI_SUBJECTS` + `runCLI()` — cross-model subjects driven through locally-installed CLIs (Codex,
  Grok, Gemini-via-agy), fail-soft so a dead CLI is recorded as a gap, not a crash.
- `extractJSON`, `arg`, `rng`, `seededShuffle`, `tokens`, `norm` — the generic plumbing every harness
  re-derived before this extraction.

## The conventions that make a result trustworthy

1. **Fictional domain is load-bearing, not flavor.** A blind probe (name the answer / name the boundary
   crossing) is only valid if the subject can't succeed from prior knowledge. Invented content forces
   the only path to success to be the thing under test — a leak, a crossing — not recall.
2. **Arbitrary canaries make leaks objective.** A sealed token can't be guessed, so its appearance
   downstream is proof, not opinion. No model grades another model on the load-bearing call.
3. **The scoring oracle is independent of the thing under test.** The grader must not share code with
   the artifact it grades.
4. **Cheap/cross-model rungs propose; trusted objective rungs dispose.** Cheap and CLI subjects are
   candidate-only or reported; graduation leans only on deterministic rungs and a human-verified golden
   set.
5. **Raw responses are the system of record.** Non-deterministic subjects get every response saved, so
   the tables recompute from disk.
6. **Graduation is per class / per vector, never an average.** An easy class catching everything can't
   be allowed to hide one that collapsed.

## Instances

- `expert-parity/` — blind expert-parity on a fictional insurer.
- `feedback-integrity/` — AI-feedback defect classes on a fictional K-8 bank.
- `agent-boundary/` — agent data-boundary adherence on a fictional workspace.
