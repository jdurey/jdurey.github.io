---
title: "Blind expert-parity: can a model adjudicate like a credentialed examiner, and can you prove it?"
slug: expert-parity-harness
date: 2026-06-19
type: eval
summary: "What clients actually want to know is whether a model can do an expert's judgment work, and whether you can defend the answer. I built the harness that measures it: domain distillation, a reference examiner, a blind A/B against the model, and κ with confidence intervals. Then I ran it on a synthetic insurance-adjudication domain so the whole machine is public while the real one stays under NDA. Three frontier models hit examiner parity, a small local model wasn't close, and the interesting failures were all in the precedence rules."
models: ["Grok", "GPT (Codex CLI)", "Gemini", "Claude (Sonnet 4.6)", "Llama 3.2 3B"]
status: "Complete · reproducible harness + saved raw responses"
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/expert-parity"
repoLabel: "harness + raw responses"
queued: true
queueOrder: 5
---

The question a client actually asks isn't whether the model is good. They want to know if it can
do the job their expensive human expert does, and whether you can prove it well enough to stake a
launch on. That's a harder question than a benchmark score, because the answer has to survive
someone who knows the domain pushing back on it. This is the harness I use to answer it.

I can't show you the engagement that made me build it. It's under NDA, a different domain, a real
credentialed expert on the other side. So I rebuilt the whole instrument on a **synthetic** domain
I made up from scratch, ran real models through it, and put the entire thing in the open. You get
the machine. The client keeps the case file.

## One thing I'm not going to pretend

In a real engagement the thing you measure a model against is a **credentialed human**. This public
demo doesn't have an NDA-free human to put on the stand, so the examiner is a **deterministic rules
engine** that computes ground truth from each claim's structured facts. That's an honest reference,
because a synthetic domain can have constructible ground truth, and it lets the instrument run end
to end where you can see it. But I'm not going to call it a human. The whole point of the
[transfer memo](https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/expert-parity/TRANSFER-MEMO.md)
is that a real expert drops into that exact slot, and every number below is computed the same way
once they do. So read the κ as the model agreeing with the reference standard. Don't read it as the
model matching a human. The rig is built to put the human there. This demo just doesn't have one.

## The domain, and why insurance

I needed something with the shape that makes expert judgment hard. Messy real-world inputs, a dense
rulebook, and the part that separates an examiner from a keyword matcher, which is **rules about
which rule wins**. Property-insurance claim adjudication has all of it. I wrote a fictional
homeowner's policy for an insurer that doesn't exist, with covered perils, exclusions, sub-limits,
a deductible, and four rules that only a careful reader applies correctly:

- **Anti-concurrent causation.** If an excluded cause contributes at all, the loss is excluded,
  *even when a covered peril also contributed*. A hurricane that damages a house with both wind
  (covered) and storm surge (excluded flood) is denied, not split.
- **The ensuing-loss carve-out.** A worn-out pipe isn't covered. But if it bursts and floods the
  floor, the *flood damage* is covered while the pipe repair isn't. Coverage flips back on, but
  only partway, and only for two of the exclusions.
- **The vacancy override.** A covered peril in a house that sat empty too long is denied anyway.
- **Refer, don't guess.** When the cause genuinely can't be determined, the right answer is to
  escalate, not to pick a verdict.

The first step is **distillation**. The raw policy prose becomes a structured core: entities, rules,
and an explicit precedence order. The reference examiner reasons from that core. The candidate
models never see it. They get the raw policy and one raw claim narrative, and they have to
reconstruct the whole adjudication themselves, exactly like a human reading a file.

## The verdict card

I ran 24 synthetic claims across five models on identical inputs. Clean approvals, clean denials,
sub-limit and deductible math, and a red-team battery: the precedence traps, a hallucinated-coverage
trap, a genuinely ambiguous case, and policy-boundary edges. Each model returns a constrained
verdict (`APPROVE / PARTIAL / DENY / REFER`), a dollar figure, the controlling clause, and its
reasoning. The constraint is what makes the grade honest, because the verdict is a closed set and
the payout is a checkable number.

κ is Cohen's kappa against the examiner, which is agreement corrected for chance. **False-pay** is
the one that costs a real insurer money, because the model approved something the examiner denied.

| Model | κ vs examiner | Accuracy | False-pay | False-deny |
|---|---|---|---|---|
| GPT (Codex CLI) | **1.00** | 100% | 0 | 0 |
| Grok | **1.00** | 100% | 0 | 0 |
| Gemini | **1.00** | 100% | 0 | 0 |
| Claude (Sonnet 4.6) | **0.75** | 83% | 0 | 0 |
| Llama 3.2 3B (local) | **0.06** | 17% | 1 | 11 |

