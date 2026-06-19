---
title: About
---

I design and stress-test how AI systems get measured. My work sits across AI evaluation, LLM quality, and red-teaming. I build harnesses that catch real model failures, I calibrate the gates that decide whether an eval is trustworthy, and I put large language models to work in places like education and assessment, where being wrong has a cost.

I came to evaluation the practical way. I built enough AI systems that I learned not to trust them until I'd instrumented them. So the habit underneath everything here is simple. Don't assert the safe path exists. Watch it hold.

## What I do

- **Adversarial eval design.** Harnesses that pull a specific failure out of a model, like instruction-hierarchy collapse or spec-compliance drift, and rank models by where they break on identical inputs. Here's [the method](/work/structural-simultaneity/).
- **Eval of the eval.** Calibrating model-graded and gate-based evaluation so it actually discriminates instead of flattering the person who wrote it. Here's [how I calibrated one](/work/golden-set-calibration/).
- **LLM quality and red-team.** Finding the inputs that make a model do the wrong thing, reproducibly, and writing it up so a team can act on it.
- **Applied AI in education.** Years of putting LLMs to work on curriculum and assessment at scale. That's the domain that taught me how fast a model quality problem becomes a real-world problem.

## How I work

- I instrument, I don't assert. A guardrail you haven't watched fail closed is a guess.
- If it isn't reproducible, it didn't happen. Every result links to runnable code.
- Cheap tier for volume, strong tier for judgment, because most eval cost gets wasted on the wrong tier.
- The least machinery that works, every time.

## Recent work

A [five-model, 28-scenario instruction-hierarchy collapse audit](/work/instruction-hierarchy-audit/). Does an instruction hidden in the content a model reads override its real task? The deployed frontier agents held the line. A popular self-hosted model collapsed one time in five, and the clever reframes are what broke it. Reproducible harness, honest grader, raw responses published. This site regenerates every night, so the changelog is the real-time record.

## Working together

I'm open to remote roles in AI evaluation and red-teaming, full-time or fractional. I'm open to focused consulting too. So if you're standing up an evaluation function and you want it to actually discriminate, that's my lane.

- **Email:** [josh.durey@gmail.com](mailto:josh.durey@gmail.com)
- **GitHub:** [github.com/jdurey](https://github.com/jdurey)
