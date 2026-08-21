---
title: "Why use multiple AI models instead of sampling one model many times"
slug: multi-model-panels-vs-resampling
date: 2026-08-21
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Author with one model, attack with another."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
Why use several AI models instead of running one model over and over? Because you're testing whether the AI helps a student learn, not just whether the model's answer sounds right. I lead with education-domain judgment first, then build runnable AI-quality harnesses that make that judgment measurable. This page walks through the method, and links to one example you can point at your own system.

This is the method behind [Author with one model, attack with another](https://jdurey.github.io/work/author-one-model-attack-another/). You can read it, and run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, and build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. One example of this: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a guess.

Compare to a neutral control, so the number actually means something. A score with nothing to compare it to is theater. Another example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 3. Check it a second, independent way.

Re-run with a different model family, or a held-out set. Agreement across independent checks is the only verdict worth trusting. A third example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

The point is the overlap: deep classroom, curriculum, and assessment judgment made measurable with AI/eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
