---
title: "Model evaluation in machine learning"
slug: model-evaluation-in-machine-learning
date: 2026-09-25
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Blind expert-parity: can a model adjudicate like a credentialed examiner, and can you prove it?."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
Model evaluation in machine learning. The short answer: you test whether the AI helps students learn, not just whether the model sounds plausible. I bring education-domain judgment first, then I use runnable AI-quality harnesses to make that judgment measurable. This page walks through the method and links to one you can point at your own system.

This is the method behind [Blind expert-parity: can a model adjudicate like a credentialed examiner, and can you prove it?](https://jdurey.github.io/work/expert-parity-harness/). You can read it and run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, then build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. A worked example: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a vibe.

Compare it to a neutral control so the number actually means something. A score with nothing to compare it to is theater. Another one: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family, or against a held-out set. Agreement across independent checks is the only verdict worth trusting. One more: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

The point is the overlap: deep classroom, curriculum, and assessment judgment made measurable with AI/eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
