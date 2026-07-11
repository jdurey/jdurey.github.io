---
title: "Why AI-generated lesson content drifts from the standard it claims to teach"
slug: ai-lesson-content-drifts-from-standard
date: 2026-07-11
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
AI-generated lesson content drifts from the standard it claims to teach. You test whether the AI actually helps students learn. Whether the model sounds plausible doesn't matter. I bring education-domain judgment first, then build runnable AI-quality harnesses that make that judgment measurable. This page walks through the method, and links to one you can point at your own system.

This is the method behind [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/). You can read it and run it yourself.

### 1. Make the failure observable.

Pick the specific way this can go wrong, and build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. See it in practice: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

### 2. Measure against a baseline, not a vibe.

Compare it to a neutral control so the number actually means something. A score with nothing to compare it to is theater. Worked example: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family, or against a held-out set. Agreement across independent checks is the only verdict worth trusting. This is the same check from a different angle: [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/).

The overlap is the point. That's deep classroom, curriculum, and assessment judgment, made measurable with AI and eval tooling. Every claim here maps to a public, reproducible harness, not a slide. If you want this run against your own system, the method transfers directly.
