---
title: "Structural simultaneity: designing cross-model evals that can't be faked"
slug: structural-simultaneity
date: 2026-06-19
type: method
summary: "Why most multi-model comparisons measure nothing, and the one design constraint that makes a cross-model eval actually carry weight."
models: ["Claude", "GPT-4 class", "Gemini", "Grok"]
status: "Live methodology, first full audit shipped"
featured: true
---

Most "we evaluated five models" writeups aren't evaluations. They're five separate transcripts, run at different times, against prompts that drifted between runs, scored by someone who already had a hunch. The comparison reads as rigorous and proves almost nothing. I spent a long time building eval harnesses before I could say exactly why. And the answer turned into the design constraint I now build every cross-model eval around.

## The failure mode

When you run Model A on Monday and Model B on Wednesday, three things move at once. The model moves, the prompt context moves, and the grader's expectations move. So any difference you see is tangled up in all three. The usual fix is "run them all through the same script," and that helps with the prompt. But it doesn't help with the thing that actually matters for frontier behavior. The real question is whether the ranking between models is true, or whether it's an artifact of when and how each one got sampled.

A ranking only means something if it would survive being re-derived. If "Model A refuses, Model B complies, Model C hedges" is a property of the models under a fixed condition, that's a finding. If it flips an hour later when you reword the system prompt a little, it was noise wearing a lab coat.

## The constraint: simultaneity has to be structural

After stress-testing about 130 candidate eval designs against an explicit pass/fail gate, the distinction I kept landing on was between rhetorical and structural simultaneity.

Rhetorical simultaneity is when an eval says it runs models in parallel, but the parallelism is just scheduling convenience. Take it away and the result is unchanged. Almost every "multi-model benchmark" lives here.

Structural simultaneity is different. The result doesn't exist unless every model faced the identical input at the identical moment under identical conditions, and the thing you're measuring is the ordering that comes out of that shared moment.

So I use one test to tell them apart. If I serialize the runs, does the finding survive? If yes, the simultaneity was decoration. If the finding evaporates, because what I was measuring was the relative behavior of models under one shared condition that can't be reconstructed after the fact, then the simultaneity was load-bearing. And the eval is measuring something a serial benchmark structurally can't.

When I calibrated a gate to only pass designs with that property, the pass rate was 2.3%, which is 3 out of 130. That low number is the point, because the constraint is doing real work. Here's [the calibration study](/work/golden-set-calibration/).

## The un-fakeable pattern

The designs that survived the gate all shared a shape. There's a named external system the model has to interact with, not a toy prompt. There's a specific failure behavior to pull out, like instruction-hierarchy collapse or refusal miscalibration. There's a simultaneous cross-model run under one fixed condition. There's a ranked ordering that only exists because every model ran at the same moment. And the result is indexed to a query a real practitioner already searches for.

Strip any one of those and the eval drops back to an anecdote. Keep all five and you get something a security screener, a model-evaluation team, or a procurement reviewer can actually act on.

## Why this matters for hiring teams

If you're building an evaluation function, whether that's an internal red-team, model-graded QA, or procurement diligence, the expensive mistake is shipping evals that look rigorous and quietly measure sampling noise. So the skill I bring is the discrimination. I can tell a load-bearing eval from a decorative one before you spend a quarter trusting it. And I design harnesses where the result would survive an adversary trying to explain it away.

> Applied: a [five-model, 28-scenario instruction-hierarchy collapse audit](/work/instruction-hierarchy-audit/). All models run on identical inputs, ranked by where the hierarchy breaks, with a reproducible harness and an honest grader. And to be straight about it, that audit's ranking would survive serialization, so by my own bar its simultaneity is experimental control, not the structural kind. I keep that distinction explicit because it's the whole point.
