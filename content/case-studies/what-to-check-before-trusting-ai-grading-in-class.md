---
title: "What to check before trusting AI grading in a classroom"
slug: what-to-check-before-trusting-ai-grading-in-class
date: 2026-07-27
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
I test whether AI grading actually helps a kid learn, not whether the model sounds convincing. That's the check I run before I trust it in a classroom. I lead with classroom judgment first, then build a harness that makes that judgment measurable. This page walks through the method, and links to one you can run against your own system.

This is the method behind [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Read it, then run it yourself.

### 1. Make the failure observable.

I pick the specific way something can go wrong and build the smallest input that triggers it. If I can't make it fail on purpose, I can't prove it works. [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/) walks through this.

### 2. Measure against a baseline, not a vibe.

I compare against a neutral control, so the number actually means something. A score with nothing to compare it to is theater. [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/) is the worked version.

### 3. Check it a second, independent way.

I re-run with a different model family, or against a held-out set. Agreement across independent checks is the only verdict I trust. [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/) shows this from the other side.

The overlap is the point. I bring deep classroom, curriculum, and assessment judgment, and make it measurable with AI/eval tooling. Every claim on this page maps to a public, reproducible harness, not a slide. Want this run against your own system? The method transfers directly.
