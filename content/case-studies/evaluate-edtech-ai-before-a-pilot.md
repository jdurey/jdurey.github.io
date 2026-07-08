---
title: "How to evaluate an AI-education product before a school pilot"
slug: evaluate-edtech-ai-before-a-pilot
date: 2026-07-08
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
Before an AI-education product goes anywhere near a school pilot, I test one thing: whether it actually helps students learn, not whether the model sounds plausible. I start with education-domain judgment, then I use runnable AI-quality harnesses to make that judgment measurable. This page walks through the method and links to one you can point at your own system.

This is the method behind [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/), and you can read it and run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong and build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. A worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 2. Measure against a baseline, not a vibe.

Compare it to a neutral control so the number actually means something. A score with nothing to compare it to is theater. A worked example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family or a held-out set. Agreement across independent checks is the only verdict I trust. A worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

The point is the overlap. I bring deep classroom, curriculum, and assessment judgment, and I make it measurable with AI/eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
