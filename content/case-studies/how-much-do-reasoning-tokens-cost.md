---
title: "How much do reasoning tokens add to LLM API costs"
slug: how-much-do-reasoning-tokens-cost
date: 2026-08-06
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Three failures your LLM pipeline never logs: gates for truncation, reasoning tax, and latency tails."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
How much do reasoning tokens add to LLM API costs? I ask a different question: does the AI help a student learn, or does it just sound plausible? I lead with education-domain judgment first. Then I use runnable AI-quality harnesses to make that judgment measurable. This page walks through the method, and links to one you can run against your own system.

This is the method behind [Three failures your LLM pipeline never logs: gates for truncation, reasoning tax, and latency tails](https://jdurey.github.io/work/telemetry-gates/). Read it. Run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong and build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. A worked example: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a guess.

Compare to a neutral control so the number means something. A score with nothing to compare it to is theater. A worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 3. Check it a second, independent way.

Re-run with a different model family or a held-out set. Agreement across independent checks is the only verdict worth trusting. A worked example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

I work the overlap: deep classroom, curriculum, and assessment judgment, made measurable with AI and eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
