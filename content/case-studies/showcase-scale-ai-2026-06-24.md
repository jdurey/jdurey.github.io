---
title: "What Scale AI's Evals Engineer, Applied AI actually needs — and the proof I've already shipped"
slug: showcase-scale-ai-2026-06-24
date: 2026-06-24
type: method
summary: "A Evals Engineer, Applied AI role at Scale AI maps cleanly onto evaluation work I've already published. This page links the role's core skills to runnable, public harnesses — starting with Can you trust the model that grades your content? Measuring when an AI judge waves through broken work."
status: "Job-targeted showcase · maps a live role to real, runnable proof · auto-generated, 24h-veto reviewed"
draft: false
featured: false
showcase: true
job_company: "Scale AI"
job_link: "https://scale.com/careers/4629589005"
voiced: "voiced"
---
An Evals Engineer, Applied AI role at Scale AI is asking for someone who can measure whether an AI system is actually doing what it claims, not just whether it runs. That is the work I have been building in public. Below: the role's core, mapped to harnesses I have already shipped and can run on a call.

## The role, mapped to real proof

- **Measuring when an automated judge waves through broken work**. [Can you trust the model that grades your content? Measuring when an AI judge waves through broken work](https://jdurey.github.io/work/judge-trust/). Teams now use an LLM to QC the content another LLM wrote. The risk is that the judge passes work that's actually broken, and it gets more lenient when it grades its own output. So I built a fully-automated instrument that measures exactly that. It breaks items in known ways, with no model anywhere near the labels, then asks four different vendors' models to grade them blind. A single judge waved through 5 percent of the items I broke on purpose, and the rate ran higher when a model judged its own work. Making four independent vendors agree before a pass drove the miss rate to zero.

- **Calibrating a metric against a human-labeled golden set**. [Calibrating an eval-design gate against 130 candidates](https://jdurey.github.io/work/golden-set-calibration/). Building a self-hardening gate to separate load-bearing eval designs from decorative ones, and the surprise that the gate out-discriminated the thing generating the candidates.

- **A runnable, public proof of the core method**. [Measuring feedback integrity: a blind-solver that catches AI explanations leaking the answer](https://jdurey.github.io/work/feedback-integrity/). When an AI writes the wrong-answer feedback for a quiz item, it tends to fail in three ways that are easy to miss. It teaches the key instead of the error, it invents a concept that isn't on the screen, or it explains a different option than the one it's attached to. A top-to-bottom read misses all three. So I built a measurement instrument that catches them, with a blind-solver at the center that turns 'is this feedback bad?' into 'can a student exploit it?' Then I gave it a golden set and a graduation test, so the human running it can measure when it's safe to stop checking by hand.

Each of these is a runnable harness with saved outputs on a public substrate (synthetic, NAEP/STAAR/OER-style, or fictional content). No proprietary data. No hand-waving. If the role is about trusting what a model tells you, the proof is already on the page.