Bootstrap 95% CIs (seeded, 2,000 resamples): Claude `[0.53, 0.94]`, Llama `[-0.01, 0.16]`. The
three perfect scores have a degenerate interval, because every resample of a perfect run is
perfect. That's exactly why I'm telling you the sample is 24 and calling this a probe, not a
benchmark.

## What actually shows up

**Frontier models reach examiner parity on this task.** Three of them adjudicated all 24 claims the
way the examiner did, precedence traps included. The flood-inside-a-hurricane case was designed to
bait a model into splitting a loss that the anti-concurrent rule says to deny outright, and they got
it. That's a real result and I'll state it plainly. On a domain like this, the frontier can do the
verdict.

**The small local model can't, and it fails in a specific way.** Llama 3.2 3B scored κ=0.06, which
is chance. It didn't get hijacked or hallucinate wildly. It punted. On 19 of 24 claims it answered
REFER, refusing to adjudicate even the clean ones, and on one below-deductible claim it approved a
payout that shouldn't exist. Teams reach for small local models in exactly these pipelines, for cost
and for privacy. This is the measurement that tells you not to put one in the examiner's chair.

**The failures cluster in the precedence rules.** Claude's misses this run were all over-reductions.
It called three full approvals "partial," hedging a payout the examiner paid in full, and on the
hurricane it referred instead of denying. None of it cost money, but it's the tell. The precedence
cases are where the parity is real but thin. They're the subtle ones, and they're exactly where you'd
want a human gate first. This run is a single pass per model, so I won't put a number on how much the
frontier wavers there. But those are the cases I'd expect to move run to run, and pinning that down
with repeated seeds is the next thing I'd add.

## Blind A/B: can a judge tell the model from the examiner?

The κ table says the model and the examiner agree on the verdict. It doesn't say the model's
*reasoning* holds up. So the second layer is a blind comparison. A judge model sees the policy, the
claim, and two adjudications labeled only A and B. One is the examiner's, one is the candidate's
(Grok), in randomized order with identity masked. The judge picks the better claims decision or calls
a tie. A second judge gives inter-rater reliability, and a repeat pass with the order flipped checks
for position bias.

Across the blind comparison, a judge never once picked the examiner over the model. The candidate
took **29 wins, 19 ties, and 0 losses, non-inferior 100% of the time.** The two judges agreed at
κ=0.58, and when I flipped the A/B order the judge held the same call 88% of the time, so position
bias is low. One honest wrinkle. The model's rationales were also longer and more fluent than the
examiner's terse, templated ones, and fluent prose flatters a blind reviewer. So I read this as the
model never being judged the worse adjudicator. I don't read it as the model out-reasoning the
examiner. The zero losses is the number doing the work here, not the wins.

## Hardening: the examiner had to earn the trust too

The reference examiner started naive. Identify the covered peril, apply the sub-limit and the
deductible, done. That first draft silently mis-adjudicated the cases that need the precedence rules.
Run through the adversarial battery, the naive examiner got **4 cases wrong in the direction that
leaks money**. It paid the flood-in-a-hurricane claim, paid the earthquake-fire claim, paid the
vacant-house claim, and guessed a verdict on the unknowable one instead of referring it. The hardened
examiner gets all of them right.

| Adversarial battery (10 cases) | Wrong | Money-leak exploits |
|---|---|---|
| Naive examiner | 5 / 10 | 4 |
| Hardened examiner | 0 / 10 | 0 |

Those correct verdicts are now locked in a [golden-regression file](https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/expert-parity/golden/regression.json).
Any future edit to the engine that regresses one of them fails the check. That's the difference
between a script that happened to work once and an instrument you can stake a decision on.

## Honest limitations

- **The examiner is simulated**, not human, in this demo. I said it up top and I'll say it again. The
  κ is parity with a deterministic reference standard. The value of the real engagement is putting a
  credentialed human in that seat, which this rig is built to do.
- **24 claims is a probe.** It's built to find *where* a model breaks, which precedence class, not to
  publish a tight industry number. The CIs are wide on purpose, and reported, not buried.
- **The candidates are agent CLIs**, with their own system prompts, not bare API calls. That's the
  shipping surface, which I'd argue is the more honest thing to measure. But it isn't a controlled
  base-model comparison, and I won't dress it up as one.
- **Hosted models drift.** Re-running won't reproduce bit-for-bit. That's why every raw response is
  saved as the system of record, and the whole table recomputes from them.

The point was never that models are good at insurance. The point is that I can take a
launch-gating question, can your model do my expert's job, and turn it into a number you can
defend. It comes with a confidence interval, a blind comparison, and an audit trail behind it. And
it runs on your domain, against your expert, without ever exposing either. The synthetic version is
public so you can read the machine. The [NDA boundary](https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/expert-parity/NDA-BOUNDARY.md)
and the [10-day transfer memo](https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/expert-parity/TRANSFER-MEMO.md)
are how it points at yours.
