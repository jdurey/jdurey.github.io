---
title: "How I audit a team's workflow for AI readiness"
slug: ai-workflow-audit
date: 2026-06-28
type: enablement
summary: "Most AI pilots fail before a model is ever chosen, because nobody mapped where the work actually slows down. So I run a fixed audit. I trace one workflow end to end, find the single step where the queue backs up, decide which part a model should draft and which part a human keeps, and name the one metric that proves it worked without quality sliding. Here it is on a worked example: a twelve-person customer-operations team where the real bottleneck wasn't writing replies, it was deciding which reply to write."
status: "Repeatable audit method · worked on a representative example · the same pass I run before recommending any tool"
draft: false
featured: true
---

Most AI pilots fail before anyone picks a model. A team buys a tool, points it at the busiest-looking task, and three months later the dashboard says it's being used and nobody can say what got better. The miss is almost always upstream. Nobody mapped where the work actually slows down, so the model got dropped on a step that was never the constraint.

So I don't start with a tool. I start with one workflow and a stopwatch. This is the audit I run before I recommend anything, on a worked example so you can see the moves.

## The team

A twelve-person customer-operations team at a mid-size software company. They handle inbound requests, billing questions, account changes, the occasional angry escalation. Leadership wanted to "add AI to support" and assumed that meant a bot writing replies. That assumption was the thing I was there to test before building anything.

## Step one: map the workflow as it really runs

I trace one request from arrival to resolution and write down every hand-off as it actually happens, which is rarely the version written in the process doc. For this team it looked like this:

| Step | Who | Time |
|---|---|---|
| Request lands in shared inbox | — | — |
| Agent reads it, figures out what it actually is | agent | ~6 min |
| Agent hunts for the right account + policy | agent | ~9 min |
| Agent writes the reply | agent | ~5 min |
| Agent sends | agent | ~1 min |

The story everyone tells about their own workflow is rarely where the time goes. Leadership was sure the writing was the slow part. The map said otherwise.

## Step two: find the one step where the queue backs up

There's almost always a single constraint, the step where work piles up waiting. You find it by looking for where the queue is deepest, which is often nowhere near where the task feels hardest.

Here it was the second and third steps: working out what a request actually is, then finding the account and the policy that governs it. Fifteen of the roughly twenty-one minutes per request went to figuring out *which problem this is* and *what the rule is*, before a single word of reply got written. Writing, the part leadership wanted to automate, was the fast part.

This is the most common inversion I find. The visible task looks like the bottleneck because it's the part you watch a person do. The real constraint is the invisible decision work feeding it.

## Step three: split the step into draft-work and judgment-work

Once you know the constraint, you cut it in two. One half is pattern-matching, the rote recognition work a model is genuinely good at and a person finds tedious. The other half is judgment that carries risk, and that half stays human.

For the triage step, classifying the request type and pulling the candidate account and policy is retrieval and pattern-matching. A model drafts that: *this looks like a billing dispute on account X, governed by policy Y, here are the three relevant facts.* What the model does **not** do is decide. It hands the agent a labeled starting point, and the agent confirms the call in seconds instead of reconstructing it from scratch in minutes.

## Step four: place the human checkpoint where the cost of a miss is real

The checkpoint goes where a wrong answer actually hurts, and the rule is fail-closed: anything the model is unsure about, or anything above a risk line, routes to a person by default.

This team's risk line was money and accounts. A drafted classification is cheap to be wrong about, the agent catches it on read. So the model drafts freely there. But any action that moves money, closes an account, or touches a flagged customer goes to a human every time, no confidence score high enough to skip it. The model speeds up the reversible decision and never makes the irreversible one.

## Step five: name the one metric, with a guardrail so speed can't hide damage

A single number proves it worked, and a second number proves it didn't work by getting faster and worse. You need both, because the easy way to cut handle time is to lower quality and not notice.

- **Primary:** median time-to-resolution per request. The audit predicted the fifteen-minute triage block compresses to roughly four, since the agent is confirming a draft instead of building from nothing.
- **Guardrail:** reopen rate, the share of "resolved" requests the customer comes back on. If resolution gets faster and reopens climb, the model is producing confident wrong drafts and the agents are rubber-stamping them. That pairing kills the rollout, on purpose.

I won't report a speed win unless the guardrail holds flat. A faster workflow that degrades is a worse outcome than the slow one, because now it's wrong at scale.

## Why the audit comes before the tool

Notice that I got four steps deep before any model or vendor entered the picture. That's the point. If this team had bought a reply-writing bot, they'd have automated the five-minute step and left the fifteen-minute one untouched, and the pilot would have "worked" while the queue stayed exactly as deep. The audit is what turns "add AI to support" into a specific intervention on the specific step that's actually slow, with a human holding the decisions that matter and a number that can tell the truth about whether it helped.

The example here is invented to keep it clean, but the five moves are the real method: map it as it runs, find the constraint, split draft-work from judgment, place the checkpoint where a miss is expensive, and name a metric that can't be gamed by going faster. You pick the tool last, once you know the step and the gate.
