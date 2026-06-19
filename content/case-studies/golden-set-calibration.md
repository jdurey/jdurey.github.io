---
title: "Calibrating an eval-design gate against 130 candidates"
slug: golden-set-calibration
date: 2026-06-16
type: eval
summary: "Building a self-hardening gate to separate load-bearing eval designs from decorative ones — and the surprise that the gate out-discriminated the generator."
models: ["Claude Haiku (generation)", "Claude Sonnet (gate)"]
status: "Complete"
featured: true
---

I wanted a repeatable way to answer a question that usually gets answered by vibes: *is this eval design actually good, or does it just sound good?* So I built a gate — a five-condition pass/fail check — and then did the thing that makes a gate trustworthy: I ran a labeled population through it and measured how it behaved.

## Setup

Three cycles, each generating a batch of candidate eval designs and running every one through the gate:

| Cycle | Candidates | Promoted | Pass rate |
|---|---|---|---|
| 1 | 60 | 2 | 3.3% |
| 2 | 40 | 1 | 2.5% |
| 3 | 30 | 0 | 0% |
| **Total** | **130** | **3** | **2.3%** |

Generation was done by a cheap model (fast, high-volume); the gate evaluations by a stronger one. Each candidate carried structured fields so the gate scored the same dimensions every time, and each cycle fed its failure analysis forward to make the next batch harder to fool.

## Three findings

**1. The recursion sharpened the diagnosis without raising the pass rate.** Each cycle's candidates were explicitly engineered to beat the previous cycle's failure mode — and each cycle the gate found a *new*, deeper reason to reject them. Cycle 1: self-referential designs don't pull real-world interest. Cycle 2: designs leaned on knowledge only an insider would have. Cycle 3: every candidate *claimed* parallel execution, and the gate correctly found all 30 were using parallelism as scheduling convenience, not as a structural requirement. The promote rate stayed flat *while the rejections got smarter* — exactly what you want from a gate that's calibrated rather than gameable.

**2. The gate out-discriminated the generator.** This was the surprising part. The candidates were designed from inside a frame that *thought* it satisfied the bar; the gate, scoring from outside that frame, kept finding the gap the generator couldn't see. A generator and a grader sharing the same blind spot is the classic way model-graded evals quietly fail. Here the asymmetry was the safeguard — and it's a reminder that your grader has to be able to see failures your author can't.

**3. Cheap models over-credit framing.** I tested whether the cheap generation model could also pre-label its own output (promote / cull). It agreed with the gate only **23%** of the time, with a systematic bias toward false promotes: it over-credited baroque, confident-sounding framing without ever running the plain-language check that would have collapsed it. **Operating rule that came out of this: never treat a cheap model's "this is good" as a positive signal — use it only as a filter for the obvious culls.** That asymmetry (trust the negative, distrust the positive) is worth knowing before you wire a small model into any grading loop.

## Why it's reusable

The gate is infrastructure, not a one-off. The same load → gate → harvest-failure-analysis loop works on any design-quality question where you can articulate the pass conditions and afford to generate a population to calibrate against. The cost discipline matters too: bulk generation on a cheap tier, judgment on a strong tier, held the whole three-cycle run to roughly a twentieth of a naive all-strong-model estimate without weakening the gate.

The headline I keep: **a gate is only worth trusting once you've watched it reject things, and counted.** 2.3% is what calibrated discrimination looks like.
