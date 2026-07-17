---
title: "How to catch AI feedback that reveals the answer instead of teaching it"
slug: catch-ai-feedback-that-reveals-the-answer
date: 2026-07-17
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
How do you catch AI feedback that gives away the answer instead of teaching it? The short answer: you're testing whether the AI helps students learn, not whether the model just sounds plausible. I lead with education-domain judgment, then I use runnable AI-quality harnesses to make that judgment measurable. This page walks through the method and links to one you can point at your own system.

This is the method behind [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/), which you can read and run yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, then build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. I walked through this exact test in [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a vibe.

Compare it to a neutral control, so the number means something. A score with nothing to compare it to is just theater. [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/) is a worked example of what that looks like.

### 3. Check it a second, independent way.

Re-run it with a different model family or a held-out set. Agreement across independent checks is the only verdict I trust. [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/) works for this too.

The point is the overlap: deep classroom, curriculum, and assessment judgment made measurable with AI/eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
