---
title: "Three failures your LLM pipeline never logs: gates for truncation, reasoning tax, and latency tails"
slug: telemetry-gates
date: 2026-07-31
type: eval
summary: "I aggregated a month of my own API telemetry, 88,000 calls, and found three failure classes that raise no exception anywhere. One model silently truncated 5.7% of its responses. Eight models spent 83 to 95 percent of their completion tokens on reasoning nobody reads. Providers serving comparable models ranged from 1.1s to 20s median latency, with one tail hitting 89 seconds. So I built three deterministic gates that run on telemetry alone, and tested them against a synthetic fleet with defects planted by construction. The gate is correct when it finds every planted defect and nothing else."
status: "Complete · reproducible harness, no model calls, telemetry only"
repo: "https://github.com/jdurey/jdurey.github.io/tree/main/harnesses/telemetry-gates"
repoLabel: "harness + synthetic fleet"
draft: false
---

At the end of July I pulled a month of my own API activity, 88,000 calls across a dozen models, and went looking for failures. Not the loud kind. Every error-shaped field in the export was nearly empty: seven hard errors out of 88,000. By the usual definition my pipelines were healthy. Then I aggregated the columns, and three real problems surfaced that had never raised an exception anywhere.

First, silent truncation. A `finish_reason` of `length` means the model hit its token ceiling mid-thought and the response is amputated. My export had 324 of those. One model truncated 5.7% of everything it returned. Nothing downstream failed, because a cut-off response still parses, still gets consumed, and still looks like an answer. A pipeline that ignores this column ships one incomplete output per twenty calls and never knows.

Second, the reasoning tax. Reasoning models bill their deliberation as output tokens. Across eight models in my fleet, 83 to 95 percent of completion tokens were chain-of-thought that no one reads. On some tasks that deliberation buys real accuracy. On bulk extraction it's pure overhead, and at output rates it's the expensive kind. Either way you should know the number, and I had never measured mine.

Third, latency tails. Providers serving comparable models ranged from 1.1 seconds to 20 seconds at the median, and one provider's 95th percentile reached 89 seconds. Routing on list price alone had put a slow provider in a hot path.

## Three gates, telemetry only

None of this needs a model call to detect. It needs the discipline of checking. So the instrument is three deterministic gates over generation metadata, the columns any router export already has: `finish_reason`, `tokens_reasoning`, `tokens_completion`, `generation_time_ms`.

- **Truncation gate.** Flag any model whose `length` rate exceeds 1% over a minimum sample.
- **Reasoning-tax gate.** Flag any model spending more than 90% of completion tokens on reasoning.
- **Tail gate.** Flag any provider whose p95 exceeds 30 seconds, or runs past eight times its own median.

A gate that reads only telemetry has a property I care about a lot: you can run it on a pipeline whose content you are not allowed to see. No prompts, no outputs, no data-handling questions. Metadata in, findings out.

## Proving the gate itself

A checker you haven't tested is just a hope with thresholds. The harness ships with a synthetic fleet of six fictional models on four fictional providers, and the generator plants exactly three defects by construction: one model that truncates about 6% of responses, one that spends 93% of its tokens reasoning, one provider with a pathological tail. Ground truth is constructible, because the defect is true only where the generator put it. The self-test then demands an exact set match. Miss a planted defect and recall failed. Flag a clean model and precision failed. Either one fails the run.

On the current build the verdict is PASS: all three planted defects flagged, zero missed, zero extra. That one line is the deliverable. The thresholds are arguments you can change; the proof that the checker catches what it claims to catch comes along with it.

This is the same discipline as the rest of my harness series, pointed at operations instead of content. My [verdict-integrity](/case-studies/verdict-integrity) instrument asks whether a grader holds its verdict. This one asks whether the plumbing under every grader, author, and judge is losing data, burning spend, or stalling, and turns each answer into a number you can gate a deploy on.

Everything runs locally in seconds with no API keys: `node generate.mjs`, `node gate.mjs`, `node score.mjs`. The manifest pins every file by hash.
