---
title: "Curriculum & grader-integrity benchmarks"
subtitle: "A fixed-fee eval sprint for teams shipping AI to real students."
slug: hire
publish: false
summary: "I run your live AI-tutoring, AI-lesson, or AI-grading product through runnable adversarial harnesses and hand you the ship-blockers before your district pilot does. Fixed fee. The harnesses are public, so you can watch them work before you pay."
description: "Fixed-fee AI-evaluation sprints for edtech: curriculum, grader, and judge integrity. Runnable harnesses, a regression suite you keep. $25k to $150k."
ctaLabel: "Book a 20-minute scope call"
ctaSubject: "Eval sprint: scope one failure class against our live product"
---

## The problem you already suspect

Your model is helpful, fluent, and confident. That's the trap. A tutor that sounds right while teaching the wrong thing, or a grader that passes a blank answer because the rubric leaked into the prompt, doesn't show up in your eval dashboard. It shows up in a district pilot, in front of the people who decide your renewal.

The failures that kill education pilots are specific and measurable.

- **Answer-leak (ARF):** the feedback hands the student the answer it was supposed to make them work for.
- **Ghost distractors (GDF):** the model rewards or penalizes options that aren't actually there.
- **Feedback-option mismatch (FOM):** the explanation doesn't match the option the student picked.
- **Pedagogical false-positives:** the model marks an answer correct for the wrong reason, so it can't teach.
- **Judge false-pass:** your LLM-as-judge approves bad output because it's grading its own family.

You can't fix what you can't see, and a generic eval suite won't surface any of these.

## What I do

I run your live product through a set of runnable, multi-model adversarial harnesses and hand you the ship-blockers before your pilot does. The harnesses are public, so you can watch them work before you pay.

- **[Feedback-integrity / grader-integrity](/work/feedback-integrity).** A blind-solver that catches answer-leak and feedback mismatch.
- **[Blind expert-parity](/work/expert-parity-harness).** Does the model match expert human judgment? Reported as κ-agreement and a blind A/B non-inferiority test, not a vibe.
- **[Judge-trust](/work/judge-trust).** Makes LLM-judge false-passes reproducible. The published proof of concept runs naive 5 percent, then self-enhancement plus 8 points, then cross-family zero.

## What you get

- A **failure taxonomy** for your product, with 20 to 50 tagged real examples, each rated by severity.
- **κ vs. an expert rubric**, plus answer-leak rate and depth-of-knowledge coverage findings.
- A **regression harness you keep**, so the same failure can't quietly come back after your next model swap.
- A **readout** your product, eval, and leadership teams can all act on. The full tier adds a day-3 dashboard.

## Pricing

Fixed fee. There's no hourly meter, no open-ended retainer, and no discovery-call tax.

| Tier | Scope | Price | Timeline |
|---|---|---|---|
| **Triage** | 20 examples, one failure class, written findings | **$25k** | 1 week |
| **Diagnostic sprint** | Full taxonomy + κ + answer-leak + the harness | **$75k** | 3 weeks |
| **Benchmark build** | Golden set + rubric + multi-model run + a regression harness your team owns | **$150k** | 6 weeks |

Payment is **50 / 25 / 25**. Half on deposit, a quarter at midpoint, a quarter on delivery. A CEO can approve the triage tier on a credit card, and the benchmark build is a standard SOW under a one-page MSA.

## Why me

I build the instruments that measure AI behavior, and I know the domain they're measured in. I did **K-8 curriculum and assessment QC at an AI-education company under NDA**, and I taught grades 3-6 and certified secondary social studies before that. Most eval engineers have never run a classroom. Most educators can't build a fail-closed multi-model harness. The work above is the overlap.

*The harnesses are method-from-synthetic and fully my own. No prior employer's content is used or required.*

## Next step

A 20-minute call to scope one failure class against your live product. If it's useful, the triage tier starts the same week.
