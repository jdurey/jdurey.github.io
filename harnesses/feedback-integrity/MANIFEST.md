# MANIFEST — Feedback-Integrity Harness

Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.

## Dataset (synthetic, fictional)

| File | sha256:16 |
|---|---|
| `domain/ledger.json` | `7fbb22ad6c479979` |
| `golden/findings.json` | `45078df1ab6cd267` |

14 synthetic items (5 clean, 3 ARF, 2 GDF, 3 FOM, 1 LCU). Fictional world; no real client content.

## Code (instrument version pins)

| File | sha256:16 |
|---|---|
| `screen.mjs` | `55a7f4c67602a441` |
| `solve.mjs` | `ec9ebfb4acd3e226` |
| `semantic.mjs` | `7beed577ada2887d` |
| `score.mjs` | `5dae9afe45420de6` |
| `models.mjs` | `6bfe8c8d6cf75e6c` |

## Model (as run)

- `ollama` — Llama 3.2 3B (local, ollama) · pinned: `ollama:llama3.2:3b` · temperature 0
- Blind-solver: 14 reconstruction calls, 14 raw responses saved.
- Cheap semantic pass: 14 classification calls, 14 raw responses saved.

## Headline (from results/scores.json)

| Class | recall | flagged | canary | verdict |
|---|---|---|---|---|
| ARF | 1 | 3 | ok | READY |
| GDF | 0 | 0 | MISS | HOLD |
| FOM | 0.333 | 1 | ok | HOLD |
| LCU | 1 | 1 | ok | READY |

Cheap semantic pass vs golden: agreement 21%, precision 21%, false-flagged 6/6 clean items, COLLAPSED onto "FOM". Candidate-only; never auto-counted.

## Reproducibility checklist

- [x] Fictional dataset authored from scratch; no real client content (firewall: NEUTRAL).
- [x] Golden findings + canary battery lock the adjudication ground truth; graduation is per class.
- [x] Deterministic screen is a pure function of the ledger (no model, no network).
- [x] Blind-solver gets only wrong-answer feedback (no stem, no options, no key); fictional content blocks knowledge-solving; free-text blocks elimination.
- [x] Cheap semantic proposals are never auto-counted toward graduation — trusted objective rungs only.
- [x] Every raw model response saved (`results/raw/`, `results/raw_semantic/`) — all tables recompute via `node score.mjs`.
- [ ] Local-model runs are temperature 0 but not bit-guaranteed across ollama versions; the saved raw responses are the system of record.

