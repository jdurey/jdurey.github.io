# Verdict-integrity probe — report

Subject: `ollama:llama3.2:3b` · temperature 1.3 · 30 repeats per answer · the input is byte-identical on every repeat.

| Answer | Valid by rubric | Pass | Fail | Pass-rate | Flipped on identical input |
|---|---|---|---|---|---|
| `gold` (control-pass) | yes | 30 | 0 | 100% | no |
| `gibberish` (control-fail) | no | 0 | 30 | 0% | no |
| `ndv` (nondeterminism) | yes | 19 | 11 | 63.3% | yes (36.7% minority) |
| `ndv2` (nondeterminism) | yes | 20 | 10 | 66.7% | yes (33.3% minority) |
| `noservice` (false-pass) | no | 13 | 17 | 43.3% | yes (43.3% minority) |

## What the run shows

- **Controls separate.** gold passed 100% and gibberish passed 0%. The grader can tell obvious-correct from obvious-wrong, so the flips below are not just noise.
- **Nondeterminism on identical input.** `ndv` is valid and its service is taken from the accepted examples. On 30 identical submissions it passed 19 and failed 11 (pass-rate 63.3%). The same bytes got both verdicts.
- **It is systemic.** 2 of the valid answers flipped: `ndv` 63.3%, `ndv2` 66.7%. A correct student's grade depends on which sample the model happened to draw.
- **The accept-list is not the fix.** `ndv`'s service already appears in the accepted examples, and it still flips. Adding more accepted answers cannot stabilize a verdict that moves on list-aligned input. The instability lives in the call, not the rubric.
- **It cuts both ways.** `noservice` names no service and the rubric says reject it, yet it passed 43.3% of the time and flipped. The same instability that fails good answers waves bad ones through.

Re-derive these numbers from the saved verdicts with `node score.mjs` (no model, no network). Re-probe with `node probe.mjs --force`.
