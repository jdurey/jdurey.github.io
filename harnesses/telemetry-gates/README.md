# Telemetry-Gates Harness

**Three failures an LLM pipeline rarely logs: silent cutoffs, token tax, and slow tails.**

I pulled a month of my own API logs across 88,000 calls, where only seven calls had thrown a hard error. Even so, one model was cutting off 5.7% of its replies mid-sentence (`finish_reason = length`), eight models were spending 83% to 95% of their output tokens on hidden thinking, and one host had hit an 89-second p95 wait.

This tool runs three fast checks on log columns alone (`finish_reason`, `tokens_reasoning`, `tokens_completion`, and `generation_time_ms`). It makes zero model calls and reads zero prompts. Read the full study in [`content/case-studies/telemetry-gates.md`](../../content/case-studies/telemetry-gates.md). Check file hashes in [`MANIFEST.md`](MANIFEST.md).

## Run it

```bash
node generate.mjs
node gate.mjs
node score.mjs
node manifest.mjs
```

Everything runs on your laptop in seconds with no API keys and no net access.

## The three checks

- **Cutoff check (`cutoff`)** reads `finish_reason` and flags any model that is over a 1% `length` cutoff rate (`sable-9b` is near 6%).
- **Token-tax check (`reasoning_tax`)** compares `tokens_reasoning` to `tokens_completion` and flags any model that is over 90% (`quill-120b` is near 93%).
- **Tail check (`latency_tail`)** reads `generation_time_ms` and flags any host whose p95 is over 30s or 8x its own median (`NimbusServe`).

Because these gates only read log counts, you can run them on locked systems where prompt text stays private.

## Ground truth by build

`generate.mjs` builds six fake models across four fake hosts and plants three known flaws. `score.mjs` checks for an exact match against [`golden/expected.json`](golden/expected.json) with zero misses and zero extra flags. All three gates pass (`verdict: PASS`).

## Related Book, Video Course & Benchmarks

- **Print Book ($24.99 on Amazon).** [*AI for Corporate Training & Instructional Design: The UbD Glass-Box Playbook*](https://www.amazon.com/dp/B0HRQFWFPR) is live in print.
- **65-Min Video & Code-Lab Course ($12.99 through Dec 15, Reg. $69.99).** [*AI Corporate Training: UbD SOP-to-SCORM & Video Factory*](https://www.udemy.com/course/ai-corporate-training-ubd-sop-to-scorm-video-factory/?couponCode=MASTER2026_SCORM) walks through the code lab.
- **40-Question Scenario Exam ($12.99 through Dec 15).** [*Production LLM Evals & Multi-Agent Ops Practice Exams*](https://www.udemy.com/course/production-llm-evals-multi-agent-ops-practice-exams/?couponCode=LAUNCH2026_EVALS) tests routing and grading gates.
- **Instant Code Kits.** Grab the [SOP-to-SCORM Factory ($99)](https://whop.com/checkout/plan_y1ACgqNYGtul8/) or the [Enterprise AI Eval & 6-Rung Router Kit ($79)](https://whop.com/checkout/plan_lGsdWjQsePkvO/) on Whop.
- **Live AI Video Twin & 56 Open Studies.** Browse all 56 benchmarks at [jdurey.github.io](https://jdurey.github.io) or run live Q&A on the [AI video twin](https://jdurey.github.io/interview/) page.
