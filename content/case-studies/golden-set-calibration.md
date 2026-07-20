---
title: "Calibrating an eval-design gate against 130 candidates"
slug: golden-set-calibration
date: 2026-06-16
type: eval
summary: "Building a self-hardening gate to separate load-bearing eval designs from decorative ones, and the surprise that the gate out-discriminated the thing generating the candidates."
models: ["Claude Haiku (generation)", "Claude Sonnet (gate)"]
status: "Complete · run in a private working repo — figures quoted from the saved run; harness not yet public"
featured: true
---

I wanted a repeatable way to answer a question that usually gets answered by feel. Is this eval design actually good, or does it just sound good? So I built a gate, which is a five-condition pass/fail check. And then I did the thing that makes a gate trustworthy. I ran a labeled population through it and measured how it behaved.

## Setup

Three cycles. Each one generated a batch of candidate eval designs and ran every candidate through the gate.

| Cycle | Candidates | Promoted | Pass rate |
|---|---|---|---|
| 1 | 60 | 2 | 3.3% |
| 2 | 40 | 1 | 2.5% |
| 3 | 30 | 0 | 0% |
| **Total** | **130** | **3** | **2.3%** |

A cheap model did the generation, because it's fast and high-volume. A stronger model did the gate evaluations. Each candidate carried structured fields so the gate scored the same dimensions every time. And each cycle fed its failure analysis forward, so the next batch was harder to fool.

## Three findings

**The recursion sharpened the diagnosis without raising the pass rate.** Each cycle's candidates were built to beat the previous cycle's failure mode. And each cycle, the gate found a new, deeper reason to reject them. Cycle 1 caught self-referential designs that don't pull real-world interest. Cycle 2 caught designs that leaned on knowledge only an insider would have. Cycle 3 was the sharpest. Every candidate claimed parallel execution, and the gate correctly found that all 30 were using parallelism as scheduling convenience, not as a structural requirement. So the promote rate stayed flat while the rejections got smarter, which is exactly what you want from a gate that's calibrated instead of gameable.

**The gate out-discriminated the generator.** This was the surprising part. The candidates came from inside a frame that thought it satisfied the bar. The gate scored from outside that frame, and it kept finding the gap the generator couldn't see. A generator and a grader that share the same blind spot is the classic way model-graded evals quietly fail. So here the asymmetry was the safeguard. And it's a reminder that your grader has to be able to see failures your author can't.

**Cheap models over-credit framing.** I tested whether the cheap generation model could pre-label its own output as promote or cull. It agreed with the gate only 23% of the time, and it was biased toward false promotes. It over-credited baroque, confident-sounding framing and never ran the plain-language check that would have collapsed it. So here's the operating rule that came out of it. Never treat a cheap model's "this is good" as a positive signal. Use it only as a filter for the obvious culls. Trust the negative, distrust the positive. That's worth knowing before you wire a small model into any grading loop.

## Why it's reusable

The gate is infrastructure, not a one-off. The same load, gate, and harvest-the-failure-analysis loop works on any design-quality question where you can write down the pass conditions and afford to generate a population to calibrate against. And the cost discipline matters too. Bulk generation on a cheap tier, judgment on a strong tier, held the whole three-cycle run to roughly a twentieth of a naive all-strong-model estimate, and it didn't weaken the gate.

So here's the line I keep. A gate is only worth trusting once you've watched it reject things, and counted. 2.3% is what calibrated discrimination looks like.
