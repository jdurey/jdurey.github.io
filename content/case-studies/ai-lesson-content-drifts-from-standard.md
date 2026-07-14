---
title: "Why AI-generated lesson content drifts from the standard it claims to teach"
slug: ai-lesson-content-drifts-from-standard
date: 2026-07-14
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
AI-generated lesson content drifts from the standard it claims to teach. I don't test whether it sounds right. I test whether it helps a student learn the standard. Education judgment comes first. The AI-quality harness comes after, to make that judgment measurable and runnable. This page walks through the method, with a link you can run against your own system.

This is the method behind [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/). You can read it and run it yourself.

### 1. Make the failure observable.

Pick the exact way this can go wrong, then build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. This example makes the failure observable: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a guess.

Compare it to a neutral control, so the number actually means something. A score with nothing to compare it to is theater. This example runs the baseline comparison: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family, or a held-out set. Agreement across independent checks is the only verdict I trust. This example checks it the second way: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

The point is the overlap: classroom, curriculum, and assessment judgment, made measurable with AI/eval tooling. Every claim on this page maps to a public, reproducible harness, not a slide. If you want this run against your own system, it transfers directly.
