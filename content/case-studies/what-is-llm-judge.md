---
title: "What is llm judge"
slug: what-is-llm-judge
date: 2026-07-31
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
What is an LLM judge? Short answer: you test whether the AI actually helps a student learn, not whether the model sounds plausible. I bring classroom and curriculum judgment first, then build runnable AI-quality harnesses to make that judgment measurable. This page walks through the method and links to one you can point at your own system.

This is the method behind [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Read it, run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, then build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. Worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 2. Measure against a baseline, not a vibe.

Compare against a neutral control, so the number actually means something. A score with nothing to compare it to is theater. Worked example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family, or a held-out set. Agreement across independent checks is the only verdict I trust. Worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

The point is the overlap: real classroom, curriculum, and assessment judgment, made measurable with AI and eval tooling. Every claim here maps to a public, reproducible harness, not a slide deck. Want this run against your own system? The method transfers directly.
