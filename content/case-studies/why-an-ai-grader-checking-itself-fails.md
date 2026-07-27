---
title: "Why an AI grader checking its own output can't be trusted, and what to do"
slug: why-an-ai-grader-checking-itself-fails
date: 2026-07-27
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
An AI grader that checks its own output can't be trusted. Here's what I do about it. The short answer is you test whether the AI actually helps students learn, not whether the model just sounds plausible. I lead with education-domain judgment, then use runnable AI-quality harnesses to make that judgment measurable. This page walks through the method, and links to one you can point at your own system.

This is the method behind [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). You can read it and run it yourself.

### 1. Make the failure observable.

I pick the specific way something can go wrong and build the smallest input that triggers it. If I can't make it fail on purpose, I can't prove it works. Here's a worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 2. Measure against a baseline, not a guess.

I compare to a neutral control so the number actually means something. A score with nothing to compare it to is just theater. Here's a worked example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

### 3. Check it a second, independent way.

I re-run with a different model family or a held-out set. Agreement across independent checks is the only verdict worth trusting. Here's a worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

The point is the overlap. I bring deep classroom, curriculum, and assessment judgment, and I make it measurable with AI and eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
