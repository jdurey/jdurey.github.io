---
title: "How to evaluate llm output"
slug: how-to-evaluate-llm-output
date: 2026-07-31
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
How do you evaluate LLM output? You test whether the AI actually helps students learn, not whether the model just sounds plausible. That's the short answer. I start with education-domain judgment, then I build runnable AI-quality harnesses to make that judgment measurable. This page walks through the method and links to one you can run against your own system.

This is the method behind [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Read it, then run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, and build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. I show exactly this in [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 2. Measure against a baseline, not a vibe.

Compare it to a neutral control, so the number actually means something. A score with nothing to compare it to is just theater. [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/) measures it against a real baseline.

### 3. Check it a second, independent way.

Re-run it with a different model family or a held-out set. Agreement across independent checks is the only verdict worth trusting. [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/) is that same check, run a second way.

The overlap is the point: deep classroom, curriculum, and assessment judgment becomes measurable when you pair it with AI/eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
