---
title: "Grading against nothing: two defects in an open-source AI grader"
slug: grading-against-nothing
date: 2026-06-19
type: red-team
summary: "An open-source AI grading platform trims its prompt to fit the token budget by dropping the rubric, the problem, and the reference solution, but never the student's answer. So a student can size their submission to make the grader run against no criteria at all. I found it, proved it without an LLM, and patched it."
status: "Disclosed privately via GitHub Security Advisory · held pending maintainer acknowledgment"
repo: "https://github.com/jdurey/edutelligence-integrity-audit"
repoLabel: "audit + runnable PoCs"
draft: true
featured: true
---

A grader's whole job is to compare an answer against the criteria. So I went looking for the case where the criteria quietly disappear and the grader keeps going anyway. In an open-source AI assessment platform used to suggest grades on student work, I found exactly that. There are two. One of them lets a student make the grader assess their answer against nothing, and the human reviewing it gets no signal at all.

This is one piece in a series on whether you can trust an AI grader. This one checks the harness, the code that assembles the grading prompt. My [feedback-integrity harness](/case-studies/feedback-integrity) checks the author that writes the content, [judge-trust](/case-studies/judge-trust) checks the checker that grades it, and [verdict-integrity](/case-studies/verdict-integrity) checks whether that checker returns the same verdict twice.

## The one that matters

The platform sends the grading prompt to an LLM, and before it does, it checks whether the prompt fits the token budget. When the prompt is too long, it trims to fit. The trimming logic walks a list of features it's allowed to drop and replaces each with the literal string `"omitted"` until the prompt is small enough. For graded feedback, that droppable list is the example solution, the problem statement, and the grading instructions. In plain terms, that's the rubric, the question, and the answer key.

The student submission is not on the list. So it never gets trimmed.

That asymmetry is the whole bug. The submission length is fully controlled by the student. So a student can write an answer long enough that, to make room, the system drops all three of those, replaces each with `"omitted"`, and then runs the grader anyway and returns credits. The grader graded against nothing. And the omission is recorded only under a debug flag, so the human tutor reviewing the suggestion sees a normal-looking grade with no indication that the criteria were gone.

## Proving it without an LLM

A vulnerability you've only read is a hypothesis. So I built a proof of concept that doesn't need the model, the platform, or a network. It reproduces the omission logic verbatim, the same token counter and the same trimming loop, against a synthetic exercise, and sweeps the submission size.

| Submission size | What happens |
|---|---|
| ~2,916 tokens | Grader runs. Rubric, problem, and solution all `"omitted"`. Returns credits, having graded against nothing. |
| ~2,973 tokens and up | Grader silently skips. No feedback at all. |

That's two distinct integrity failures from one knob the attacker already holds. Below the line the grader runs blind. Above it the grader refuses to run. Both are invisible to the reviewer. And the PoC is deterministic, so anyone can run it and watch the same thing happen.

## The smaller one

While I was in there I checked the sibling service's HTTP routes. Every endpoint declares the same auth dependency except one, which ships with no authentication at all. An unauthenticated caller who can reach the host can enumerate the configured pipeline variants for every feature, and from that infer which model capabilities the deployment has wired up. It's lower severity, configuration disclosure rather than student data, but it's the kind of thing that should never have made it past a consistency check. Sixteen routes are guarded and one isn't.

## The fix

For the graded-blind defect, the grader has to fail closed. I added a notion of critical features, the criteria-bearing ones, that are never allowed to be omitted. If the prompt can only be made to fit by dropping the rubric or the solution, the run does not proceed. A human can notice a grade that never happened. A human can't notice a confident grade that ran against no criteria. The missing-auth route gets the one dependency every sibling already had. Both fixes are small, and both ship as patches with the disclosure.

## How I'm handling it

These are real defects in software people actually run, so they went through responsible disclosure first. Filed privately as GitHub Security Advisories with the patches attached, held from publication until the maintainers have had a fair window to respond. It's the same discipline I hold my own publish gate to. Finding the bug is the easy half. The half that earns trust is what you do with it before you say a word in public.

What makes this one worth writing up is how little it takes. There's no malformed input, no injection, no auth bypass. All it takes is an answer long enough to push the rubric out of the budget. The failure was sitting in the most ordinary path a student takes, and the only thing standing between it and a wrong grade was a list that left one item off.
