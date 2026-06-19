# MANIFEST — Blind Expert-Parity Harness

Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.

## Dataset (the holdout + policy)

| File | sha256:16 |
|---|---|
| `domain/policy.raw.md` | `9647b6ce5da3ef20` |
| `domain/policy.core.json` | `625abd05769d0689` |
| `domain/cases.json` | `7445f9da01b078dd` |
| `golden/regression.json` | `37ae72ea22b1e8b0` |

## Code (instrument version pins)

| File | sha256:16 |
|---|---|
| `engine.mjs` | `81ee2456dec10190` |
| `run.mjs` | `cf3181dedca4bfa0` |
| `judge.mjs` | `665879f81bd388f4` |
| `metrics.mjs` | `867493a7f3013c03` |
| `harden.mjs` | `a50621a8bf2ea8e2` |
| `models.mjs` | `c1ccb9adcbf93e96` |

## Models (as run)

**Candidates:**
- `claude` — Claude (Sonnet 4.6, Claude Code CLI) · pinned: `claude-code:sonnet`
- `codex` — GPT (OpenAI Codex CLI, default model) · pinned: `codex-cli:default`
- `grok` — Grok (xAI Grok CLI, default model) · pinned: `grok-cli:default`
- `gemini` — Gemini (agy print-mode) · pinned: `agy:print`
- `ollama` — Llama 3.2 3B (local, ollama) · pinned: `ollama:llama3.2:3b`

24 claims × 5 candidates = 120 adjudications, 120 raw responses saved.

**Blind A/B:** candidate `grok`, judges [codex, claude], repeat-judge `codex`, 24 claims, 72 judge responses (72 raw saved).

## Prompt templates

Prompt templates are inlined in `run.mjs` (`buildPrompt`) and `judge.mjs` (`buildJudgePrompt`); their hashes are pinned via the code hashes above. The candidate prompt fixes a closed verdict set and a JSON schema; the judge prompt masks identity and fixes an error taxonomy.

## Headline (from results/metrics.json)

| Model | κ vs examiner | accuracy | false-pay | false-deny |
|---|---|---|---|---|
| GPT (OpenAI Codex CLI, default model) | 1 | 1 | 0 | 0 |
| Grok (xAI Grok CLI, default model) | 1 | 1 | 0 | 0 |
| Gemini (agy print-mode) | 1 | 1 | 0 | 0 |
| Claude (Sonnet 4.6, Claude Code CLI) | 0.7513 | 0.8333 | 0 | 0 |
| Llama 3.2 3B (local, ollama) | 0.0643 | 0.1667 | 1 | 11 |

## Reproducibility checklist

- [x] Deterministic ground truth (`engine.mjs`), locked by `golden/regression.json` (`node harden.mjs --check`).
- [x] Seeded bootstrap (seed 12345, B=2000) and seeded A/B order (seed 707) — CIs and order reproduce exactly.
- [x] Local model pinned (`llama3.2:3b`, temperature 0); CLI candidates recorded by version string above.
- [x] Every raw model response saved (`results/raw/`, `results/raw_judge/`) — all tables recompute via `node metrics.mjs`.
- [x] Candidates never see the structured core or the engine; only `policy.raw.md` + the raw claim.
- [ ] CLI candidate runs are not bit-reproducible (hosted models drift); the saved raw responses are the system of record, not a promise of identical re-runs.

