---
title: "How to red-team AI-built tools and content before they reach a classroom"
slug: red-team-ai-built-tools-before-classroom-use
date: 2026-07-29
type: guide
summary: "A practical answer grounded in a runnable, published harness rather than opinion. Links to Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Answer to a real buyer question · grounded in a runnable harness · auto-published"
draft: false
featured: false
geo_artifact: true
voiced: "voiced"
---
How do you red-team AI-built tools and content before they reach a classroom? The short answer is that you test whether the AI actually helps a kid learn, not whether the model sounds plausible. I lead with education-domain judgment first, then back it up with runnable AI-quality harnesses that make that judgment measurable. This page walks through the method and links to one you can run against your own system.

This is the method behind [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Read it, then run it yourself.

### 1. Make the failure observable.

Pick the specific way this breaks and build the smallest input that triggers it. If you can't make it fail on purpose, you can't prove it works. Worked example: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

### 2. Measure against a baseline, not a vibe.

Compare it to a neutral control so the number actually means something. A score with nothing to compare it to is theater. See it in practice: [Same answer, different grade: measuring when an AI grader can't hold a verdict](https://jdurey.github.io/work/verdict-integrity/).

### 3. Check it a second, independent way.

Re-run it with a different model family or a held-out set. Agreement across independent checks is the only verdict I trust. Same harness answers this too: [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/).

The overlap is what matters. I bring real judgment from classrooms, curriculum, and assessment work, then hold it to the same rigor as an AI eval. Every claim on this page maps to a public, reproducible harness, not a slide. Want this run against your own system? The method transfers directly.
