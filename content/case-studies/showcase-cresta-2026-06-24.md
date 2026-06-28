---
title: "What Cresta's AI Evaluations Lead actually needs — and the proof I've already shipped"
slug: showcase-cresta-2026-06-24
date: 2026-06-24
type: method
summary: "A AI Evaluations Lead role at Cresta maps cleanly onto evaluation work I've already published. This page links the role's core skills to runnable, public harnesses — starting with Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Job-targeted showcase · maps a live role to real, runnable proof · auto-generated, 24h-veto reviewed"
draft: false
featured: false
showcase: true
job_company: "Cresta"
job_link: ""
voiced: "voiced"
---
An AI Evaluations Lead at Cresta wants someone who can measure whether an AI system is actually doing what it claims, not just whether it runs. That is what I have been building in public. Here is the role mapped to harnesses I have already shipped and can run on a call.

## The role, mapped to real proof

- **Measuring when an automated judge waves through broken work**. [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Teams now use an LLM to QC the content another LLM wrote. The risk is that the judge passes work that's actually broken, and it gets more lenient when it grades its own output. So I built a fully-automated instrument that measures exactly that. It breaks items in known ways, with no model anywhere near the labels, then asks four different vendors' models to grade them blind. A single judge waved through 5 percent of the items I broke on purpose, and the rate ran higher when a model judged its own work. Making four independent vendors agree before a pass drove the miss rate to zero.

- **Measuring a model against an expert baseline**. [Blind expert-parity: can a model adjudicate like a credentialed examiner, and can you prove it?](https://jdurey.github.io/work/expert-parity-harness/). What clients actually want to know is whether a model can do an expert's judgment work, and whether you can defend the answer. I built the harness that measures it: domain distillation, a reference examiner, a blind A/B against the model, and κ with confidence intervals. Then I ran it on a synthetic insurance-adjudication domain so the whole machine is public while the real one stays under NDA. Three frontier models hit examiner parity, a small local model wasn't close, and the interesting failures were all in the precedence rules.

- **A runnable, public proof of the core method**. [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/). When an AI writes the wrong-answer feedback for a quiz item, it tends to fail in three ways that are easy to miss. It teaches the key instead of the error, it invents a concept that isn't on the screen, or it explains a different option than the one it's attached to. A top-to-bottom read misses all three. So I built a measurement instrument that catches them, with a blind-solver at the center that turns 'is this feedback bad?' into 'can a student exploit it?' Then I gave it a golden set and a graduation test, so the human running it can measure when it's safe to stop checking by hand.

Each of these is a runnable harness with saved outputs on a public substrate (synthetic, NAEP/STAAR/OER-style, or fictional content). No proprietary data, no hand-waving. If the role is about trusting what a model tells you, the proof is already on the page.
