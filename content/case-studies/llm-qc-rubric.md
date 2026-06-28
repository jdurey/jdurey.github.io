---
title: "A practical QC framework for AI-generated curriculum and knowledge work"
slug: llm-qc-rubric
date: 2026-06-28
type: enablement
summary: "Most AI pilots fail because nobody defined what good output means before they shipped it. Used means nothing if you never set the bar. So I use a six-dimension rubric to QC anything a model writes, whether it's a lesson, a policy draft, or a customer reply. Each dimension has a concrete failing example, a pass condition, and a rule for when a human has to look. The last dimension is the one most rubrics skip: reviewer confidence, the honest signal for whether a person actually checked or just clicked approve."
status: "Working rubric I apply to AI-written content · pairs with a runnable harness that measures the same failures"
draft: false
featured: true
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/judge-trust"
repoLabel: "the harness behind the rubric"
---

Most AI content pilots fail at the same place, and the model is rarely the cause. What's missing is that nobody wrote down what "good" means before they started shipping. The team generates a hundred lessons, or policy drafts, or support replies, somebody skims a few, the rest go out, and "we're using AI now" stands in for "the output is reliable." Those are different claims. A usage number can't tell you whether the work is sound.

So before any AI-written content ships, I score it against a fixed rubric. Six dimensions, each with a concrete way it fails, a condition that counts as a pass, and a rule for when a human has to be in the loop. It works the same whether the artifact is a unit of curriculum, an internal policy, or a knowledge-base article, because the failure modes are the same family. Here it is.

## The six dimensions

### 1. Factuality

**Fails when:** the content states something false, cites a source that doesn't say what's claimed, or gets a number, date, or definition wrong.

**Passes when:** every checkable claim is correct and every citation actually supports the sentence it's attached to.

**Human rule:** any claim a reader would act on, dose, deadline, legal threshold, prerequisite, gets verified by a person against the actual source document.

### 2. Usefulness

**Fails when:** it's accurate and useless, technically correct, generically padded, and it doesn't move the reader toward the thing they came to do.

**Passes when:** a reader in the target role could take the next action from it without going somewhere else first.

**Human rule:** the reviewer reads it *as the end user*, not as an editor. Correct-but-hollow is the most common way good-looking AI content fails in the field.

### 3. Tone and register

**Fails when:** the voice is wrong for the audience, too casual for a compliance notice, too stiff for a welcome email, or it slides into the flat AI cadence that signals nobody owned the words.

**Passes when:** it reads like it came from the organization, in the register the moment calls for.

**Human rule:** anything customer-facing or public gets a human voice pass. Internal drafts can clear on a lighter check.

### 4. Standards alignment

**Fails when:** it ignores the framework it's supposed to serve, a learning standard, a brand guideline, a regulatory requirement, a style guide, or claims alignment it doesn't have.

**Passes when:** it maps to the specific standard by name, and the mapping holds when you check it.

**Human rule:** the person who owns the standard signs off on the mapping. A model asserting "this meets standard X" is a claim to verify before you rely on it. I built a [separate harness](/case-studies/judge-trust) around exactly this failure, a model waving through work it shouldn't.

### 5. Hallucination risk

**Fails when:** it invents a citation, a feature, a policy, a statistic, or a quotation, and states it with the same confidence as the true parts.

**Passes when:** every specific, named, or numeric claim traces to something real, and the genuinely uncertain parts are marked as uncertain instead of smoothed over.

**Human rule:** the riskier the surface, the lower the tolerance. A blog intro can carry some looseness. A medical instruction or a legal term carries none, and those route to a human every time regardless of how confident the draft sounds.

### 6. Reviewer confidence

This is the dimension most rubrics skip, and it's the one that tells you whether the other five happened.

**Fails when:** the reviewer can't say *why* they approved it, "looks fine" with no basis, which usually means they skimmed and clicked.

**Passes when:** the reviewer can name what they checked and how, and rates their own confidence, high, medium, or needs-a-second-look, on the record.

**Human rule:** anything marked medium or below gets a second reviewer before it ships. The confidence rating is the honest signal. A rubric without it measures the content but never measures whether anyone actually applied the rubric.

## Why the last dimension is load-bearing

The first five score the artifact. The sixth scores the review. Skip it and you get the failure I see most often: a team adopts a careful rubric, and within a month "review" has decayed into approving whatever the model produced, because there was never a signal for whether a person engaged or rubber-stamped. Logging confidence makes the skim visible. It's a small thing that decides whether the whole QC layer is real or decorative.

## The rubric and the instrument are the same idea

This rubric is the human-facing version of a measurement problem I've also built in code. When the checker is itself a model, the same question applies, how often does it pass work that's actually broken, and you can't answer it with a vibe. So I built [an instrument that measures it](/case-studies/judge-trust): it breaks content in known ways with no model near the labels, has independent vendors grade it blind, and reports the false-pass rate. A single judge waved through five percent of work I'd broken on purpose. Requiring two independent vendors to agree drove that to zero.

The rubric is what a person uses. The harness is how you check whether the rubric, or the model running it, can be trusted to hold the line when you're not watching. Same discipline, two altitudes: define what good means, then prove the thing enforcing it actually catches the bad.
