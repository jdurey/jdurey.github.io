# MANIFEST — Telemetry-Gates Harness

Audit trail for reproducibility. Hashes are sha256 (first 16 hex). Regenerate with `node manifest.mjs`.

## Files

| File | sha256:16 |
|---|---|
| `data/generations.csv` | `12cf54fc82c6ce77` |
| `golden/expected.json` | `464165ffb7167933` |
| `generate.mjs` | `78828f38eb901a0a` |
| `gate.mjs` | `eaff424d055fb0ba` |
| `score.mjs` | `85724020efc08dfa` |
| `../_scaffold/core.mjs` | `d2965d0fedf39e56` |

## Pipeline

`node generate.mjs` (synthetic fleet, 3 planted defects, constructible ground truth) → `node gate.mjs` (3 deterministic gates: silent truncation, reasoning tax, latency tail) → `node score.mjs` (exact-set self-test vs golden).

No model calls anywhere — telemetry only. The synthetic fleet and providers are fictional.

## Headline

- Self-test: PASS — cutoff flagged [sable-9b], reasoning_tax flagged [quill-120b], latency_tail flagged [NimbusServe]; 0 missed, 0 extra.
- Motivating (real, personal-account aggregate, July 2026): one model truncated 5.7% of responses silently; 8 models spent 83–95% of completion tokens on reasoning; provider p50 spread 1.1s→20s, worst p95 89s.
