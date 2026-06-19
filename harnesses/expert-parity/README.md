# Blind Expert-Parity Harness

**Can a model adjudicate like a credentialed examiner — and can you *prove* it, blind?**

This is the instrument I use to answer that, shown here on a **synthetic** domain so the
machine is fully public while the real client domain stays behind its NDA. It takes a messy
domain, distills it to a structured core, runs candidate models against a reference examiner
on a blind holdout, and reports parity with confidence intervals — not vibes.

The demo domain is **property-insurance claim adjudication** (fictional insurer "Meridian
Mutual"). It has the shape that makes adjudication hard and measurable: covered perils,
exclusions, sub-limits, a deductible, and — the part that separates an examiner from a
keyword-matcher — **precedence rules** (anti-concurrent causation, an ensuing-loss carve-out,
a vacancy override, and a refer-don't-guess rule).

## The one honesty caveat, stated up front

In a real engagement the reference standard is a **credentialed human examiner**. This public
demo has no NDA-free human, so the examiner slot is filled by a **deterministic rules engine**
([`engine.mjs`](engine.mjs)) that computes ground truth from each claim's structured facts.
That is a defensible reference *because the synthetic domain has constructible ground truth*,
and it lets the whole instrument run end to end in the open. **The harness is built so a real
human examiner drops into exactly that slot** — their adjudications replace the engine's output
and every downstream metric is unchanged. See [`TRANSFER-MEMO.md`](TRANSFER-MEMO.md).

So: the *instrument* is real and the *numbers below are from real model runs*. The *examiner*
is simulated here, and I label that everywhere rather than implying a human was in the loop.

## What the instrument contains

| Spec piece | Where |
|---|---|
| Domain distillation (raw → structured core) | [`domain/policy.raw.md`](domain/policy.raw.md) → [`domain/policy.core.json`](domain/policy.core.json) |
| Reference examiner (ground truth + precedence) | [`engine.mjs`](engine.mjs) |
| Claim set + red-team/flaw taxonomy | [`domain/cases.json`](domain/cases.json) |
| Candidate runner (models read raw, adjudicate) | [`run.mjs`](run.mjs) |
| Blind A/B protocol (masking, randomization, IRR) | [`judge.mjs`](judge.mjs) |
| Metrics (κ, win/tie/loss, bootstrap CI, false-pay/deny, slices) | [`metrics.mjs`](metrics.mjs) |
| Adversarial hardening (naive vs hardened) + golden regression | [`harden.mjs`](harden.mjs), [`golden/regression.json`](golden/regression.json) |
| Audit trail (version pins, dataset hashes, repro checklist) | [`MANIFEST.md`](MANIFEST.md) |
| NDA boundary + transfer memo | [`NDA-BOUNDARY.md`](NDA-BOUNDARY.md), [`TRANSFER-MEMO.md`](TRANSFER-MEMO.md) |

## How parity is measured

1. **Distill.** The raw policy prose is distilled into a structured core: entities (perils,
   exclusions, sub-limits, deductibles), rules, and an explicit **precedence order** that
   resolves conflicts. The examiner reasons from the core; candidates never see it.
2. **Adjudicate (candidates).** Each candidate model gets the *raw* policy and *one raw claim
   narrative* and must return a constrained verdict (`APPROVE | PARTIAL | DENY | REFER`), a
   payable amount, the controlling clause, and a rationale — as JSON. Constrained outputs make
   grading honest: the verdict is a closed set and the dollar figure is checkable.
3. **Score vs the examiner.** Cohen's **κ** between each candidate's verdicts and the examiner's
   ground truth (chance-corrected agreement), plus accuracy, **false-pay** (paid a claim it
   should have denied — money out the door) and **false-deny** (refused a valid claim), dollar
   error, and per-class subgroup slices. Bootstrap 95% CIs (seeded, B=2000).
4. **Blind A/B.** For each claim a judge model sees the policy, the claim, and two adjudications
   masked as "A" and "B" — one examiner, one candidate — in randomized order, and picks the
   better claims decision (tie allowed) with a confidence and error tags. A second judge gives
   inter-rater reliability; a repeat pass with the order flipped measures position bias.

## Reproduce

```bash
node harden.mjs --check         # assert the examiner still matches the golden lock
node run.mjs                    # all claims × all candidates (claude, codex, grok, ollama)
node judge.mjs                  # blind A/B: best candidate vs examiner, 2 judges + repeat
node metrics.mjs                # κ / CI / false-pay-deny / slices / blind-A-B  → results/metrics.json
node manifest.mjs               # refresh dataset hashes + version pins  → MANIFEST.md
```

Candidates and judges are the **deployed CLI surfaces** (`claude`, `codex`, `grok`, `agy`/Gemini)
plus local **Llama 3.2 3B** via `ollama` — no API keys, runs on a laptop. Every raw
response is saved under `results/raw/` and `results/raw_judge/` so every number recomputes.

## Honest limitations

- **The examiner is simulated** (deterministic engine), not a human, in this public demo. That
  is the point of the transfer memo: the real-engagement value is swapping a human in. Don't
  read the κ below as "model matches a human" — read it as "model matches the *reference
  standard*, and here's the rig that would put a human on the other side."
- **24 claims is a probe, not a benchmark.** It's built to surface *where* a model breaks
  (which precedence class), not to publish a tight industry number. CIs are reported precisely
  so the sample size isn't oversold.
- **The candidates are agent CLIs** with their own system prompts, not bare API calls — the
  shipping surface, arguably more realistic, but not a controlled base-model comparison.
- **Synthetic policy.** "Meridian Mutual" is fictional; nothing here is insurance, legal, or
  financial advice. The domain was chosen to be structurally analogous to regulated reasoning
  while sharing nothing with any real client.
