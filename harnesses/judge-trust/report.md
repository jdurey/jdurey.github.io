# Judge-Trust POC — Results

_Generated 2026-06-21T06:29:14Z · seed 42 · 50 items (25 deliberately broken, 25 clean) · 4 vendor families: claude, codex, grok, gemini_

> A naive single LLM judge passes **5%** of items I deliberately broke, and the rate is **10%** when a model grades its *own* output vs **3%** on others' (self-enhancement gap **+8 pts**). A cross-family, fictional-content harness (2-of-4 agreement, fail-closed) drops the false-pass rate to **0%**.

## Method (one paragraph)

Ground truth is **by construction**: a deterministic injector applies one structural defect (ARF / GDF / FOM / KEY-LEN / FRQ-LEAK) and stamps the label that is true by the operation; clean items are admitted only after every structural detector confirms none fire. **No LLM ever touches the labeling path.** All content is about fictional topics so judges cannot lean on memorized facts. Four independent vendor families grade every item against one fixed PASS/FAIL rubric, blind to the labels.

## 1 · Per-family judge accuracy

| Family | False-pass (bad→PASS) | False-fail (clean→FAIL) | Sensitivity | Specificity | Errors |
|---|---|---|---|---|---|
| claude | 4% | 8% | 96% | 92% | 0 |
| codex | 8% | 4% | 92% | 96% | 0 |
| grok | 8% | 0% | 92% | 100% | 0 |
| gemini | 0% | 12% | 100% | 88% | 0 |

_False-pass = rubber-stamping a broken item (the dangerous error). A judge that FAILs everything scores 0% false-pass but high false-fail — read both._

## 2 · False-pass rate by defect type

| Defect | claude | codex | grok | gemini |
|---|---|---|---|---|
| ARF | 0% (n=5) | 0% (n=5) | 0% (n=5) | 0% (n=5) |
| FOM | 0% (n=5) | 0% (n=5) | 20% (n=5) | 0% (n=5) |
| FRQ-LEAK | 0% (n=5) | 40% (n=5) | 0% (n=5) | 0% (n=5) |
| GDF | 0% (n=5) | 0% (n=5) | 0% (n=5) | 0% (n=5) |
| KEY-LEN | 20% (n=5) | 0% (n=5) | 20% (n=5) | 0% (n=5) |

## 3 · Self-enhancement matrix (false-pass; generator ↓ × judge →)

| Generator \ Judge | claude | codex | grok | gemini |
|---|---|---|---|---|
| claude | 0% ◆ | 0% | 0% | 0% |
| codex | 0% | 25% ◆ | 0% | 0% |
| grok | 0% | 0% | 17% ◆ | 0% |
| gemini | 17% | 0% | 17% | 0% ◆ |

◆ = judging own output. Diagonal mean **10%** vs off-diagonal mean **3%** → self-enhancement bias **+8 pts**.

## 4 · Cross-family K-of-N agreement (fail-closed)

_Over 25 bad + 25 clean items with a complete ballot from all families. PASS requires ≥K families to vote PASS._

| K of N | False-pass | False-fail | Sensitivity | Specificity |
|---|---|---|---|---|
| 1 of 4 | 20% | 0% | 80% | 100% |
| 2 of 4 | 0% | 4% | 100% | 96% |
| 3 of 4 | 0% | 4% | 100% | 96% |
| 4 of 4 | 0% | 16% | 100% | 84% |

## 5 · Graduation verdict

_Graduated = specificity ≥ 80% AND sensitivity ≥ 90% (trustworthy enough to run unattended)._

| Judge | Sensitivity | Specificity | Graduated? |
|---|---|---|---|
| claude | 96% | 92% | ✅ yes |
| codex | 92% | 96% | ✅ yes |
| grok | 92% | 100% | ✅ yes |
| gemini | 100% | 88% | ✅ yes |
| **cross-family 2-of-4** | 100% | 96% | ✅ yes |

## Honesty notes (the guardrails that *are* the credibility)

- **What this measures:** a reproducible, fully-automated false-positive-pass rate for *structurally-defined* defects, with ground truth sound because the defects are synthetic.
- **What it does NOT claim:** that a human golden set is eliminated in general. By-construction GT works *because* the content is synthetic; on real content, ground-truth sourcing is still the open frontier.
- **No LLM in the labeling path** — labels come only from deterministic mutations and detectors, so the experiment is not circular.
- **Sample size:** 25 bad + 25 clean items; per-defect and per-matrix-cell N is small (single digits), so the self-enhancement delta is *directional evidence*, not a significance claim. Scale `n_mcq`/`n_frq` in config.yaml to tighten the estimates.


_Reproducibility: seed 42, families responded ['claude', 'codex', 'grok', 'gemini'], synthetic backfill 0 items. Re-run `./run.sh` to regenerate._
