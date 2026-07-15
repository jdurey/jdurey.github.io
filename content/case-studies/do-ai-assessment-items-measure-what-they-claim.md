---
title: "How to check whether AI-generated assessment items measure what they claim"
slug: do-ai-assessment-items-measure-what-they-claim
date: 2026-07-15
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Calibrating an eval-design gate against 130 candidates."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
How do you check whether an AI-generated assessment item actually measures what it claims to measure? You test whether the AI helps a student learn, not whether the model just sounds plausible. That's the short answer.

I lead with education-domain judgment first, then use runnable AI-quality harnesses to make that judgment measurable. This page walks through the method. And it links to one you can point at your own system.

This is the method behind [Calibrating an eval-design gate against 130 candidates](https://jdurey.github.io/work/golden-set-calibration/). You can read it and run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, then build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. A worked example: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a vibe.

Compare against a neutral control so the number actually means something. A score with nothing to compare it to is theater. A worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family or a held-out set. Agreement across independent checks is the only verdict worth trusting. A worked example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

The overlap is the point. I bring deep classroom, curriculum, and assessment judgment, and I make it measurable with AI and eval tooling. Every claim on this page maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
