---
title: About
---

I design and stress-test how AI systems get measured. My work sits at the intersection of **AI evaluation, LLM quality, and red-teaming** — building harnesses that catch real model failures, calibrating the gates that decide whether an eval is trustworthy, and applying large language models to high-stakes domains like education and assessment where being wrong has a cost.

I came to evaluation the practical way: by building enough AI systems that I learned not to trust them until I'd instrumented them. That habit — *don't assert the safe path exists, watch it hold* — is the through-line in everything here.

## What I do

- **Adversarial eval design.** Harnesses that elicit specific failure behaviors — instruction-hierarchy collapse, spec-compliance drift, refusal miscalibration — and rank models by where they break, under identical live conditions. ([The method](/work/structural-simultaneity/).)
- **Eval-of-the-eval.** Calibrating model-graded and gate-based evaluation so it discriminates instead of flattering its author. ([How I calibrated one](/work/golden-set-calibration/).)
- **LLM quality & red-team.** Finding the inputs that make a model do the wrong thing, reproducibly, and writing it up so a team can act on it.
- **Applied AI in education.** Years of putting LLMs to work on curriculum and assessment at scale — the domain that taught me how quickly model quality problems become real-world problems.

## How I work

- **Instrument, don't assert.** A guardrail you haven't watched fail closed is a guess.
- **Reproducible or it didn't happen.** Every result links to runnable code.
- **Cheap tier for volume, strong tier for judgment.** Most eval cost is wasted on the wrong tier.
- **Boring is beautiful.** The least machinery that works, every time.

## Recent work

A [five-model, 28-scenario instruction-hierarchy collapse audit](/work/instruction-hierarchy-audit/): does an instruction hidden in the content a model processes override its actual task? The deployed frontier agents held the line; a popular self-hosted model collapsed 1-in-5, and the sophisticated reframes are what broke it. Reproducible harness, honest grader, raw responses published. This site regenerates every night, so the changelog is the real-time record.

## Working together

I'm open to **remote roles — full-time or fractional — in AI evaluation, LLM quality, red-teaming, and applied-AI**, and to focused consulting engagements. If you're standing up an evaluation function and want it to actually discriminate, that's exactly my lane.

- **Email:** [josh.durey@gmail.com](mailto:josh.durey@gmail.com)
- **GitHub:** [github.com/jdurey](https://github.com/jdurey)
