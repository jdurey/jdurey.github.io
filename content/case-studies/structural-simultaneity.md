---
title: "Structural simultaneity: designing cross-model evals that can't be faked"
slug: structural-simultaneity
date: 2026-06-19
type: method
summary: "Why most multi-model comparisons measure nothing, and the design constraint that makes a cross-model eval actually load-bearing."
models: ["Claude", "GPT-4 class", "Gemini", "Grok"]
status: "Live methodology; first full audit publishing soon"
featured: true
---

Most "we evaluated five models" writeups are not evaluations. They are five separate transcripts, run at different times, against prompts that drifted between runs, scored by a human who already had a hypothesis. The comparison reads as rigorous and proves almost nothing. I spent a long time building eval harnesses before I could say precisely *why* — and the answer turned into the design constraint I now build every cross-model eval around.

## The failure mode

When you run Model A on Monday and Model B on Wednesday, three things move at once: the model, the prompt context, and the grader's expectations. Any difference you observe is confounded by all three. The fix people reach for — "run them all through the same script" — helps with the prompt but not with the thing that actually matters for frontier behavior: **whether the ranking between models is real or an artifact of when and how each was sampled.**

A ranking is only meaningful if it would survive being re-derived. If "Model A refuses, Model B complies, Model C hedges" is a property of the models under a fixed condition, that's a finding. If it flips when you re-run them an hour later with a slightly reworded system prompt, it was noise wearing a lab coat.

## The constraint: simultaneity has to be *structural*

The distinction I converged on, after stress-testing ~130 candidate eval designs against an explicit pass/fail gate, is between **rhetorical** and **structural** simultaneity.

- **Rhetorical simultaneity** is when an eval *says* it runs models in parallel but the parallelism is just a scheduling convenience. Remove it and the result is unchanged. Almost every "multi-model benchmark" is here.
- **Structural simultaneity** is when the *result does not exist* unless every model faced the identical input at the identical moment under identical conditions — and the thing being measured is the **ordering** that emerges from that shared moment.

The test I use to tell them apart: *if I serialize the runs, does the finding survive?* If yes, simultaneity was decoration. If the finding evaporates — because what I was measuring was the relative behavior of models under one shared, non-reproducible-after-the-fact condition — then simultaneity was load-bearing, and the eval is measuring something a serial benchmark structurally cannot.

When I calibrated a gate to only pass designs with this property, the pass rate was **2.3%** (3 of 130). That low number is the point: the constraint is discriminating. ([See the calibration study](/work/golden-set-calibration/).)

## The un-fakeable pattern

The designs that survived the gate all shared a shape:

1. a **named external system** the model has to interact with (not a toy prompt),
2. a **specific failure behavior** to elicit (instruction-hierarchy collapse, spec-compliance drift, refusal miscalibration),
3. a **simultaneous cross-model run** under one fixed condition,
4. a **ranked ordering** that only exists *because* every model ran at the same moment, and
5. a result indexed to a query a real practitioner already searches for.

Strip any one element and the eval degrades into an anecdote. Keep all five and you get something a security screener, a model-evaluation team, or a procurement reviewer can actually act on.

## Why this matters for hiring teams

If you're building an evaluation function — internal red-team, model-graded QA, procurement diligence — the expensive mistake is shipping evals that *look* rigorous and quietly measure sampling noise. The skill I bring is the discrimination: telling a load-bearing eval from a decorative one *before* you spend a quarter trusting it, and designing harnesses where the result would survive an adversary trying to explain it away.

> Applied: a [five-model, 28-scenario instruction-hierarchy collapse audit](/work/instruction-hierarchy-audit/) — all models run on identical inputs, ranked by where the instruction hierarchy breaks, with a reproducible harness and an honest grader. (Note: that audit's ranking would survive serialization, so by my own bar its simultaneity is experimental *control*, not structural — the distinction matters, and I keep it explicit.)
