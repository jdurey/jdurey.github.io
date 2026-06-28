---
title: "What PrairieLearn's SWE — LLM agents + VLM grading actually needs — and the proof I've already shipped"
slug: showcase-prairielearn-2026-06-24
date: 2026-06-24
type: method
summary: "A SWE — LLM agents + VLM grading role at PrairieLearn maps cleanly onto evaluation work I've already published. This page links the role's core skills to runnable, public harnesses — starting with Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Job-targeted showcase · maps a live role to real, runnable proof · auto-generated, 24h-veto reviewed"
draft: false
featured: false
showcase: true
job_company: "PrairieLearn"
job_link: "https://prairielearn.com/jobs-ashby"
voiced: "voiced"
---
The PrairieLearn SWE role (LLM agents and VLM grading) wants someone who can measure whether an AI system is actually doing what it claims, not just whether it runs. That is the work I have been building in public. Here is the role's core, mapped to the harnesses I have already shipped and can run on a call.

## The role, mapped to real proof

- **Measuring when an automated judge waves through broken work**. [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Teams now use an LLM to QC the content another LLM wrote. The risk is that the judge passes work that's actually broken, and it gets more lenient when it grades its own output. So I built a fully-automated instrument that measures exactly that. It breaks items in known ways, with no model anywhere near the labels, then asks four different vendors' models to grade them blind. A single judge waved through 5 percent of the items I broke on purpose, and the rate ran higher when a model judged its own work. Making four independent vendors agree before a pass drove the miss rate to zero.

- **Catching ai-written feedback that leaks the answer**. [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/). When an AI writes the wrong-answer feedback for a quiz item, it tends to fail in three ways that are easy to miss. It teaches the key instead of the error, it invents a concept that isn't on the screen, or it explains a different option than the one it's attached to. A top-to-bottom read misses all three. So I built a measurement instrument that catches them, with a blind-solver at the center that turns 'is this feedback bad?' into 'can a student exploit it?' Then I gave it a golden set and a graduation test, so the human running it can measure when it's safe to stop checking by hand.

- **Checking generated learning content for structural defects**. [Structural simultaneity: designing cross-model evals that can't be faked](https://jdurey.github.io/work/structural-simultaneity/). Why most multi-model comparisons measure nothing, and the one design constraint that makes a cross-model eval actually carry weight.

- **Wiring a multi-source context layer agents can navigate**. [An operating system for my AI agents](https://jdurey.github.io/work/agent-context-federation/). A canonical router, a confidentiality firewall, and a cross-agent message bus, so every AI tool I use shares one context layer. No merging, no API keys.

Every one of these is a runnable harness with saved outputs on a public substrate (synthetic, NAEP/STAAR/OER-style, or fictional content). No proprietary data, no hand-waving. If the role is about trusting what a model tells you, the proof is already on the page.
