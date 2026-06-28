---
title: "From raw input to reviewed output: an AI workflow that checks itself before a human sees it"
slug: agentic-workflow-demo
date: 2026-06-28
type: enablement
summary: "A model that writes a draft is the easy part. The hard part is the wrap-around: taking messy input, producing a draft, scoring that draft against a rubric, flagging what's risky, and routing it to the right human instead of dumping everything on one reviewer. So I built that pipeline. Five stages, fail-closed, and the design choice that matters is that the model never decides whether its own work is good enough to ship, the rubric and the routing rules do."
status: "Working pipeline design · five stages, fail-closed routing · the runnable version of the audit and the rubric"
draft: false
featured: true
---

Anyone can get a model to write a draft. That's a single prompt, and it's been a solved problem for a while. The part that decides whether an AI workflow survives contact with a real team is everything wrapped around the draft: where the messy input comes in, how the draft gets checked before a person trusts it, what happens to the risky cases, and who actually sees what. Skip that wrap-around and you've built a faster way to generate work nobody can vouch for.

So I built the wrap-around. This is a pipeline that takes raw input, drafts, checks itself against a rubric, flags risk, and routes to a human, and the whole point is the order of those steps and what's allowed to skip a person.

## The five stages

### 1. Intake: normalize the mess

Real input is messy, a forwarded email thread, a half-filled form, a voice note transcript, a pile of bullet points. The first stage doesn't draft anything. It extracts the structured facts the rest of the pipeline needs and flags what's missing. A request with no account number, a lesson topic with no grade level, a ticket with no clear ask, gets caught here and kicked back before a single token is spent writing a confident draft on top of a hole.

### 2. Draft: generate against a spec

Now the model drafts, working from the structured intake and an explicit spec of what this output is supposed to be. This is where most one-prompt tools start and stop. Here it's the middle step, because the draft feeds the checks before anyone calls it finished.

### 3. Check: score the draft against the rubric

The draft gets scored against [the six-dimension rubric](/case-studies/llm-qc-rubric), automatically: factuality, usefulness, tone, standards alignment, hallucination risk. Each dimension returns a pass, a fail, or an uncertain, with the specific reason attached. A draft that fails any hard dimension never advances, it goes back to stage two with the failure noted, or straight to a human if it fails twice.

The rule I hold here is the one from my [judge work](/case-studies/judge-trust): the model checking the draft is not the same instance that wrote it, and on the dimensions that carry real risk, agreement is required before anything counts as a pass. A model grading its own output is measurably easier on itself. The pipeline doesn't let it.

### 4. Flag: surface risk instead of burying it

Whatever the checks couldn't clear, an uncertain factual claim, a number with no source, a tone that's off for the audience, gets surfaced as an explicit flag attached to the draft. Not smoothed over, not silently dropped. The human who receives this gets the draft *and* a short list of exactly what to look at, so a five-minute review goes to the three sentences that need eyes instead of a full re-read of work that's mostly fine.

### 5. Route: send it to the right person, fail-closed

The last stage decides who sees it, and this is the stage that makes the whole thing safe. Clean drafts with high check scores and no risk flags route to a light review queue. Anything with a hard-dimension flag, a high-risk surface, or low confidence routes to the senior reviewer by default. And the default is fail-closed: when the pipeline isn't sure where something should go, it routes *up*, never out. Nothing ships on the model's own confidence alone.

## The one rule the whole design protects

The model never decides whether its own work is good enough to ship. It drafts, and it helps check, but the gate, the rubric thresholds and the routing rules, lives outside the model and is the same every time. That's the difference between a workflow you can hand to a team and a clever demo. A demo trusts the model to know when it's wrong. A workflow assumes it won't, and builds the catch in.

## How the three pieces fit

This pipeline is the runnable end of the other two things I've written up. The [workflow audit](/case-studies/ai-workflow-audit) is how you find the step worth building this around, the real constraint that's usually buried under the loudest-looking task. The [QC rubric](/case-studies/llm-qc-rubric) is the standard stage three enforces. This is the machine that runs the standard on the step the audit found, and routes the judgment calls to the people who should be making them.

Adoption was never really about the model. What decides it is whether the team can trust the output without re-doing it, and whether the right person sees the right risk at the right moment. That trust is a thing you build into the workflow, one stage at a time, with a human holding the decisions that matter and a gate the model isn't allowed to move.
